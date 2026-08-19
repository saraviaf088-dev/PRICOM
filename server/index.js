const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { initDatabase, readCollection, writeCollection } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pricom-secret-key-2026';

// Initialize database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalido' });
  }
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const admins = readCollection('admins');
  
  const admin = admins.find(a => a.username === username);
  if (!admin) return res.status(401).json({ error: 'Credenciales incorrectas' });
  
  const validPassword = bcrypt.compareSync(password, admin.password);
  if (!validPassword) return res.status(401).json({ error: 'Credenciales incorrectas' });
  
  const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, admin: { id: admin.id, username: admin.username, role: admin.role } });
});

// ==================== PRODUCT ROUTES ====================

app.get('/api/products', (req, res) => {
  const { category, search, limit = 100, offset = 0 } = req.query;
  let products = readCollection('products');
  
  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }
  
  res.json(products.slice(Number(offset), Number(offset) + Number(limit)));
});

app.get('/api/products/:id', (req, res) => {
  const products = readCollection('products');
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

app.post('/api/products', authMiddleware, (req, res) => {
  const products = readCollection('products');
  const id = req.body.id || `product-${Date.now()}`;
  const slug = req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const newProduct = {
    id,
    slug,
    name: req.body.name,
    brand: req.body.brand,
    category: req.body.category,
    subCategory: req.body.subCategory || '',
    price: req.body.price,
    originalPrice: req.body.originalPrice || req.body.price,
    discount: req.body.discount || 0,
    isOffer: req.body.isOffer || false,
    isNew: req.body.isNew || false,
    isFeatured: req.body.isFeatured || false,
    rating: req.body.rating || 4.8,
    reviewCount: req.body.reviewCount || 0,
    images: req.body.images || [],
    colors: req.body.colors || [],
    material: req.body.material || '',
    style: req.body.style || '',
    dimensions: req.body.dimensions || {},
    shortDescription: req.body.shortDescription || '',
    fullDescription: req.body.fullDescription || '',
    features: req.body.features || [],
    specs: req.body.specs || [],
    warranty: req.body.warranty || '',
    availability: req.body.availability || 'En Stock',
    stockCount: req.body.stockCount || 0,
    locations: req.body.locations || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  writeCollection('products', products);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
  const products = readCollection('products');
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
  
  products[index] = { ...products[index], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
  writeCollection('products', products);
  res.json(products[index]);
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
  let products = readCollection('products');
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
  
  products.splice(index, 1);
  writeCollection('products', products);
  res.json({ message: 'Producto eliminado' });
});

// ==================== ORDER ROUTES ====================

app.post('/api/orders', (req, res) => {
  const orders = readCollection('orders');
  const orderId = uuidv4();
  const orderNumber = `PR-${Date.now().toString().slice(-6)}`;
  
  const newOrder = {
    id: orderId,
    orderNumber,
    customerName: req.body.customerName,
    customerEmail: req.body.customerEmail || '',
    customerPhone: req.body.customerPhone,
    customerNIT: req.body.customerNIT || '',
    deliveryType: req.body.deliveryType || 'home',
    department: req.body.department || '',
    city: req.body.city || '',
    zone: req.body.zone || '',
    address: req.body.address || '',
    reference: req.body.reference || '',
    selectedShowroom: req.body.selectedShowroom || '',
    paymentMethod: req.body.paymentMethod,
    paymentStatus: 'pending',
    paymentReference: '',
    orderStatus: 'pending',
    subtotal: req.body.subtotal,
    shippingCost: req.body.shippingCost || 0,
    discountAmount: req.body.discountAmount || 0,
    discountCode: req.body.discountCode || '',
    total: req.body.total,
    items: req.body.items || [],
    notes: req.body.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  writeCollection('orders', orders);
  
  res.status(201).json({ orderId, orderNumber, total: newOrder.total });
});

app.get('/api/orders', authMiddleware, (req, res) => {
  const { status, limit = 100, offset = 0 } = req.query;
  let orders = readCollection('orders');
  
  if (status && status !== 'all') {
    orders = orders.filter(o => o.orderStatus === status);
  }
  
  // Sort by date descending
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(orders.slice(Number(offset), Number(offset) + Number(limit)));
});

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const orders = readCollection('orders');
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
  res.json(order);
});

app.put('/api/orders/:id/status', authMiddleware, (req, res) => {
  const orders = readCollection('orders');
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Estado invalido' });
  
  orders[index].orderStatus = status;
  orders[index].updatedAt = new Date().toISOString();
  
  // If paid, update payment and decrement stock
  if (status === 'paid') {
    orders[index].paymentStatus = 'completed';
    
    // Decrement stock
    const products = readCollection('products');
    for (const item of orders[index].items) {
      const pIndex = products.findIndex(p => p.id === item.product.id);
      if (pIndex !== -1) {
        products[pIndex].stockCount = Math.max(0, products[pIndex].stockCount - item.quantity);
      }
    }
    writeCollection('products', products);
  }
  
  writeCollection('orders', orders);
  res.json({ message: 'Estado actualizado' });
});

// ==================== PAYMENT ROUTES ====================

app.post('/api/payments/process', (req, res) => {
  const { orderId, paymentMethod, cardData, tigoPhone } = req.body;
  const orders = readCollection('orders');
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  
  const payments = readCollection('payments');
  const paymentId = uuidv4();
  
  let paymentResult = {};
  
  switch (paymentMethod) {
    case 'card':
      paymentResult = {
        status: 'completed',
        culqiChargeId: `ch_${Date.now()}`,
        cardLastFour: cardData?.number?.slice(-4) || '4242',
        cardBrand: 'visa',
        metadata: { type: 'card', installments: cardData?.installments || 1 }
      };
      break;
      
    case 'qr':
      paymentResult = {
        status: 'pending',
        paymentReference: `QR-${Date.now()}`,
        metadata: { type: 'qr', bank: 'interbancario', amount: orders[orderIndex].total }
      };
      break;
      
    case 'tigo':
      paymentResult = {
        status: 'completed',
        paymentReference: `TIGO-${Date.now()}`,
        metadata: { type: 'tigo', phone: tigoPhone }
      };
      break;
      
    case 'transfer':
      paymentResult = {
        status: 'pending',
        paymentReference: `TRANS-${Date.now()}`,
        metadata: { type: 'transfer', bank: 'BCP', account: '123456789', cta: '0051234' }
      };
      break;
      
    default:
      return res.status(400).json({ error: 'Metodo de pago invalido' });
  }
  
  // Save payment
  const payment = {
    id: paymentId,
    orderId,
    method: paymentMethod,
    amount: orders[orderIndex].total,
    currency: 'BOB',
    status: paymentResult.status,
    culqiChargeId: paymentResult.culqiChargeId || null,
    cardLastFour: paymentResult.cardLastFour || null,
    cardBrand: paymentResult.cardBrand || null,
    paymentReference: paymentResult.paymentReference || null,
    metadata: paymentResult.metadata || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  payments.push(payment);
  writeCollection('payments', payments);
  
  // Update order
  orders[orderIndex].paymentStatus = paymentResult.status;
  orders[orderIndex].paymentReference = paymentResult.paymentReference || paymentResult.culqiChargeId || '';
  orders[orderIndex].updatedAt = new Date().toISOString();
  
  if (paymentResult.status === 'completed') {
    orders[orderIndex].orderStatus = 'paid';
    
    // Decrement stock
    const products = readCollection('products');
    for (const item of orders[orderIndex].items) {
      const pIndex = products.findIndex(p => p.id === item.product.id);
      if (pIndex !== -1) {
        products[pIndex].stockCount = Math.max(0, products[pIndex].stockCount - item.quantity);
      }
    }
    writeCollection('products', products);
  }
  
  writeCollection('orders', orders);
  
  res.json({
    success: true,
    paymentId,
    status: paymentResult.status,
    reference: paymentResult.paymentReference || paymentResult.culqiChargeId
  });
});

// ==================== STATS ROUTES ====================

app.get('/api/stats/dashboard', authMiddleware, (req, res) => {
  const products = readCollection('products');
  const orders = readCollection('orders');
  
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => ['paid', 'delivered'].includes(o.orderStatus))
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
  const paidOrders = orders.filter(o => o.orderStatus === 'paid').length;
  const lowStockProducts = products.filter(p => p.stockCount < 5).length;
  
  // Recent orders (last 10)
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
  
  // Top selling products
  const productSales = {};
  for (const order of orders) {
    if (order.items) {
      for (const item of order.items) {
        const key = item.product.id;
        if (!productSales[key]) {
          productSales[key] = { name: item.product.name, totalSold: 0, revenue: 0 };
        }
        productSales[key].totalSold += item.quantity;
        productSales[key].revenue += item.product.price * item.quantity;
      }
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);
  
  // Sales by category
  const categorySales = {};
  for (const order of orders) {
    if (order.items && ['paid', 'delivered'].includes(order.orderStatus)) {
      for (const item of order.items) {
        const cat = item.product.category || 'Sin categoria';
        if (!categorySales[cat]) categorySales[cat] = { revenue: 0, orders: 0 };
        categorySales[cat].revenue += item.product.price * item.quantity;
        categorySales[cat].orders += 1;
      }
    }
  }
  const salesByCategory = Object.entries(categorySales).map(([category, data]) => ({
    category,
    ...data
  }));
  
  res.json({
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    paidOrders,
    lowStockProducts,
    recentOrders,
    topProducts,
    salesByCategory
  });
});

// ==================== SYNC ROUTES ====================

app.post('/api/sync/products', authMiddleware, (req, res) => {
  const { products } = req.body;
  const existing = readCollection('products');
  
  // Merge: update existing or add new
  for (const newProd of products) {
    const index = existing.findIndex(p => p.id === newProd.id);
    if (index !== -1) {
      existing[index] = { ...existing[index], ...newProd };
    } else {
      existing.push(newProd);
    }
  }
  
  writeCollection('products', existing);
  res.json({ message: `${products.length} productos sincronizados` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PRICOM Server running on http://localhost:${PORT}`);
  console.log(`📦 Database path: ${path.join(__dirname, 'data')}`);
});
