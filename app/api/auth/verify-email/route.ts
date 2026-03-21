// ============================================================
// FILE: app/api/auth/verify-email/route.ts  (CREATE NEW)
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const trimmedOtp = otp.trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified. Please sign in." },
        { status: 400 }
      )
    }

    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, token: trimmedOtp },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 }
      )
    }

    if (new Date() > verificationToken.expiresAt) {
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      })
      return NextResponse.json(
        { error: "Code has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Verify email + cleanup tokens in one transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      }),
    ])

    console.log("✅ Email verified:", normalizedEmail)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
    })
  } catch (error) {
    console.error("❌ Verify Email Error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}