const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let useSupabase = false;
if (SUPABASE_URL && SUPABASE_KEY) {
  useSupabase = true;
  console.log('✅ Supabase conectado via REST API');
} else {
  console.log('⚠️  Supabase no configurado, usando archivos locales');
}

// Supabase REST helpers
async function supabaseRequest(table, method = 'GET', body = null, query = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=minimal' : 'return=representation'
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text();
    console.error(`Supabase ${method} ${table}: ${err}`);
    return null;
  }
  if (res.status === 204) return [];
  return await res.json();
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
    const rows = await supabaseRequest(name, 'GET', null, '?select=id,data');
    if (rows === null) return [];
    return rows.map(row => ({ ...row.data, id: row.id }));
  }
  return readLocal(name);
}

async function writeCollection(name, data) {
  if (useSupabase) {
    // Delete all existing
    const existing = await supabaseRequest(name, 'GET', null, '?select=id');
    if (existing && existing.length > 0) {
      const ids = existing.map(r => r.id);
      // Delete in batches (Supabase doesn't support delete all without filter)
      for (const id of ids) {
        await supabaseRequest(name, 'DELETE', null, `?id=eq.${encodeURIComponent(id)}`);
      }
    }
    // Insert all
    if (data.length > 0) {
      const rows = data.map(item => ({
        id: item.id,
        data: item,
        updated_at: new Date().toISOString()
      }));
      // Supabase REST has a limit on array size, insert in batches of 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const result = await supabaseRequest(name, 'POST', batch);
        if (result === null) console.error(`Supabase batch insert failed at index ${i}`);
      }
    }
    return;
  }
  writeLocal(name, data);
}

async function addToCollection(name, item) {
  if (useSupabase) {
    const row = { id: item.id, data: item, updated_at: new Date().toISOString() };
    await supabaseRequest(name, 'POST', row);
    return;
  }
  const items = readLocal(name);
  items.push(item);
  writeLocal(name, items);
}

async function updateInCollection(name, id, updates) {
  if (useSupabase) {
    const rows = await supabaseRequest(name, 'GET', null, `?id=eq.${encodeURIComponent(id)}&select=id,data`);
    if (!rows || rows.length === 0) return null;
    const merged = { ...rows[0].data, ...updates, id };
    await supabaseRequest(name, 'PATCH', { data: merged, updated_at: new Date().toISOString() }, `?id=eq.${encodeURIComponent(id)}`);
    return merged;
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
    await supabaseRequest(name, 'DELETE', null, `?id=eq.${encodeURIComponent(id)}`);
    return;
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
