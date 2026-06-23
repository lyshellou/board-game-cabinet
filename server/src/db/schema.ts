import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, '..', '..');
const DB_PATH = path.join(DB_DIR, 'data.db');

let db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!db) {
    if (!existsSync(DB_DIR)) {
      mkdirSync(DB_DIR, { recursive: true });
    }
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode=WAL');
    db.exec('PRAGMA foreign_keys=ON');
  }
  return db;
}

export function initDb(): void {
  const database = getDb();
  database.exec(`
    CREATE TABLE IF NOT EXISTS board_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      player_count_min INTEGER NOT NULL DEFAULT 1,
      player_count_max INTEGER NOT NULL DEFAULT 4,
      duration_per_player INTEGER NOT NULL DEFAULT 30,
      difficulty REAL NOT NULL DEFAULT 2.0,
      rating REAL NOT NULL DEFAULT 5.0,
      review TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      published_year INTEGER NOT NULL DEFAULT 2020,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Migration: add cover_image column if it doesn't exist (for existing DBs)
  try {
    database.exec(`ALTER TABLE board_games ADD COLUMN cover_image TEXT NOT NULL DEFAULT ''`);
  } catch {
    // Column already exists — safe to ignore
  }

  // Play records table
  database.exec(`
    CREATE TABLE IF NOT EXISTS play_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      played_at TEXT NOT NULL DEFAULT (date('now')),
      player_count INTEGER NOT NULL DEFAULT 2,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      score TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (game_id) REFERENCES board_games(id) ON DELETE CASCADE
    )
  `);

  // Migration: add score column if missing (for existing DBs that had old schema)
  try {
    database.exec(`ALTER TABLE play_records ADD COLUMN score TEXT NOT NULL DEFAULT ''`);
  } catch {
    // Column already exists — safe to ignore
  }
}
