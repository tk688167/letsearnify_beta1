const { execSync } = require('child_process');
const fs = require('fs');

function checkSqlite() {
    try {
        if (!fs.existsSync('prisma/dev.db')) {
            console.log('prisma/dev.db does not exist');
            return;
        }
        console.log('Checking prisma/dev.db using sqlite3 CLI...');
        const userCount = execSync('sqlite3 prisma/dev.db "SELECT COUNT(*) FROM User"').toString().trim();
        console.log('User count in SQLite:', userCount);
        
        const poolCount = execSync('sqlite3 prisma/dev.db "SELECT COUNT(*) FROM DailyEarningInvestment"').toString().trim();
        console.log('DailyEarningInvestment count in SQLite:', poolCount);

        if (parseInt(poolCount) > 0) {
            console.log('Found pools in SQLite! Samples:');
            const samples = execSync('sqlite3 prisma/dev.db "SELECT * FROM DailyEarningInvestment LIMIT 5"').toString();
            console.log(samples);
        }
    } catch (e) {
        console.error('Error checking SQLite:', e.message);
    }
}

checkSqlite();
