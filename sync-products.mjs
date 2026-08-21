import { PRODUCTS } from './src/data/products.js';

const API = 'https://pricom-api.onrender.com/api';

async function sync() {
  const products = PRODUCTS.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    colors: p.colors,
    badges: p.badges,
    sizes: p.sizes,
    images: p.images,
    specs: p.specs,
    price: p.price,
    originalPrice: p.originalPrice,
    stockCount: p.stockCount,
    freeShipping: p.freeShipping,
    financing: p.financing,
    rating: p.rating,
    reviews: p.reviews,
    warranty: p.warranty,
    deliveryDays: p.deliveryDays
  }));

  // Login
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'PricomOficial2026!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Logged in');

  // Sync
  console.log(`Syncing ${products.length} products...`);
  const res = await fetch(`${API}/sync/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ products })
  });
  const data = await res.json();
  console.log('Response:', JSON.stringify(data));

  // Verify
  const verify = await fetch(`${API}/products`);
  const all = await verify.json();
  console.log(`Verified: ${all.length} products on server`);
  all.forEach(p => console.log(`  - ${p.name}`));
}

sync().catch(console.error);
