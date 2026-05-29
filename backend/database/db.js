const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Vercel: filesystem es read-only excepto /tmp.
// En local usa el directorio del proyecto para persistencia entre reinicios.
const DB_PATH = process.env.DB_PATH ||
  (process.env.VERCEL ? '/tmp/deportealex.db' : path.join(__dirname, '..', 'deportealex.db'));
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
