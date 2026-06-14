
const { TIER_COMMISSIONS } = require('./lib/mlm');

function testCommissions(tier) {
    const rates = TIER_COMMISSIONS[tier] || TIER_COMMISSIONS.NEWBIE;
    console.log(`\n--- Tier: ${tier} ---`);
    console.log(`L1: ${rates.L1}% (Expected: 5% for Newbie)`);
    console.log(`L2: ${rates.L2}% (Expected: 3% for Newbie)`);
    console.log(`L3: ${rates.L3}% (Expected: 2% for Newbie)`);
    
    const amount = 1.0;
    const l1Comm = amount * (rates.L1 / 100);
    const l2Comm = amount * (rates.L2 / 100);
    const l3Comm = amount * (rates.L3 / 100);
    const total = l1Comm + l2Comm + l3Comm;
    
    console.log(`L1 Comm: $${l1Comm.toFixed(2)}`);
    console.log(`L2 Comm: $${l2Comm.toFixed(2)}`);
    console.log(`L3 Comm: $${l3Comm.toFixed(2)}`);
    console.log(`Total Comm: $${total.toFixed(2)} (Expected: $0.10 for 5+3+2)`);
}

testCommissions('NEWBIE');
testCommissions('SILVER');
