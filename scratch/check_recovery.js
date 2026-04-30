const { Pool } = require('pg');

async function checkRecovery() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  try {
    // Check current DB size
    const dbSize = await pool.query(`SELECT pg_size_pretty(pg_database_size(current_database()))`);
    console.log('Current DB Size:', dbSize.rows[0].pg_size_pretty);

    // Check pg_sequences for any evidence of past inserts
    const sequences = await pool.query(`
      SELECT ps.sequencename, ps.last_value, ps.start_value, ps.increment_by
      FROM pg_sequences ps
      WHERE ps.schemaname = 'public'
      ORDER BY ps.last_value DESC NULLS LAST
      LIMIT 30;
    `);
    console.log('\nSequences (to detect if data ever existed):');
    sequences.rows.forEach(r => console.log(`  ${r.sequencename}: last=${r.last_value} start=${r.start_value}`));

    // Check if any migration table exists
    try {
      const migrationsRes = await pool.query(`SELECT * FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 5`);
      console.log('\nPrisma Migrations:');
      migrationsRes.rows.forEach(r => console.log(`  ${r.migration_name}: ${r.finished_at} (${r.applied_steps_count} steps)`));
    } catch(e) {
      console.log('\nNo _prisma_migrations table found');
    }

    // Check Supabase storage tables
    try {
      const storageRes = await pool.query(`SELECT id, name, created_at FROM storage.buckets`);
      console.log('\nSupabase Storage Buckets:', JSON.stringify(storageRes.rows));
    } catch(e) {
      console.log('\nNo storage access:', e.message);
    }

  } catch (error) {
    console.error('Recovery Check Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRecovery();
