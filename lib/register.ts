"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"
import { generateReferralCode } from "@/lib/mlm"
import { Tier, TierStatus } from "@prisma/client"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const country = formData.get("country") as string
  const referralCodeInput = formData.get("referralCode") as string

  if (!name || !email || !password) {
    return { error: "All fields are required", success: false }
  }

  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

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
        const companyReferrer = await prisma.user.findUnique({
            where: { referralCode: 'COMPANY' }
        });
        if (companyReferrer) {
            validReferrer = companyReferrer;
            validReferredByCode = 'COMPANY';
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        attempts++;
        const newReferralCode = generateReferralCode();
        
        try {
            // Create the user
            const newUser = await prisma.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
                country: country || null, 
                referralCode: newReferralCode,
                referredByCode: validReferredByCode, 
                tier: Tier.NEWBIE,
                tierStatus: TierStatus.CURRENT,
                points: 0,
                activeMembers: 0,
                totalDeposit: 0.0,
                isActiveMember: false
              }
            })

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

                // If Referral Code collision, retry
                if (target && (target === 'User_referralCode_key' || target.includes('referralCode'))) {
                     console.warn(`Referral Code Collision: ${newReferralCode}. Retrying... (${attempts}/${maxAttempts})`);
                     continue;
                }
            }
            
            console.error("Registration Error:", err);
            return { error: 'Something went wrong during registration. Please try again.', success: false }
        }
    }

    return { error: "Failed to generate a unique ID. Please try again.", success: false }
  } catch (err) {
    console.error("Registration Unexpected Error:", err);
    return { error: "An unexpected error occurred.", success: false }
  }
}
