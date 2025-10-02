const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

// Path to the database file
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);

// Initialize the database with a default structure
const db = new Low(adapter, { integrations: [] });

async function initDB() {
  // Read data from file, creating the file if it doesn't exist
  await db.read();
  // Write data to file to ensure it's created on first run
  await db.write();
}

// Initialize and export the db instance
initDB();
module.exports = db;
