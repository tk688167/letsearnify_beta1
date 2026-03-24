"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateReferralCode, generateMemberId } from "@/lib/mlm"
import { generateOTP, sendVerificationEmail } from "@/lib/email"

// ── Signup Bonus Rates (ARN given to NEW USER based on REFERRER's tier) ──
// Per PDF: The signup bonus is given to the new user (invitee), NOT the inviter.
// These are ARN tokens, NOT USD. (10 ARN = 1 USD)
const SIGNUP_BONUS_RATES: Record<string, number> = {
  NEWBIE:   5,
  BRONZE:   6,
  SILVER:   7,
  GOLD:     8,
  PLATINUM: 9,
  DIAMOND:  10,
  EMERALD:  15
};

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
        console.log("[Register] Cleaning up unverified stale account:", email)
        await prisma.user.delete({ where: { id: existing.id } })
      } else {
        return { error: "Email already exists", success: false }
      }
    }

    // Validate Referral Code
    let validReferrer = null;
    let validReferredByCode = null;
    
    if (referralCodeInput) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCodeInput }
      })
      if (referrer) {
        validReferrer = referrer;
        validReferredByCode = referralCodeInput
      }
    }

    // Fallback to COMPANY
    if (!validReferrer) {
        let companyReferrer = await prisma.user.findUnique({
            where: { referralCode: 'COMPANY' }
        });

        if (!companyReferrer) {
            try {
                companyReferrer = await prisma.user.create({
                    data: {
                        memberId: "0000000",
                        name: "LetsEarnify Company",
                        email: "system@letsearnify.com",
                        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10),
                        referralCode: "COMPANY",
                        role: "ADMIN",
                        isActiveMember: true,
                        tier: "EMERALD",
                        tierStatus: "CURRENT",
                        arnBalance: 0,
                        activeMembers: 0,
                        totalDeposit: 0.0,
                        emailVerified: new Date(),
                    }
                });
            } catch (createErr) {
                console.error("[Register] Failed to create COMPANY user:", createErr);
            }
        }

        if (companyReferrer) {
            validReferrer = companyReferrer;
            validReferredByCode = 'COMPANY';
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        attempts++;
        const newReferralCode = generateReferralCode();
        const newMemberId = generateMemberId();
        
        try {
            // ── Signup bonus: ARN tokens given to NEW USER based on REFERRER's tier ──
            // Per PDF: "Talha receives the signup bonus (e.g., 5 ARN if Ali is Newbie)"
            // This bonus is LOCKED until the new user activates with $1
            const referrerTier = validReferrer?.tier || "NEWBIE"
            const signupBonusArn = SIGNUP_BONUS_RATES[referrerTier] || 5
            
            const newUser = await prisma.user.create({
              data: {
                memberId: newMemberId,
                name,
                email,
                password: hashedPassword,
                emailVerified: null,
                country: country || null, 
                referralCode: newReferralCode,
                referredByCode: validReferredByCode, 
                tier: "NEWBIE",
                tierStatus: "CURRENT",
                arnBalance: 0,
                lockedArnBalance: signupBonusArn,  // Locked ARN signup bonus
                activeMembers: 0,
                totalDeposit: 0.0,
                isActiveMember: false
              }
            })

            if (signupBonusArn > 0) {
               await prisma.mLMLog.create({
                 data: {
                   userId: newUser.id,
                   type: "LOCKED_SIGNUP_BONUS",
                   amount: signupBonusArn,
                   description: `Signup bonus: ${signupBonusArn} ARN (based on referrer's ${referrerTier} tier). Locked until $1 activation.`
                 }
               });
            }

            // --- MLM: Create Referral Tree Entry ---
            let advisorId = null;
            let supervisorId = null;
            let managerId = null;

            if (validReferrer) {
               advisorId = validReferrer.id;
               
               const referrerTree = await prisma.referralTree.findUnique({
                  where: { userId: validReferrer.id }
               });

               if (referrerTree) {
                  supervisorId = referrerTree.advisorId; 
                  managerId = referrerTree.supervisorId; 
               }
            }

            await prisma.referralTree.create({
               data: {
                  userId: newUser.id,
                  advisorId,
                  supervisorId,
                  managerId
               }
            });

            // ── OTP & Verification Email ──
            const otp = generateOTP();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            await prisma.emailVerificationToken.create({
              data: {
                userId: newUser.id,
                token: otp,
                expiresAt,
              },
            });

            await sendVerificationEmail(email, otp);
            console.log(`✅ User registered: ${email} (bonus: ${signupBonusArn} ARN from ${referrerTier} referrer)`);

            return { error: null, success: true, email }

        } catch (err: any) {
            if (err.code === 'P2002') {
                const target = err.meta?.target;
                if (target && (target === 'User_email_key' || target.includes('email'))) {
                    return { error: 'Email already exists', success: false }
                }
                if (target && (target.includes('referralCode') || target.includes('memberId'))) {
                     console.warn(`[Register] Collision: ${newReferralCode}/${newMemberId}. Retry ${attempts}/${maxAttempts}`);
                     continue;
                }
            }
            console.error("Registration Error:", err);
            return { error: 'Something went wrong during registration. Please try again.', success: false }
        }
    }

    return { error: "Failed to generate unique credentials. Please try again.", success: false }
  } catch (err: any) {
    console.error("Registration Unexpected Error:", err);
    const message = err?.message || "An unexpected error occurred.";
    if (message.includes("Prisma")) {
        return { error: "Database connection error. Please try again later.", success: false }
    }
    return { error: message || "An unexpected error occurred.", success: false }
  }
}