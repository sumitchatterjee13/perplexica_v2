import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import path from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const migration = async () => {
  const sqlite = new Database(path.join(process.cwd(), 'data/db.sqlite'));
  const db = drizzle(sqlite);

  // Add the userId column to the chats table
  sqlite.exec(`ALTER TABLE chats ADD COLUMN userId TEXT REFERENCES users(id);`);

  console.log('Migration complete: Added userId column to chats table');
  sqlite.close();
};

// Run the migration
migration().catch(console.error);
