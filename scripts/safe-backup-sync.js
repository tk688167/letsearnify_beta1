const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function safetyDump() {
    console.log('🛡️ Starting Safe Data Backup Sync...');
    
    // Ensure backup directory exists
    const backupDir = path.join(__dirname, '..', '.db_backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
        console.log(`✅ Created backup directory: ${backupDir}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `user_backup_${timestamp}.json`);

    try {
        console.log('📡 Fetching current user data...');
        const users = await prisma.user.findMany({
            include: {
                transactions: true,
                investments: true,
                referrals: true
            }
        });

        if (users.length === 0) {
            console.log('⚠️ No users found in the database. Backup skipped or verify connection.');
            return;
        }

        console.log(`📦 Creating snapshot of ${users.length} users...`);
        fs.writeFileSync(backupPath, JSON.stringify(users, null, 2));
        
        console.log(`✅ DATABASE SNAPSHOT CREATED SAFELY: ${backupPath}`);
        console.log('User data preserved. All records secured.');
    } catch (err) {
        console.error('❌ CRITICAL ERROR DURING BACKUP:', err.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

safetyDump();
