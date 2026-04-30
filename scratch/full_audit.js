const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  try {
    // Check all users
    const users = await pool.query(`SELECT id, email, name, "memberId", "createdAt", balance, "dailyEarningWallet", "referralCode" FROM "User" ORDER BY "createdAt" DESC`);
    console.log('=== ALL USERS ===');
    console.log(`Total: ${users.rows.length}`);
    users.rows.forEach(u => {
      console.log(`  [${u.memberId}] ${u.email} | balance=${u.balance} | dailyWallet=${u.dailyEarningWallet} | ref=${u.referralCode} | created=${u.createdAt}`);
    });

    // Check transactions
    const txs = await pool.query(`SELECT id, "userId", amount, type, status, method, description, "createdAt" FROM "Transaction" ORDER BY "createdAt" DESC LIMIT 20`);
    console.log(`\n=== TRANSACTIONS (${txs.rows.length}) ===`);
    txs.rows.forEach(t => console.log(`  [${t.type}] ${t.amount} | ${t.method} | ${t.description} | ${t.createdAt}`));

    // Check DailyEarningInvestment
    const pools = await pool.query(`SELECT * FROM "DailyEarningInvestment" ORDER BY "createdAt" DESC LIMIT 20`);
    console.log(`\n=== DAILY EARNING INVESTMENTS (${pools.rows.length}) ===`);
    pools.rows.forEach(p => console.log(`  ${p.id} | user=${p.userId} | amount=${p.amount} | status=${p.status} | created=${p.createdAt}`));

    // Check MerchantCountry (config data)
    const countries = await pool.query(`SELECT name, code, status FROM "MerchantCountry"`);
    console.log(`\n=== MERCHANT COUNTRIES (${countries.rows.length}) ===`);

    // Check PlatformWallet
    const wallets = await pool.query(`SELECT network, address FROM "PlatformWallet"`);
    console.log(`\n=== PLATFORM WALLETS (${wallets.rows.length}) ===`);
    wallets.rows.forEach(w => console.log(`  ${w.network}: ${w.address}`));

    // Check SpinReward
    const spins = await pool.query(`SELECT COUNT(*) as count FROM "SpinReward"`);
    console.log(`\n=== SPIN REWARDS: ${spins.rows[0].count} ===`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
