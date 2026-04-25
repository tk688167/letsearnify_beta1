const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCols() {
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'DailyEarningInvestment'
        `;
        console.log("Columns in database:");
        console.table(columns);

        const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "DailyEarningInvestment"`;
        console.log("Total rows:", count[0].count.toString());
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkCols();
