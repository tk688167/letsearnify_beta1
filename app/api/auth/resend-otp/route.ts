// ============================================================
// FILE: app/api/auth/resend-otp/route.ts  (CREATE NEW)
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOTP, sendVerificationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Don't reveal whether account exists
    if (!user) return NextResponse.json({ success: true })

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified." },
        { status: 400 }
      )
    }

    // Rate limit: 1 per 60 seconds
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    })

    if (recentToken) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting a new code." },
        { status: 429 }
      )
    }

    // Delete old tokens, create new one
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    })

    const otp = generateOTP()
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    await sendVerificationEmail(normalizedEmail, otp)
    console.log("📧 Resent OTP to:", normalizedEmail)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Resend OTP Error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}