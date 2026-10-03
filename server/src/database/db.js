import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

/**
 * Initializes and returns the SQLite database connection.
 * @param {string} [dbPath] Custom database path (optional)
 * @returns {Database} SQLite Database connection
 */
export function getDb(dbPath = null) {
  if (dbInstance && !dbPath) {
    return dbInstance;
  }

  const targetPath = dbPath || process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/release-ready.sqlite');

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(targetPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  if (!dbPath) {
    dbInstance = db;
  }

  return db;
}

/**
 * Closes the database connection.
 */
export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
