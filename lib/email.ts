import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(to: string, otp: string) {
  const port = Number(process.env.SMTP_PORT) || 587;
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"LetsEarnify" <noreply@letsearnify.com>',
    to,
    subject: "LetsEarnify OTP Verification",
    html: `
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
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("Email sending failed:", err);
    // In dev mode, log the OTP so we can valid it even if email fails
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV MODE] Generated OTP for ${to}: ${otp}`);
    }
    return { success: false, error: err.message };
  }
}
