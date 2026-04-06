const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log(`📂 Inspecting SQLite backup: ${dbPath}`);

db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
    if (err) {
        console.error('❌ Error reading tables:', err.message);
        return;
    }
    console.log('Tables in backup:', tables.map(t => t.name));

    db.get("SELECT COUNT(*) as count FROM User;", (err, row) => {
        if (err) {
            console.error('❌ Error counting users:', err.message);
        } else {
            console.log(`✅ TOTAL USERS IN SQLITE BACKUP: ${row.count}`);
        }
        
        db.all("SELECT email, name, createdAt FROM User ORDER BY createdAt DESC LIMIT 5;", (err, users) => {
            if (!err) {
                console.log('Latest users in backup:', users);
            }
            db.close();
        });
    });
});
