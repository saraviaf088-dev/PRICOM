const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Atomic file-based transactional collections with atomic temp writing
function readCollection(name) {
  const filePath = path.join(DB_PATH, `${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading collection ${name}:`, err);
    return [];
  }
}

function writeCollection(name, data) {
  const filePath = path.join(DB_PATH, `${name}.json`);
  const tempPath = path.join(DB_PATH, `${name}.tmp.${Date.now()}`);
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing collection ${name}:`, err);
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
  }
}

function initDatabase() {
  // Seed initial admin from environment variables if not present
  const adminUser = process.env.INITIAL_ADMIN_USER || 'admin';
  const adminPass = process.env.INITIAL_ADMIN_PASS || 'PricomOficial2026!';
  
  const admins = readCollection('admins');
  if (admins.length === 0) {
    const hashedPassword = bcrypt.hashSync(adminPass, 10);
    admins.push({
      id: 'admin-1',
      username: adminUser,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    writeCollection('admins', admins);
    console.log(`✅ Usuario Administrador Oficial creado: ${adminUser}`);
  }

  // Ensure all standard collections exist
  ['products', 'orders', 'payments', 'users'].forEach(name => {
    const data = readCollection(name);
    if (!fs.existsSync(path.join(DB_PATH, `${name}.json`))) {
      writeCollection(name, data);
    }
  });

  console.log('✅ Base de datos inicializada correctamente');
  return { readCollection, writeCollection };
}

module.exports = { initDatabase, readCollection, writeCollection };
