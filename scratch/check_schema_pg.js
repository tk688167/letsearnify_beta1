const { Pool } = require('pg');

async function checkSchema() {
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
        console.log("=== COLUMNS IN DailyEarningInvestment ===");
        console.table(res.rows);
        
        const countRes = await pool.query(`SELECT COUNT(*) as count FROM "DailyEarningInvestment"`);
        console.log("Total rows:", countRes.rows[0].count);
        
        // Also check if any migrations are pending in _prisma_migrations
        const migRes = await pool.query(`
            SELECT migration_name, finished_at 
            FROM _prisma_migrations 
            ORDER BY finished_at DESC LIMIT 5
        `);
        console.log("=== RECENT MIGRATIONS ===");
        console.table(migRes.rows);

    } catch (e) {
        console.error("Error querying database:", e);
    } finally {
        await pool.end();
    }
}

checkSchema();
