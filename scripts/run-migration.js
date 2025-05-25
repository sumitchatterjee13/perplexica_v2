// Run the migration to add userId to chats
const { spawn } = require('child_process');
const path = require('path');

console.log('Running migration to add userId to chats table...');

const migrationProcess = spawn('node', [
  path.join(__dirname, '../src/lib/db/migrations/add-userId-to-chats.js')
]);

migrationProcess.stdout.on('data', (data) => {
  console.log(`${data}`);
});

migrationProcess.stderr.on('data', (data) => {
  console.error(`${data}`);
});

migrationProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Migration completed successfully!');
  } else {
    console.error(`Migration process exited with code ${code}`);
  }
});
