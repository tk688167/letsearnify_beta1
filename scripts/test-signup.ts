import { registerUser } from "../lib/register";

async function test() {
    console.log("🚀 Starting Signup Test...");
    const formData = new FormData();
    formData.append("name", "Test User");
    formData.append("email", `test-${Date.now()}@example.com`);
    formData.append("password", "password123");
    formData.append("country", "US");

    try {
        const result = await registerUser(formData);
        console.log("🏁 Test Result:", result);
    } catch (error) {
        console.error("❌ Test Failed with Error:", error);
    }
}

test();
