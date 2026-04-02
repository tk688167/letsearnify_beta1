"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateReferralCode, generateMemberId } from "@/lib/mlm"
import { generateOTP, sendVerificationEmail } from "@/lib/email"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = (formData.get("email") as string).toLowerCase().trim()
  const password = formData.get("password") as string
  const country = formData.get("country") as string
  const referralCodeInput = formData.get("referralCode") as string

  if (!name || !email || !password) {
    return { error: "All fields are required", success: false }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address.", success: false }
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      if (!existing.emailVerified) {
        await prisma.user.delete({ where: { id: existing.id } })
      } else {
        return { error: "Email already exists", success: false }
      }
    }

    // Validate referral code
    let validReferrer = null
    let validReferredByCode = null
    
    if (referralCodeInput) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCodeInput }
      })
      if (referrer) {
        validReferrer = referrer
        validReferredByCode = referralCodeInput
      }
    }

    // Fallback to COMPANY
    if (!validReferrer) {
        let companyReferrer = await prisma.user.findUnique({
            where: { referralCode: 'COMPANY' }
        })
        if (!companyReferrer) {
            try {
                companyReferrer = await prisma.user.create({
                    data: {
                        memberId: "0000000", name: "LetsEarnify Company",
                        email: "system@letsearnify.com",
                        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10),
                        referralCode: "COMPANY", role: "ADMIN", isActiveMember: true,
                        tier: "EMERALD", tierStatus: "CURRENT", arnBalance: 0,
                        activeMembers: 0, totalDeposit: 0.0, emailVerified: new Date(),
                    }
                })
            } catch (e) { console.error("[Register] COMPANY user create failed:", e) }
        }
        if (companyReferrer) {
            validReferrer = companyReferrer
            validReferredByCode = 'COMPANY'
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
        attempts++
        const newReferralCode = generateReferralCode()
        const newMemberId = generateMemberId()
        
        try {
            // Grant signup bonus immediately at signup based on referrer's tier
            let signupBonusArn = 0;
            let signupBonusUsd = 0;
            let referrerTier = "NEWBIE";
            
            if (validReferrer && validReferrer.referralCode !== 'COMPANY') {
                referrerTier = validReferrer.tier || "NEWBIE";
                const SIGNUP_BONUS_RATES: Record<string, number> = {
                    NEWBIE: 5, BRONZE: 6, SILVER: 7, GOLD: 8,
                    PLATINUM: 9, DIAMOND: 10, EMERALD: 15
                };
                signupBonusArn = SIGNUP_BONUS_RATES[referrerTier] || 5;
                signupBonusUsd = signupBonusArn / 10;
            }

            const newUser = await prisma.user.create({
              data: {
                memberId: newMemberId,
                name, email,
                password: hashedPassword,
                emailVerified: null,
                country: country || null, 
                referralCode: newReferralCode,
                referredByCode: validReferredByCode, 
                tier: "NEWBIE", tierStatus: "CURRENT",
                arnBalance: signupBonusArn,
                balance: signupBonusUsd,
                activeMembers: 0,
                totalDeposit: 0.0,
                isActiveMember: false
              }
            })

            if (signupBonusArn > 0) {
               await prisma.transaction.create({
                 data: {
                    userId: newUser.id,
                    amount: signupBonusUsd,
                    arnMinted: signupBonusArn,
                    type: "SIGNUP_BONUS",
                    status: "COMPLETED",
                    method: "SYSTEM",
                    description: `Signup bonus: ${signupBonusArn} ARN (referrer tier: ${referrerTier})`
                 }
               })
               await prisma.mLMLog.create({
                 data: {
                    userId: newUser.id,
                    type: "SIGNUP_BONUS",
                    amount: signupBonusArn,
                    description: `Received ${signupBonusArn} ARN signup bonus (referrer: ${referrerTier} tier)`
                 }
               })
            }

            // Create referral tree
            let advisorId = null, supervisorId = null, managerId = null

            if (validReferrer) {
               advisorId = validReferrer.id
               const referrerTree = await prisma.referralTree.findUnique({
                  where: { userId: validReferrer.id }
               })
               if (referrerTree) {
                  supervisorId = referrerTree.advisorId 
                  managerId = referrerTree.supervisorId 
               }
            }

            await prisma.referralTree.create({
               data: { userId: newUser.id, advisorId, supervisorId, managerId }
            })

            // Check tier upgrade for referrer (new signup counts toward their tier)
            if (validReferrer && validReferrer.referralCode !== 'COMPANY') {
                try {
                    const { checkTierUpgrade } = await import("@/lib/mlm")
                    await checkTierUpgrade(validReferrer.id)
                } catch (e) { console.warn("[Register] Tier check failed:", e) }
            }

            // OTP
            const otp = generateOTP()
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
            await prisma.emailVerificationToken.create({
              data: { userId: newUser.id, token: otp, expiresAt }
            })
            await sendVerificationEmail(email, otp)

            console.log(`✅ Registered: ${email} | Ref: ${validReferredByCode} | Bonus applied`)
            return { error: null, success: true, email }

        } catch (err: any) {
            if (err.code === 'P2002') {
                const target = err.meta?.target
                if (target && (target === 'User_email_key' || target.includes('email'))) {
                    return { error: 'Email already exists', success: false }
                }
                if (target && (target.includes('referralCode') || target.includes('memberId'))) {
                     continue
                }
            }
            console.error("Registration Error:", err)
            return { error: 'Something went wrong. Please try again.', success: false }
        }
    }

    return { error: "Failed to generate unique credentials. Please try again.", success: false }
  } catch (err: any) {
    console.error("Registration Error:", err)
    return { error: err?.message?.includes("Prisma") ? "Database error. Try again later." : (err?.message || "An unexpected error occurred."), success: false }
  }
}