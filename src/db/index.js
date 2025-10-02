const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

// Path to the database file
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);

// Initialize the database with a default structure
const db = new Low(adapter, { integrations: [] });

async function initDB() {
  try {
    await db.read();
  } catch (e) {
    console.error("Error reading database, re-initializing...", e);
    // If the file is corrupt or invalid, re-initialize it with default data
    db.data = { integrations: [] };
  }
  // Always write the file to ensure it's created or repaired
  await db.write();
}

// Initialize and export the db instance
initDB();
module.exports = db;
