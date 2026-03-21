// ============================================================
// FILE: lib/email.ts  (REPLACE your existing file)
// ============================================================

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification OTP email via Resend
 */
export async function sendVerificationEmail(email: string, otp: string) {
  const { data, error } = await resend.emails.send({
    from: "LetsEarnify <noreply@letsearnify.com>",
    to: email,
    subject: `${otp} is your LetsEarnify verification code`,
    text: [
      "Verify your LetsEarnify account",
      "",
      `Your verification code is: ${otp}`,
      "",
      "Enter this code on the verification page to complete your signup.",
      "This code expires in 10 minutes.",
      "",
      "If you didn't create an account, you can safely ignore this email.",
      "",
      `© ${new Date().getFullYear()} LetsEarnify. All rights reserved.`,
    ].join("\n"),
  });

  if (error) {
    console.error("❌ Resend Error:", error);
    throw new Error(error.message);
  }

  console.log("📧 Verification email sent:", data?.id);
  return data;
}
/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmEmail(email: string, featureName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "LetsEarnify <noreply@letsearnify.com>",
      to: email,
      subject: `You're on the waitlist for ${featureName}!`,
      text: [
        `You've been added to the waitlist for ${featureName}.`,
        "",
        "We'll notify you as soon as it's available.",
        "",
        `© ${new Date().getFullYear()} LetsEarnify. All rights reserved.`,
      ].join("\n"),
    });

    if (error) {
      console.error("❌ Waitlist email error:", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("❌ Waitlist email failed:", err);
    return { success: false };
  }
}
/**
 * Send password reset OTP email
 */
export async function sendEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "LetsEarnify <noreply@letsearnify.com>",
      to: email,
      subject: `${otp} — Reset your LetsEarnify password`,
      text: [
        "Password Reset Request",
        "",
        `Your password reset code is: ${otp}`,
        "",
        "Enter this code on the reset page. It expires in 10 minutes.",
        "If you didn't request this, you can safely ignore this email.",
        "",
        `© ${new Date().getFullYear()} LetsEarnify. All rights reserved.`,
      ].join("\n"),
    });

    if (error) {
      console.error("❌ Password reset email error:", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("❌ Password reset email failed:", err);
    return { success: false };
  }
}