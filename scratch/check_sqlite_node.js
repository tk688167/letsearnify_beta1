const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('prisma/dev.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.get('SELECT COUNT(*) as count FROM User', (err, row) => {
    if (err) {
      console.error('Error querying User:', err.message);
    } else {
      console.log('User count in SQLite:', row.count);
    }
  });

  db.get('SELECT COUNT(*) as count FROM DailyEarningInvestment', (err, row) => {
    if (err) {
      console.error('Error querying DailyEarningInvestment:', err.message);
    } else {
      console.log('DailyEarningInvestment count in SQLite:', row.count);
    }
  });

  db.all('SELECT * FROM DailyEarningInvestment LIMIT 5', (err, rows) => {
    if (err) {
      console.error('Error querying samples:', err.message);
    } else if (rows && rows.length > 0) {
      console.log('Sample pools:', JSON.stringify(rows, null, 2));
    }
  });
});

db.close();
