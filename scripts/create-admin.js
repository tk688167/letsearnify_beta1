const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

// Load .env manually to ensure connection works independently
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
    const email = 'tk688167@gmail.com'
    const password = 'talha123'
    const name = 'Admin User'

    console.log(`Creating/Updating Admin: ${email}`)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            isActiveMember: true
        },
        create: {
            email,
            password: hashedPassword,
            name,
            role: 'ADMIN',
            isActiveMember: true, // Auto-activate admin
            totalDeposit: 1000.00 // Fake deposit for testing limits
        }
    })

    console.log(`Admin User Configured: ${user.email} (Role: ${user.role})`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
