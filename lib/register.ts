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

    // Generate unique referral code for new user
    const newReferralCode = generateReferralCode();

    // Create the user
    // Note: We use the default tier (STARTER) from schema, or explicitly set it here if needed.
    // Schema default is STARTER now (per prompt).
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country: country || null, 
        referralCode: newReferralCode,
        referredByCode: validReferredByCode, // Will be user's input or COMPANY

        tier: Tier.NEWBIE,
        tierStatus: TierStatus.CURRENT,
        points: 0,
        activeMembers: 0,
        totalDeposit: 0.0,
        isActiveMember: false
      }
    })

    // --- MLM: Create Referral Tree Entry ---
    // This allows efficient 3-level lookups later
    let advisorId = null;
    let supervisorId = null;
    let managerId = null;

    if (validReferrer) {
       advisorId = validReferrer.id;
       
       // Get Referrer's upline to fill L2 and L3
       const referrerTree = await prisma.referralTree.findUnique({
          where: { userId: validReferrer.id }
       });

       if (referrerTree) {
          supervisorId = referrerTree.advisorId; // My L2 is my referrer's L1
          managerId = referrerTree.supervisorId; // My L3 is my referrer's L2
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
    if (err.code === 'P2002') {
      return { error: 'Email already exists or Referral Code collision.', success: false }
    }
    console.error("Registration Error:", err);
    return { error: 'Something went wrong.', success: false }
  }
}
