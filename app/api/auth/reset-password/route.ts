import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword, confirmPassword } = await req.json();

    if (!email || !otp || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { userId: user.id },
    });

    if (!tokenRecord) {
        return NextResponse.json({ message: "Invalid OTP request. Please request a new one." }, { status: 400 });
    }

    const isExpired = new Date() > tokenRecord.expiresAt;
    if (tokenRecord.otp !== otp || isExpired) {
       return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update User & Delete Token
    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        }),
        prisma.passwordResetToken.delete({
            where: { userId: user.id }
        })
    ]);

    return NextResponse.json({ message: "Password reset successfully. You can now login." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
