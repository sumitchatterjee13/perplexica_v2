const Database = require('better-sqlite3');
const path = require('path');

const migration = async () => {
  const sqlite = new Database(path.join(process.cwd(), 'data/db.sqlite'));
  
  try {
    // Add the userId column to the chats table
    sqlite.exec(`ALTER TABLE chats ADD COLUMN userId TEXT REFERENCES users(id);`);
    console.log('Migration complete: Added userId column to chats table');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    sqlite.close();
  }
};

// Run the migration
migration().catch(console.error);
