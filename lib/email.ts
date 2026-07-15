import * as nodemailer from "nodemailer";

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

// ============================================
// ✅ NEW: Admin Notification Email Function
// ============================================

/**
 * Send admin notification email
 * Yeh function admin ko notification bhejega jab bhi koi user action ho
 */
export async function sendAdminNotificationEmail({
  to,
  type,
  title,
  description,
  userData,
}: {
  to: string;
  type: string;
  title: string;
  description: string;
  userData?: {
    name?: string;
    email?: string;
    amount?: number;
    task?: string;
    reward?: string;
    [key: string]: any;
  };
}) {
  try {
    // Type ke hisaab se emoji aur color
    const typeConfig: Record<string, { emoji: string; color: string; badge: string }> = {
      signup: { emoji: "👤", color: "#3b82f6", badge: "New User" },
      deposit: { emoji: "💰", color: "#22c55e", badge: "Deposit" },
      withdrawal: { emoji: "💸", color: "#a855f7", badge: "Withdrawal" },
      merchant_deposit: { emoji: "🏦", color: "#f59e0b", badge: "Merchant Deposit" },
      task_submission: { emoji: "📝", color: "#06b6d4", badge: "Task Submission" },
      unlock: { emoji: "🔓", color: "#14b8a6", badge: "Account Unlock" },
      daily_earning: { emoji: "📊", color: "#6366f1", badge: "Daily Pool" },
      spin_wheel: { emoji: "🎡", color: "#ec4899", badge: "Spin Reward" },
      support_message: { emoji: "💬", color: "#f43f5e", badge: "Support" },
    };

    const config = typeConfig[type] || { emoji: "🔔", color: "#3b82f6", badge: "Notification" };

    // User data section build karein
    let userSection = "";
    if (userData) {
      userSection = `
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px;">👤 User Details</h4>
          ${userData.name ? `<p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Name:</strong> ${userData.name}</p>` : ''}
          ${userData.email ? `<p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Email:</strong> ${userData.email}</p>` : ''}
          ${userData.amount ? `<p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Amount:</strong> $${userData.amount}</p>` : ''}
          ${userData.task ? `<p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Task:</strong> ${userData.task}</p>` : ''}
          ${userData.reward ? `<p style="margin: 4px 0; font-size: 14px; color: #475569;"><strong>Reward:</strong> ${userData.reward}</p>` : ''}
        </div>
      `;
    }

    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || '"LetsEarnify" <Letsearnify@gmail.com>',
      to: to,
      subject: `${config.emoji} ${title} - LetsEarnify Admin Alert`,
      text: [
        `Admin Notification`,
        ``,
        `Type: ${config.badge}`,
        `Title: ${title}`,
        `Description: ${description}`,
        ``,
        userData ? `User: ${userData.name || 'N/A'} (${userData.email || 'N/A'})` : '',
        ``,
        `Time: ${new Date().toLocaleString()}`,
        ``,
        `View all: ${process.env.NEXT_PUBLIC_APP_URL}/admin/notifications`,
        ``,
        `© ${new Date().getFullYear()} LetsEarnify. All rights reserved.`,
      ].join("\n"),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
            .header { background: linear-gradient(135deg, ${config.color}, #8b5cf6); padding: 25px; border-radius: 12px 12px 0 0; color: white; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; }
            .badge { background: ${config.color}20; color: ${config.color}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; display: inline-block; border: 1px solid ${config.color}40; }
            .btn { background: linear-gradient(135deg, ${config.color}, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; }
            .footer { color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px;">${config.emoji}</span>
              <h2 style="margin: 0; font-size: 20px;">LetsEarnify Admin Alert</h2>
            </div>
          </div>
          
          <div class="content">
            <div style="margin-bottom: 20px;">
              <span class="badge">${config.badge}</span>
              <span style="margin-left: 10px; color: #94a3b8; font-size: 14px;">${new Date().toLocaleString()}</span>
            </div>
            
            <h3 style="color: #1e293b; margin-top: 0; font-size: 22px;">${title}</h3>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">${description}</p>
            
            ${userSection}
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/tasks" class="btn">
                View All Notifications
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from LetsEarnify Admin System.</p>
            <p>© ${new Date().getFullYear()} LetsEarnify. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Admin notification email sent:", info.messageId);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error("Admin notification email error:", error);
    return { success: false, error: error.message };
  }
}