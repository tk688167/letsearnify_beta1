import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Migrating historical ARN balances into unified USD balance...")
    
    const users = await prisma.user.findMany({
        where: { arnBalance: { gt: 0 } },
        select: { id: true, email: true, balance: true, arnBalance: true }
    });
    
    console.log(`Found ${users.length} users with legacy ARN balances.`);
    
    for (const user of users) {
        // Exclude system accounts if necessary, but here we just convert everything
        const usdValue = user.arnBalance / 10;
        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                balance: { increment: usdValue }
            }
        });
        
        console.log(`Migrated ${user.arnBalance} ARN ($${usdValue} USD) for ${user.email}. New Balance: $${user.balance + usdValue}`);
    }
    
    console.log("Migration complete!");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
