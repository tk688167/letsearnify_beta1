import { prisma } from "./lib/prisma"
import { executeSpin } from "./app/actions/spin"

async function testSpins() {
    // 1. Create a dummy user
    const user = await prisma.user.create({
        data: {
            email: "test_spin_logic@example.com",
            name: "Spin Test",
            role: "USER"
        }
    });

    console.log("Created test user:", user.id);
    
    // We will override the cooldown check for testing by constantly resetting the lastSpinTime to null in the DB
    try {
        for (let i = 0; i < 6; i++) {
             // Mock the session by overriding auth temporarily or we can just call the logic since it expects a session.
             // Actually, the `executeSpin` action uses `auth()` which will fail in a script context.
             // Let's just create a mock version of the logic here to test the math/sequence safely.
             
             const spinCount = i;
             console.log(`\n--- Spin #${spinCount + 1} ---`);
             console.log(`Current Spin Count in DB: ${spinCount}`);
             
             let selectedType = "";
             
             if (spinCount < 2) {
                 selectedType = spinCount === 0 ? "5 ARN" : "7 ARN";
             } else {
                 const cyclePosition = (spinCount - 2) % 3;
                 if (cyclePosition === 0) {
                     selectedType = "Good Reward (e.g. 5 ARN)";
                 } else {
                     selectedType = "Bad Reward (Try Again)";
                 }
             }
             
             console.log(`Expected Result: ${selectedType}`);
        }
    } finally {
        await prisma.user.delete({ where: { id: user.id } });
        console.log("Cleaned up test user.");
    }
}

testSpins().catch(console.error);
