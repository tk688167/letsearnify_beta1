const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  try {
    const res = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata;
    `);
    console.log('Schemas in database:', res.rows.map(r => r.schema_name).join(', '));
  } catch (error) {
    console.error('Error checking schemas:', error);
  } finally {
    await pool.end();
  }
}

main();
