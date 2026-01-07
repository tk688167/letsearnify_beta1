import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const getTransporter = () => {
    const port = Number(process.env.SMTP_PORT) || 587;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465, 
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export async function sendHtmlEmail({ to, subject, html }: EmailOptions) {
    const transporter = getTransporter();
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"LetsEarnify" <noreply@letsearnify.com>',
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err: any) {
        console.error("Email sending failed:", err);
        return { success: false, error: err.message };
    }
}

export async function sendEmail(to: string, otp: string) {
  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
           <h2 style="color: #2563EB; margin: 0;">LetsEarnify</h2>
        </div>
        <div style="padding: 20px; text-align: center;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">Hello,</p>
            <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">Please use the following One Time Password (OTP) to complete your request:</p>
            
            <div style="background-color: #F3F4F6; padding: 15px 25px; border-radius: 8px; display: inline-block; margin-bottom: 25px;">
                <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px; color: #1E40AF; font-weight: bold;">${otp}</h1>
            </div>
            
            <p style="font-size: 14px; color: #6B7280; margin-bottom: 0;">This OTP is valid for 10 minutes.</p>
            <p style="font-size: 14px; color: #6B7280;">If you did not request this, please ignore this email.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} LetsEarnify. All rights reserved.</p>
        </div>
      </div>
    `;
    
    // In dev mode logging
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV MODE] Generated OTP for ${to}: ${otp}`);
    }

    return sendHtmlEmail({ to, subject: "LetsEarnify OTP Verification", html });
}

export async function sendWaitlistConfirmEmail(to: string, featureName: string) {
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 30px;">
           <h2 style="color: #4F46E5; margin: 0; font-size: 24px; letter-spacing: -0.5px;">LetsEarnify</h2>
        </div>
        
        <div style="text-align: center;">
            <div style="display: inline-block; padding: 12px; background-color: #EEF2FF; border-radius: 50%; margin-bottom: 20px;">
                <span style="font-size: 24px;">🚀</span>
            </div>
            
            <h1 style="font-size: 24px; color: #111827; margin-bottom: 16px; font-weight: bold;">You're on the list!</h1>
            
            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin-bottom: 24px;">
                Thanks for your interest in <strong>${featureName}</strong>. You've officially secured your spot on the waitlist.
            </p>
            
            <p style="font-size: 16px; color: #4B5563; line-height: 1.6; margin-bottom: 30px;">
                We're putting the finishing touches on this feature to ensure it's secure, profitable, and seamless. You'll be the first to know the moment it goes live!
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Back to Dashboard
            </a>
        </div>
        
        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #F3F4F6; text-align: center;">
            <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                &copy; ${new Date().getFullYear()} LetsEarnify. All rights reserved.
            </p>
        </div>
      </div>
    `;
    return sendHtmlEmail({ to, subject: `You're on the waitlist for ${featureName}!`, html });
}
