import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Security: Do not reveal if user exists or not, but for UX we usually say "If email exists..."
    // However, the prompt requested specific messages.
    if (!user) {
      return NextResponse.json({ message: "User with this email does not exist." }, { status: 404 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert Token
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { otp, expiresAt },
      create: { userId: user.id, otp, expiresAt },
    });

    const result = await sendEmail(email, otp);

    if (!result || !result.success) {
      return NextResponse.json({ message: "Failed to send OTP email." }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
