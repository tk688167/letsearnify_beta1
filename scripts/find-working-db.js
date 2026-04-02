const { PrismaClient } = require('@prisma/client')
const path = require('path')
const fs = require('fs')

// 1. Load Base URL from .env
let baseUrl = "";
try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        // Look for DATABASE_URL specifically
        const match = envContent.match(/^DATABASE_URL="?([^"\n]+)"?/m);
        if (match) baseUrl = match[1];
    }
} catch(e) {}

if (!baseUrl) {
    console.error("❌ Could not find DATABASE_URL in .env");
    process.exit(1);
}

// Clean base URL of params for rebuilding
const cleanUrl = baseUrl.split('?')[0];

console.log("🔍 Diagnosing Connection to:", cleanUrl.replace(/:[^:@]+@/, ':****@'));

// 2. Define Variations to Test
const variations = [
    { name: "Original (from .env)", url: baseUrl },
    { name: "Pooled + SSL + Strict", url: cleanUrl + "?sslmode=require&channel_binding=require" },
    { name: "Pooled + SSL (Relaxed)", url: cleanUrl + "?sslmode=require" },
    { name: "Direct + SSL + Strict", url: cleanUrl.replace("-pooler", "") + "?sslmode=require&channel_binding=require" },
    { name: "Direct + SSL (Relaxed)", url: cleanUrl.replace("-pooler", "") + "?sslmode=require" },
    // Try forcing us-east-1 if ap-southeast-1 is having issues (Unlikely to work if region locked, but worth a check if DNS resolves)
];

async function testConnection(name, url) {
    console.log(`\nTesting: ${name}`);
    console.log(`URL: ${url.replace(/:[^:@]+@/, ':****@')}`);
    
    const prisma = new PrismaClient({
        datasourceUrl: url,
        log: ['error']
    });

    try {
        const start = Date.now();
        // Set a hard timeout of 5 seconds
        const count = await Promise.race([
            prisma.user.count(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
        ]);
        const time = Date.now() - start;
        console.log(`✅ SUCCESS! Time: ${time}ms`);
        await prisma.$disconnect();
        return true;
    } catch (e) {
        console.log(`❌ FAILED: ${e.message}`);
        await prisma.$disconnect();
        return false;
    }
}

async function main() {
    let workingUrl = null;

    for (const v of variations) {
        const success = await testConnection(v.name, v.url);
        if (success) {
            workingUrl = v.url;
            break; // Stop at first success
        }
    }

    if (workingUrl) {
        console.log("\n---------------------------------------------------");
        console.log("🏆 FOUND WORKING CONNECTION!");
        console.log(`URL: ${workingUrl.replace(/:[^:@]+@/, ':****@')}`);
        console.log("---------------------------------------------------");
        
        // Write to .env.fixed hint file
        fs.writeFileSync(path.join(__dirname, '..', '.env.suggestion'), `DATABASE_URL="${workingUrl}"`);
    } else {
        console.error("\n---------------------------------------------------");
        console.error("💀 ALL CONNECTION ATTEMPTS FAILED.");
        console.error("This confirms a Network Block (Firewall/ISP) or Database Down.");
        console.error("---------------------------------------------------");
    }
}

main();
