"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { generateReferralCode, generateMemberId } from "@/lib/mlm"

// Bonus structure defined by the user for signup referrals
const SIGNUP_BONUS_RATES: Record<string, number> = {
  NEWBIE: 1,
  BRONZE: 2,
  SILVER: 3,
  GOLD: 5,
  PLATINUM: 6,
  DIAMOND: 8,
  EMERALD: 10
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

  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    })
    console.log("[Register] Checking existing user:", !!existing)

    if (existing) {
      return { error: "Email already exists", success: false }
    }

    // Validate Referral Code if provided, otherwise default to COMPANY
    let validReferrer = null;
    let validReferredByCode = null;
    
    // 1. Try input code
    if (referralCodeInput) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCodeInput }
      })
      if (referrer) {
        validReferrer = referrer;
        validReferredByCode = referralCodeInput
      }
    }

    // 2. Fallback to COMPANY if no valid input
    if (!validReferrer) {
        console.log("[Register] Resolving COMPANY referrer")
        let companyReferrer = await prisma.user.findUnique({
            where: { referralCode: 'COMPANY' }
        });

        // AUTO-CREATE COMPANY USER IF MISSING (Self-Healing)
        if (!companyReferrer) {
            console.log("[Register] Initializing COMPANY system user");
            try {
                companyReferrer = await prisma.user.create({
                    data: {
                        memberId: "0000000",
                        name: "LetsEarnify Company",
                        email: "admin@letsearnify.com",
                        password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10),
                        referralCode: "COMPANY",
                        role: "ADMIN",
                        isActiveMember: true,
                        tier: "EMERALD",
                        tierStatus: "CURRENT",
                        arnBalance: 0,
                        activeMembers: 0,
                        totalDeposit: 0.0
                    }
                });
            } catch (createErr) {
                console.error("[Register] Failed to create COMPANY user:", createErr);
                // Continue, validReferrer will be null which is handled
            }
        }

        if (companyReferrer) {
            validReferrer = companyReferrer;
            validReferredByCode = 'COMPANY';
        }
    }
    console.log("[Register] Final Referrer:", validReferrer?.email || "None")

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        attempts++;
        const newReferralCode = generateReferralCode();
        const newMemberId = generateMemberId(); // 7-digit ID
        
        try {
            // Determine Signup Bonus
            const signupBonus = validReferrer ? (SIGNUP_BONUS_RATES[validReferrer.tier] || 0) : 0;
            
            // Create the user
            const newUser = await prisma.user.create({
              data: {
                memberId: newMemberId, // Store the numeric ID
                name,
                email,
                password: hashedPassword,
                country: country || null, 
                referralCode: newReferralCode,
                referredByCode: validReferredByCode, 
                tier: "NEWBIE",
                tierStatus: "CURRENT",
                arnBalance: 0,
                lockedArnBalance: signupBonus,
                activeMembers: 0,
                totalDeposit: 0.0,
                isActiveMember: false
              }
            })

            if (signupBonus > 0) {
               await prisma.mLMLog.create({
                 data: {
                   userId: newUser.id,
                   type: "LOCKED_SIGNUP_BONUS",
                   amount: signupBonus,
                   description: `Received signup bonus of ${signupBonus} ARN (Locked until $1 Activation)`
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

            return { error: null, success: true }
        } catch (err: any) {
            // Check for Unique Constraint Violation
            if (err.code === 'P2002') {
                const target = err.meta?.target;
                
                // If Email collision (race condition despite check above)
                if (target && (target === 'User_email_key' || target.includes('email'))) {
                    return { error: 'Email already exists', success: false }
                }

                // If Referral Code or Member ID collision, retry
                if (target && (target.includes('referralCode') || target.includes('memberId'))) {
                     console.warn(`[Register] Collision detected (Ref/ID): ${newReferralCode} / ${newMemberId}. Retrying... (${attempts}/${maxAttempts})`);
                     continue;
                }
            }
            
            console.error("Registration Error:", err);
            return { error: 'Something went wrong during registration. Please try again.', success: false }
        }
    }

    return { error: "Failed to generate unique credentials. Please try again.", success: false }
  } catch (err: any) {
    console.error("Registration Unexpected Error (FULL):", err);
    // Provide a more descriptive error if it's a known issue
    const message = err?.message || "An unexpected error occurred.";
    if (message.includes("Prisma")) {
        return { error: "Database connection error. Please try again later.", success: false }
    }
    return { error: message || "An unexpected error occurred.", success: false }
  }
}
