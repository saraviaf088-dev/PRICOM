const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

function readCollection(name) {
  const filePath = path.join(DB_PATH, `${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeCollection(name, data) {
  const filePath = path.join(DB_PATH, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function initDatabase() {
  // Seed admin user if not exists
  const admins = readCollection('admins');
  if (admins.length === 0) {
    const hashedPassword = bcrypt.hashSync('pricom2026', 10);
    admins.push({
      id: 1,
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    writeCollection('admins', admins);
    console.log('✅ Admin user created: admin / pricom2026');
  }

  // Initialize empty collections if they don't exist
  ['products', 'orders', 'payments', 'users'].forEach(name => {
    const data = readCollection(name);
    if (data.length === 0) {
      writeCollection(name, []);
    }
  });

  console.log('✅ Database initialized');
  return { readCollection, writeCollection };
}

module.exports = { initDatabase, readCollection, writeCollection };
