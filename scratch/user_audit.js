const { Pool } = require('pg');

// Check for more users - check ALL users not just recent ones
async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  try {
    // Get total user count
    const count = await pool.query(`SELECT COUNT(*) as total FROM "User"`);
    console.log('Total Users:', count.rows[0].total);

    // Get all users with full detail  
    const users = await pool.query(`
      SELECT id, email, name, "memberId", "createdAt", balance, 
             "dailyEarningWallet", "referralCode", "referredByCode", role,
             "isActiveMember", "totalDeposit"
      FROM "User" 
      ORDER BY "createdAt" ASC
    `);
    
    console.log('\n=== ALL USERS (chronological) ===');
    users.rows.forEach((u, i) => {
      console.log(`${i+1}. [${u.memberId}] ${u.email}`);
      console.log(`   role=${u.role} | active=${u.isActiveMember} | balance=${u.balance} | dailyWallet=${u.dailyEarningWallet}`);
      console.log(`   ref=${u.referralCode} | referredBy=${u.referredByCode} | created=${u.createdAt}`);
    });

    // Check auth users separately
    const authUsers = await pool.query(`SELECT id, email, created_at FROM auth.users ORDER BY created_at ASC`);
    console.log(`\n=== SUPABASE AUTH USERS (${authUsers.rows.length}) ===`);
    authUsers.rows.forEach(u => console.log(`  ${u.email} | ${u.id} | ${u.created_at}`));

    // Check if there are any MerchantTransaction deposits for context
    const deposits = await pool.query(`SELECT COUNT(*) as count FROM "MerchantTransaction"`);
    console.log(`\n=== Merchant Transactions: ${deposits.rows[0].count} ===`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
