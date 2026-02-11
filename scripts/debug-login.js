const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// Load .env manually
try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                process.env[key] = value;
            }
        });
    }
} catch(e) {}

const prisma = new PrismaClient()

async function main() {
    const url = process.env.DATABASE_URL || "NOT SET";
    console.log(`Loaded URL: ${url.replace(/:[^:@]+@/, ':****@')}`);
    
    const email = 'tk688167@gmail.com'
    const passwordCandidate = 'talha123'
    
    console.log(`Debug (Standard): Checking login for ${email}...`)

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            console.error("❌ User NOT FOUND in database.")
            return
        }

        console.log(`✅ User Found: ${user.email}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Role: ${user.role}`)

        const match = await bcrypt.compare(passwordCandidate, user.password)

        if (match) {
            console.log("✅ bcrypt.compare returned TRUE. Login SHOULD work.")
        } else {
            console.error("❌ bcrypt.compare returned FALSE. Password mismatch.")
        }
    } catch (error) {
        console.error("❌ Connection Failed:", error.message)
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
