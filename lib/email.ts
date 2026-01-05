import nodemailer from "nodemailer";

export async function sendEmail(to: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"LetsEarnify" <noreply@letsearnify.com>',
    to,
    subject: "LetsEarnify Password Reset OTP",
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2>LetsEarnify Password Reset</h2>
        <p>Hello,</p>
        <p>Your OTP for password reset is:</p>
        <h1 style="letter-spacing: 5px; color: #1E40AF;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">LetsEarnify Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${otp}`); // keeping minimal log
  } catch (err) {
    console.error("Email sending failed:", err);
    console.log(`OTP (testing only): ${otp}`);
  }
}
