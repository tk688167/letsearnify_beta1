const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');

const prisma = new PrismaClient();

async function monitor() {
    console.log('🔄 MONITORING NEON RESTORATION...');
    console.log('================================');
    
    let iterations = 0;
    const maxIterations = 12; // 2 minutes (12 * 10s)
    
    while (iterations < maxIterations) {
        try {
            const userCount = await prisma.user.count();
            if (userCount > 0) {
                console.log(`\n✨ SUCCESS: User data detected (${userCount} records)!`);
                console.log('User data detected and ready for safe backup.');
                
                // Trigger the safe backup
                console.log('📦 Initiating pre-flight snapshot...');
                const backupScript = path.join(__dirname, 'safe-backup-sync.js');
                const output = execSync(`node "${backupScript}"`, { encoding: 'utf8' });
                console.log(output);
                
                console.log('Safe backup completed.');
                return;
            } else {
                process.stdout.write('.');
            }
        } catch (err) {
            console.error('\n❌ Connection Error:', err.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 10000));
        iterations++;
    }
    
    console.log('\n⌛ Monitoring period ended. Database still showing 0 users.');
    console.log('Please confirm if the restoration in Neon Console is complete.');
}

monitor()
    .finally(async () => {
        await prisma.$disconnect();
    });
