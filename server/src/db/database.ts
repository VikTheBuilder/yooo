// Uses Node.js 22+ built-in SQLite — no native compilation required
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../../campusswap.db');

const db = new DatabaseSync(DB_PATH);

export function initDb(): void {
  // PRAGMAs must be run separately from CREATE TABLE statements
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      hostel        TEXT    NOT NULL,
      batch         TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS listings (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title                TEXT    NOT NULL,
      description          TEXT    NOT NULL,
      category             TEXT    NOT NULL CHECK(category IN ('book','notes','calculator','lab-equipment','other')),
      course               TEXT,
      semester             TEXT,
      condition            TEXT    NOT NULL CHECK(condition IN ('new','good','fair')),
      mode                 TEXT    NOT NULL CHECK(mode IN ('sell','rent','swap')),
      price                REAL,
      rent_price_per_week  REAL,
      swap_wanted          TEXT,
      status               TEXT    NOT NULL DEFAULT 'available' CHECK(status IN ('available','sold','rented','swapped','closed')),
      created_at           TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS requests (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT    NOT NULL,
      course     TEXT,
      semester   TEXT,
      note       TEXT,
      status     TEXT    NOT NULL DEFAULT 'open' CHECK(status IN ('open','fulfilled','closed')),
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      buyer_id   INTEGER NOT NULL REFERENCES users(id),
      seller_id  INTEGER NOT NULL REFERENCES users(id),
      type       TEXT    NOT NULL CHECK(type IN ('sale','rent','swap')),
      status     TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','completed','cancelled')),
      due_date   TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default db;
