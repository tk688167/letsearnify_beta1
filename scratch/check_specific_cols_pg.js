const { Pool } = require('pg');

async function checkCols() {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
    if (!connectionString) {
        console.error("No DATABASE_URL found in environment");
        process.exit(1);
    }
    
    const pool = new Pool({ connectionString });
    
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'DailyEarningInvestment'
        `);
        const columns = res.rows.map(r => r.column_name);
        console.log("Existing columns:", columns.join(', '));
        
        console.log("Missing nextCycleAt?", !columns.includes('nextCycleAt'));
        console.log("Missing lastCalculatedDate?", !columns.includes('lastCalculatedDate'));
        console.log("Missing expiresAt?", !columns.includes('expiresAt'));
        
    } catch (e) {
        console.error("Error querying database:", e);
    } finally {
        await pool.end();
    }
}

checkCols();
