const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Supabase conectado');
} else {
  console.log('⚠️  Supabase no configurado, usando archivos locales');
}

// Fallback: local file storage
const fs = require('fs');
const path = require('path');
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
  if (supabase) {
    const { data, error } = await supabase.from(name).select('id, data');
    if (error) { console.error(`Supabase read ${name}:`, error.message); return []; }
    return (data || []).map(row => ({ id: row.id, ...row.data }));
  }
  return readLocal(name);
}

async function writeCollection(name, data) {
  if (supabase) {
    // Upsert all rows
    const rows = data.map(item => ({
      id: item.id,
      data: { ...item },
      updated_at: new Date().toISOString()
    }));
    // Clear and re-insert for simplicity
    await supabase.from(name).delete().neq('id', '__none__');
    if (rows.length > 0) {
      const { error } = await supabase.from(name).upsert(rows, { onConflict: 'id' });
      if (error) console.error(`Supabase write ${name}:`, error.message);
    }
    return;
  }
  writeLocal(name, data);
}

async function addToCollection(name, item) {
  if (supabase) {
    const { error } = await supabase.from(name).upsert({
      id: item.id,
      data: { ...item },
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) console.error(`Supabase add ${name}:`, error.message);
    return;
  }
  const items = readLocal(name);
  items.push(item);
  writeLocal(name, items);
}

async function updateInCollection(name, id, updates) {
  if (supabase) {
    const { data, error: fetchErr } = await supabase.from(name).select('data').eq('id', id).single();
    if (fetchErr || !data) return null;
    const merged = { ...data.data, ...updates, id };
    const { error } = await supabase.from(name).upsert({
      id,
      data: merged,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) console.error(`Supabase update ${name}:`, error.message);
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
  if (supabase) {
    const { error } = await supabase.from(name).delete().eq('id', id);
    if (error) console.error(`Supabase delete ${name}:`, error.message);
    return;
  }
  const items = readLocal(name);
  writeLocal(name, items.filter(i => i.id !== id));
}

function initDatabase() {
  if (!supabase) {
    // Local file mode
    const admins = readLocal('admins');
    if (admins.length === 0) {
      const adminUser = process.env.INITIAL_ADMIN_USER || 'admin';
      const adminPass = process.env.INITIAL_ADMIN_PASS || 'PricomOficial2026!';
      const hashedPassword = bcrypt.hashSync(adminPass, 10);
      admins.push({ id: 'admin-1', username: adminUser, password: hashedPassword, role: 'admin', createdAt: new Date().toISOString() });
      writeLocal('admins', admins);
    }
  }
  ['products', 'orders', 'payments', 'users', 'admins'].forEach(name => {
    if (!supabase && !fs.existsSync(path.join(DB_PATH, `${name}.json`))) {
      writeLocal(name, []);
    }
  });
  console.log('✅ Base de datos inicializada correctamente');
}

module.exports = { initDatabase, readCollection, writeCollection, addToCollection, updateInCollection, deleteFromCollection };
