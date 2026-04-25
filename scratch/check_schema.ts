import { prisma } from "../lib/prisma.js";

async function checkRows() {
    try {
        const count = await prisma.$queryRaw`SELECT COUNT(*) FROM "DailyEarningInvestment"`;
        console.log("Existing rows in DailyEarningInvestment:", count);
        
        // Let's also check what columns actually exist
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'DailyEarningInvestment'
        `;
        console.log("Columns in database:");
        console.log(columns);
    } catch (e) {
        console.error(e);
    }
}
checkRows();
