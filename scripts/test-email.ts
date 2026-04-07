import dotenv from "dotenv";
dotenv.config();

// Important: import after dotenv.config() so that env vars are loaded
import { sendVerificationEmail } from "../lib/email";

async function test() {
  const testEmail = process.env.SMTP_USER || "test@example.com";
  console.log(`🧪 Testing SMTP connection for: ${testEmail}...`);
  
  try {
    const result = await sendVerificationEmail(testEmail, "123456");
    console.log("✅ Email sent successfully!", result);
  } catch (err: any) {
    console.error("❌ Email test failed:", err.message);
    console.log("\n💡 Troubleshooting Tips:");
    console.log("1. Check if SMTP_PASS is a 16-character Gmail App Password (not your regular password).");
    console.log("2. Ensure SMTP_USER matches the sending email.");
    console.log("3. If using Gmail, make sure 2-Step Verification is ON, then create an App Password.");
  }
}

test();
