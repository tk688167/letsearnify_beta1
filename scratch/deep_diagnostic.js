const { Pool } = require('pg');

async function deepDiagnostic() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  try {
    // Get all tables with row counts
    const tables = [
      'User', 'DailyEarningInvestment', 'Transaction', 'MudarabahInvestment',
      'MudarabahPool', 'AdminNotification', 'AdminLog', 'UserNotification',
      'ReferralCommission', 'Investment', 'UnlockActivation', 'CbspContribution'
    ];

    console.log('=== TABLE ROW COUNTS ===');
    for (const t of tables) {
      try {
        const res = await pool.query(`SELECT COUNT(*) as count FROM "${t}"`);
        console.log(`${t}: ${res.rows[0].count} rows`);
      } catch(e) {
        console.log(`${t}: ERROR - ${e.message}`);
      }
    }

    // Check Supabase auth.users table which is separate
    try {
      const authRes = await pool.query(`SELECT COUNT(*) as count FROM auth.users`);
      console.log(`\nSupabase auth.users: ${authRes.rows[0].count} rows`);
      
      // Show sample auth users
      const sampleAuth = await pool.query(`SELECT id, email, created_at FROM auth.users LIMIT 10`);
      if (sampleAuth.rows.length > 0) {
        console.log('Sample auth users:');
        sampleAuth.rows.forEach(u => console.log(`  - ${u.email} (${u.id}) created: ${u.created_at}`));
      }
    } catch(e) {
      console.log(`auth.users check failed: ${e.message}`);
    }

    // PostgreSQL version
    const ver = await pool.query(`SELECT version()`);
    console.log('\nPostgreSQL Version:', ver.rows[0].version);

    // Check DailyEarningInvestment columns
    const cols = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'DailyEarningInvestment' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    console.log('\n=== DailyEarningInvestment Columns ===');
    cols.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} (default: ${r.column_default})`));

  } catch (error) {
    console.error('Diagnostic Error:', error.message);
  } finally {
    await pool.end();
  }
}

deepDiagnostic();
