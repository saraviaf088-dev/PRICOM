const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let useSupabase = false;
if (SUPABASE_URL && SUPABASE_KEY) {
  useSupabase = true;
  console.log('✅ Supabase conectado via HTTPS');
} else {
  console.log('⚠️  Supabase no configurado, usando archivos locales');
}

// HTTPS request helper
function httpsRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (!data || data.trim() === '') return resolve([]);
          try { resolve(JSON.parse(data)); } catch { resolve([]); }
        } else {
          console.error(`HTTPS ${method} ${parsedUrl.pathname}: ${res.statusCode} ${data.substring(0, 200)}`);
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`HTTPS ${method} ${parsedUrl.pathname} error: ${err.message}`);
      reject(err);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Local file storage
const DB_PATH = path.join(__dirname, 'data');
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

function readLocal(name) {
  const fp = path.join(DB_PATH, `${name}.json`);
  if (!fs.existsSync(fp)) return [];
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return []; }
}

function writeLocal(name, data) {
  const fp = path.join(DB_PATH, `${name}.json`);
  const tmp = path.join(DB_PATH, `${name}.tmp.${Date.now()}`);
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, fp);
  } catch (err) {
    console.error(`Error writing ${name}:`, err);
    if (fs.existsSync(tmp)) try { fs.unlinkSync(tmp); } catch {}
  }
}

async function readCollection(name) {
  if (useSupabase) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${name}?select=id,data`;
      const rows = await httpsRequest(url, 'GET');
      if (!Array.isArray(rows)) return [];
      return rows.map(row => ({ ...row.data, id: row.id }));
    } catch (err) {
      console.error(`readCollection(${name}) failed, falling back to local:`, err.message);
      return readLocal(name);
    }
  }
  return readLocal(name);
}

async function writeCollection(name, data) {
  if (useSupabase) {
    try {
      // Delete all existing rows
      const existing = await httpsRequest(`${SUPABASE_URL}/rest/v1/${name}?select=id`, 'GET');
      if (Array.isArray(existing) && existing.length > 0) {
        for (const row of existing) {
          try {
            await httpsRequest(`${SUPABASE_URL}/rest/v1/${name}?id=eq.${encodeURIComponent(row.id)}`, 'DELETE');
          } catch (e) { /* ignore individual delete errors */ }
        }
      }
      // Insert in batches
      if (data.length > 0) {
        const rows = data.map(item => ({
          id: item.id,
          data: item,
          updated_at: new Date().toISOString()
        }));
        for (let i = 0; i < rows.length; i += 50) {
          const batch = rows.slice(i, i + 50);
          try {
            await httpsRequest(`${SUPABASE_URL}/rest/v1/${name}`, 'POST', batch);
          } catch (e) {
            console.error(`Batch insert failed at index ${i}:`, e.message);
          }
        }
      }
      return;
    } catch (err) {
      console.error(`writeCollection(${name}) failed, falling back to local:`, err.message);
    }
  }
  writeLocal(name, data);
}

async function addToCollection(name, item) {
  if (useSupabase) {
    try {
      const row = { id: item.id, data: item, updated_at: new Date().toISOString() };
      await httpsRequest(`${SUPABASE_URL}/rest/v1/${name}`, 'POST', row);
      return;
    } catch (err) {
      console.error(`addToCollection(${name}) failed:`, err.message);
    }
  }
  const items = readLocal(name);
  items.push(item);
  writeLocal(name, items);
}

async function updateInCollection(name, id, updates) {
  if (useSupabase) {
    try {
      const rows = await httpsRequest(`${SUPABASE_URL}/rest/v1/${name}?id=eq.${encodeURIComponent(id)}&select=id,data`, 'GET');
      if (!Array.isArray(rows) || rows.length === 0) return null;
      const merged = { ...rows[0].data, ...updates, id };
      await httpsRequest(`${SUPABASE_URL}/rest/v1/${name}?id=eq.${encodeURIComponent(id)}`, 'PATCH', { data: merged, updated_at: new Date().toISOString() });
      return merged;
    } catch (err) {
      console.error(`updateInCollection(${name}) failed:`, err.message);
    }
  }
  const items = readLocal(name);
  const idx = items.findIndex(i => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates, id };
    writeLocal(name, items);
    return items[idx];
  }
  return null;
}

async function deleteFromCollection(name, id) {
  if (useSupabase) {
    try {
      await httpsRequest(`${SUPABASE_URL}/rest/v1/${name}?id=eq.${encodeURIComponent(id)}`, 'DELETE');
      return;
    } catch (err) {
      console.error(`deleteFromCollection(${name}) failed:`, err.message);
    }
  }
  const items = readLocal(name);
  writeLocal(name, items.filter(i => i.id !== id));
}

function initDatabase() {
  if (!useSupabase) {
    const admins = readLocal('admins');
    if (admins.length === 0) {
      const adminUser = process.env.INITIAL_ADMIN_USER || 'admin';
      const adminPass = process.env.INITIAL_ADMIN_PASS || 'PricomOficial2026!';
      const hashedPassword = bcrypt.hashSync(adminPass, 10);
      admins.push({ id: 'admin-1', username: adminUser, password: hashedPassword, role: 'admin', createdAt: new Date().toISOString() });
      writeLocal('admins', admins);
    }
    ['products', 'orders', 'payments', 'users', 'admins'].forEach(name => {
      if (!fs.existsSync(path.join(DB_PATH, `${name}.json`))) writeLocal(name, []);
    });
  }
  console.log('✅ Base de datos inicializada correctamente');
}

module.exports = { initDatabase, readCollection, writeCollection, addToCollection, updateInCollection, deleteFromCollection };
