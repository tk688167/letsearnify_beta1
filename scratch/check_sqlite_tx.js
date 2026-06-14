const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('prisma/dev.db');

db.serialize(() => {
  db.all('SELECT * FROM "Transaction"', (err, rows) => {
    if (err) {
      console.error('Error querying Transaction:', err.message);
    } else {
      console.log('Transactions in SQLite:', rows.length);
    }
  });
});

db.close();
