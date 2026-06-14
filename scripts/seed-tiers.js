const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tiers = ['NEWBIE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];
    
    // Default values matching TIER_REQUIREMENTS
    const defaults = {
        NEWBIE:   { arn: 0,      members: 0 },
        BRONZE:   { arn: 100,    members: 2 },
        SILVER:   { arn: 500,    members: 5 },
        GOLD:     { arn: 2000,   members: 10 },
        PLATINUM: { arn: 10000,  members: 20 },
        DIAMOND:  { arn: 50000,  members: 50 },
        EMERALD:  { arn: 100000, members: 100 }
    };

    console.log("Seeding Tier Configurations...");

    for (const tier of tiers) {
        // We use upsert so we don't duplicate or fail if exists
        await prisma.tierConfiguration.upsert({
            where: { tier: tier },
            update: {}, // Don't overwrite if exists
            create: {
                tier: tier,
                requiredArn: defaults[tier].arn,
                members: defaults[tier].members,
                levels: '[]' // Placeholder for now
            }
        });
        console.log(`- ${tier} ensured.`);
    }
    
    console.log("✅ Tiers Seeded Successfully.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
