const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const path = require('path');

async function createAdminUser() {
  try {
    // Connect to the database
    const dbPath = path.join(process.cwd(), 'data/db.sqlite');
    console.log(`Connecting to database at: ${dbPath}`);
    
    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite);

    // Admin user details - you can change these as needed
    const adminUser = {
      id: uuidv4(),
      username: 'admin',
      password: 'Perplexica@2025', // This will be hashed below
      name: 'Administrator',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };

    console.log('Creating admin user...');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    adminUser.password = await bcrypt.hash(adminUser.password, salt);

    // Check if admin user already exists to avoid duplicates
    const existingAdmins = db.select().from('users').where('username', '=', 'admin').all();

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Insert the admin user
    db.insert('users').values(adminUser).run();

    console.log('Admin user created successfully!');
    console.log('Username:', adminUser.username);
    console.log('Password: Perplexica@2025');
    console.log('Log in at http://localhost:3000/login');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
