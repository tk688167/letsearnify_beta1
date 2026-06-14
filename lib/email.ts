import nodemailer from "nodemailer";

/**
 * Configure the SMTP transporter using environment variables.
 * Gmail requires an App Password (16 characters) if 2FA is enabled.
 */
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("Missing SMTP credentials in environment variables.");
    }
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification OTP email via SMTP (Nodemailer)
 */
export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || '"LetsEarnify" <Letsearnify@gmail.com>',
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
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h2 style="color: #1e293b; text-align: center;">Verify your LetsEarnify account</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">Your verification code is:</p>
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #4f46e5;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">This code expires in 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} LetsEarnify. All rights reserved.</p>
        </div>
      `,
    });

    console.log("📧 Verification email sent (SMTP):", info.messageId);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error("❌ SMTP Error (sendVerificationEmail):", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmEmail(email: string, featureName: string) {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || '"LetsEarnify" <Letsearnify@gmail.com>',
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

    return { success: true, id: info.messageId };
  } catch (err: any) {
    console.error("❌ SMTP Waitlist email error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send password reset OTP email
 */
export async function sendEmail(email: string, otp: string) {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || '"LetsEarnify" <Letsearnify@gmail.com>',
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

    return { success: true, id: info.messageId };
  } catch (err: any) {
    console.error("❌ SMTP Password reset email failed:", err);
    return { success: false, error: err.message };
  }
}