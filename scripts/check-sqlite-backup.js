const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function checkSqlite() {
    console.log('📦 Checking legacy SQLite backup (prisma/dev.db)...');
    
    // Create a temporary prisma client for SQLite
    const sqliteClient = new PrismaClient({
        datasources: {
            db: {
                url: `file:${path.join(__dirname, '..', 'prisma', 'dev.db')}`
            }
        }
    });

    try {
        const userCount = await sqliteClient.user.count();
        console.log(`✅ Found ${userCount} users in SQLite backup.`);
        
        if (userCount > 0) {
            const users = await sqliteClient.user.findMany({
                take: 10,
                select: { email: true, name: true, createdAt: true }
            });
            console.log('Sample users from backup:', users);
        }
    } catch (err) {
        console.error('❌ Error reading SQLite backup:', err.message);
    } finally {
        await sqliteClient.$disconnect();
    }
}

checkSqlite();
