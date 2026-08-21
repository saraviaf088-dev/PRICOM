require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const { initDatabase, readCollection, writeCollection, addToCollection, updateInCollection, deleteFromCollection } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pricom-secret-key-2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware & Security
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '10mb' }));

// Rate limiters for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Demasiados intentos. Por favor intenta más tarde.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/users/login', authLimiter);

// Email transporter configuration
const SMTP_CONFIGURED = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
const transporter = SMTP_CONFIGURED ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}) : null;

// Generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send verification email
async function sendVerificationEmail(email, token, userName) {
  const verificationUrl = `${FRONTEND_URL}/verificar-email?token=${token}`;
  
  const mailOptions = {
    from: '"PRICOM Bolivia" <noreply@pricom.bo>',
    to: email,
    subject: 'Verifica tu correo electrónico - PRICOM',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); padding: 30px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">PRICOM BOLIVIA</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Distribuidor Oficial Sealy</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #1a1c20; margin: 0 0 20px 0; font-size: 22px;">¡Bienvenido, ${userName}!</h2>
                    <p style="color: #4a5568; line-height: 1.6; margin: 0 0 20px 0;">
                      Gracias por crear tu cuenta en PRICOM. Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de correo electrónico.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">
                            Verificar Mi Correo Electrónico
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                      Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
                    </p>
                    <p style="color: #0d6efd; font-size: 13px; word-break: break-all; margin: 0 0 20px 0;">
                      ${verificationUrl}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    
                    <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                      Este enlace expirará en 24 horas. Si no solicitaste esta verificación, puedes ignorar este mensaje.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                      © 2026 PRICOM Bolivia S.R.L. Todos los derechos reservados.
                    </p>
                    <p style="color: #a0aec0; font-size: 12px; margin: 5px 0 0 0;">
                      Distribuidor Oficial Autorizado Sealy
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };
  
  try {
    if (!transporter) {
      console.log('⚠️ SMTP no configurado. Correo de verificación no enviado.');
      return false;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Initialize database
initDatabase();

// CORS with specific allowed origins
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://proy-pricom.vercel.app',
    'https://pricom.vercel.app'
  ],
  credentials: true
}));

// Disable caching for all API responses
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

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

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const admins = await readCollection('admins');
  
  // Check DB admins first
  let admin = admins.find(a => a.username === username);
  
  // Fallback: check hardcoded credentials
  if (!admin && username === 'admin' && password === 'PricomOficial2026!') {
    // Auto-create admin with correct username if not exists
    admin = admins.find(a => a.username === 'admin');
    if (!admin) {
      const hashedPassword = bcrypt.hashSync('PricomOficial2026!', 10);
      const newAdmin = { id: 'admin-1', username: 'admin', password: hashedPassword, role: 'admin', createdAt: new Date().toISOString() };
      await addToCollection('admins', newAdmin);
      admin = newAdmin;
    }
  }
  
  if (!admin) return res.status(401).json({ error: 'Credenciales incorrectas' });
  
  const validPassword = bcrypt.compareSync(password, admin.password);
  if (!validPassword) return res.status(401).json({ error: 'Credenciales incorrectas' });
  
  const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, admin: { id: admin.id, username: admin.username, role: admin.role } });
});

// ==================== USER ROUTES ====================

// User Registration
app.post('/api/users/register', async (req, res) => {
  const { name, email, password, phone, nit } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
  }
  
  const users = await readCollection('users');
  
  // Check if email already exists
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'Este correo ya está registrado' });
  }
  
  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // Check if SMTP is configured
  const emailConfigured = !!transporter;
  
  // Generate verification token only if SMTP is configured
  const verificationToken = emailConfigured ? generateVerificationToken() : null;
  const verificationExpires = emailConfigured ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;
  
  const newUser = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone: phone || '',
    nit: nit || '',
    emailVerified: !emailConfigured, // Auto-verify if SMTP not configured
    verificationToken,
    verificationExpires,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await addToCollection('users', newUser);
  
  if (emailConfigured) {
    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, name);
    
    if (emailSent) {
      res.status(201).json({ 
        message: 'Cuenta creada. Se ha enviado un correo de verificación a tu dirección de email.',
        userId: newUser.id
      });
    } else {
      res.status(201).json({ 
        message: 'Cuenta creada pero no se pudo enviar el correo de verificación. Contacta a soporte.',
        userId: newUser.id,
        warning: 'Email not sent'
      });
    }
  } else {
    // No SMTP configured - auto-verify and allow login
    res.status(201).json({ 
      message: 'Cuenta creada exitosamente. Puedes iniciar sesión.',
      userId: newUser.id
    });
  }
});

// Verify Email
app.get('/api/users/verify-email', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ error: 'Token de verificación requerido' });
  }
  
  const users = await readCollection('users');
  const user = users.find(u => u.verificationToken === token);
  
  if (!user) {
    return res.status(400).json({ error: 'Token de verificación inválido' });
  }
  
  // Check if token expired
  if (new Date(user.verificationExpires) < new Date()) {
    return res.status(400).json({ error: 'El token de verificación ha expirado. Solicita uno nuevo.' });
  }
  
  // Verify email
  await updateInCollection('users', user.id, {
    emailVerified: true,
    verificationToken: null,
    verificationExpires: null,
    updatedAt: new Date().toISOString()
  });
  
  res.json({ message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.' });
});

// Resend Verification Email
app.post('/api/users/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Correo electrónico requerido' });
  }
  
  const users = await readCollection('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  
  if (user.emailVerified) {
    return res.status(400).json({ error: 'Este correo ya está verificado' });
  }
  
  // Generate new verification token
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  await updateInCollection('users', user.id, {
    verificationToken,
    verificationExpires: verificationExpires.toISOString()
  });
  
  const emailSent = await sendVerificationEmail(email, verificationToken, user.name);
  
  if (emailSent) {
    res.json({ message: 'Correo de verificación reenviado' });
  } else {
    res.status(500).json({ error: 'No se pudo enviar el correo. Intenta más tarde.' });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }
  
  const users = await readCollection('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  
  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  
  if (!user.emailVerified) {
    return res.status(403).json({ error: 'Correo no verificado. Revisa tu bandeja de entrada.', needsVerification: true });
  }
  
  const token = jwt.sign({ 
    id: user.id, 
    email: user.email, 
    name: user.name,
    role: 'user' 
  }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      phone: user.phone,
      nit: user.nit
    } 
  });
});

// Get User Profile (protected)
app.get('/api/users/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await readCollection('users');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      phone: user.phone,
      nit: user.nit,
      emailVerified: user.emailVerified
    });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Update User Profile (protected)
app.put('/api/users/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await readCollection('users');
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const { name, phone, nit } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (nit !== undefined) updates.nit = nit;
    
    await updateInCollection('users', decoded.id, updates);
    
    res.json({ 
      message: 'Perfil actualizado',
      user: { 
        id: user.id, 
        name: name || user.name, 
        email: user.email, 
        phone: phone !== undefined ? phone : user.phone,
        nit: nit !== undefined ? nit : user.nit
      } 
    });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Send Password Reset Email
app.post('/api/users/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Correo electrónico requerido' });
  }
  
  const users = await readCollection('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({ message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
  }
  
  // Generate reset token
  const resetToken = generateVerificationToken();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await updateInCollection('users', user.id, {
    resetPasswordToken: resetToken,
    resetPasswordExpires: resetExpires.toISOString()
  });
  
  // Send reset email
  const resetUrl = `${FRONTEND_URL}/restablecer-password?token=${resetToken}`;
  
  const mailOptions = {
    from: '"PRICOM Bolivia" <noreply@pricom.bo>',
    to: email,
    subject: 'Restablecer tu contraseña - PRICOM',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background-color: #f4f7fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); padding: 30px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">PRICOM BOLIVIA</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #1a1c20; margin: 0 0 20px 0;">Restablecer Contraseña</h2>
                    <p style="color: #4a5568; line-height: 1.6;">Hola ${user.name},</p>
                    <p style="color: #4a5568; line-height: 1.6;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo:</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" style="background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">
                            Restablecer Contraseña
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #a0aec0; font-size: 12px;">Este enlace expirará en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
});

// Reset Password
app.post('/api/users/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
  }
  
  const users = await readCollection('users');
  const user = users.find(u => u.resetPasswordToken === token);
  
  if (!user) {
    return res.status(400).json({ error: 'Token inválido' });
  }
  
  if (new Date(user.resetPasswordExpires) < new Date()) {
    return res.status(400).json({ error: 'El token ha expirado' });
  }
  
  await updateInCollection('users', user.id, {
    password: bcrypt.hashSync(newPassword, 10),
    resetPasswordToken: null,
    resetPasswordExpires: null,
    updatedAt: new Date().toISOString()
  });
  
  res.json({ message: 'Contraseña actualizada exitosamente' });
});

// ==================== PRODUCT ROUTES ====================

app.get('/api/products', async (req, res) => {
  const { category, search, limit = 100, offset = 0 } = req.query;
  let products = await readCollection('products');
  
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

app.get('/api/products/:id', async (req, res) => {
  const products = await readCollection('products');
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

app.post('/api/products', authMiddleware, async (req, res) => {
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
    isHidden: req.body.isHidden || false,
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
  
  await addToCollection('products', newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  const products = await readCollection('products');
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
  
  const updates = { ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
  await updateInCollection('products', req.params.id, updates);
  res.json(updates);
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  const products = await readCollection('products');
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
  
  await deleteFromCollection('products', req.params.id);
  res.json({ message: 'Producto eliminado' });
});

// ==================== ORDER ROUTES ====================

app.post('/api/orders', async (req, res) => {
  const items = req.body.items || [];
  if (items.length === 0) {
    return res.status(400).json({ error: 'El carrito no contiene productos' });
  }

  // Stock check
  const products = await readCollection('products');
  for (const item of items) {
    const prodId = item.product?.id || item.id;
    const prod = products.find(p => p.id === prodId);
    if (prod && prod.stockCount !== undefined && prod.stockCount < item.quantity) {
      return res.status(400).json({ error: `Stock insuficiente para "${prod.name}". Quedan ${prod.stockCount} unidades disponibles.` });
    }
  }

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
  
  await addToCollection('orders', newOrder);
  
  res.status(201).json({ orderId, orderNumber, total: newOrder.total });
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  const { status, limit = 100, offset = 0 } = req.query;
  let orders = await readCollection('orders');
  
  if (status && status !== 'all') {
    orders = orders.filter(o => o.orderStatus === status);
  }
  
  // Sort by date descending
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(orders.slice(Number(offset), Number(offset) + Number(limit)));
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  const orders = await readCollection('orders');
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
  res.json(order);
});

app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
  const orders = await readCollection('orders');
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Estado invalido' });
  
  const updates = {
    orderStatus: status,
    updatedAt: new Date().toISOString()
  };
  
  // If paid, update payment and decrement stock
  if (status === 'paid') {
    updates.paymentStatus = 'completed';
    
    // Decrement stock
    const products = await readCollection('products');
    for (const item of orders[index].items) {
      const product = products.find(p => p.id === item.product.id);
      if (product) {
        await updateInCollection('products', item.product.id, {
          stockCount: Math.max(0, product.stockCount - item.quantity)
        });
      }
    }
  }
  
  await updateInCollection('orders', req.params.id, updates);
  res.json({ message: 'Estado actualizado' });
});

app.put('/api/orders/:id', authMiddleware, async (req, res) => {
  const orders = await readCollection('orders');
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pedido no encontrado' });

  const allowedFields = ['customerName', 'customerEmail', 'customerPhone', 'customerNIT', 'deliveryType', 'department', 'city', 'zone', 'address', 'reference', 'selectedShowroom', 'paymentMethod', 'notes'];
  const updates = { updatedAt: new Date().toISOString() };
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  await updateInCollection('orders', req.params.id, updates);
  res.json({ message: 'Pedido actualizado', order: { ...orders[index], ...updates } });
});

app.delete('/api/orders/:id', authMiddleware, async (req, res) => {
  const orders = await readCollection('orders');
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pedido no encontrado' });

  await deleteFromCollection('orders', req.params.id);
  res.json({ message: 'Pedido eliminado' });
});

// ==================== PAYMENT ROUTES ====================

app.post('/api/payments/process', async (req, res) => {
  const { orderId, paymentMethod, cardData, tigoPhone } = req.body;
  const orders = await readCollection('orders');
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
  
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
  
  await addToCollection('payments', payment);
  
  // Update order
  const orderUpdates = {
    paymentStatus: paymentResult.status,
    paymentReference: paymentResult.paymentReference || paymentResult.culqiChargeId || '',
    updatedAt: new Date().toISOString()
  };
  
  if (paymentResult.status === 'completed') {
    orderUpdates.orderStatus = 'paid';
    
    // Decrement stock
    const products = await readCollection('products');
    for (const item of orders[orderIndex].items) {
      const product = products.find(p => p.id === item.product.id);
      if (product) {
        await updateInCollection('products', item.product.id, {
          stockCount: Math.max(0, product.stockCount - item.quantity)
        });
      }
    }
  }
  
  await updateInCollection('orders', orderId, orderUpdates);
  
  res.json({
    success: true,
    paymentId,
    status: paymentResult.status,
    reference: paymentResult.paymentReference || paymentResult.culqiChargeId
  });
});

// ==================== STATS ROUTES ====================

app.get('/api/stats/dashboard', authMiddleware, async (req, res) => {
  const products = await readCollection('products');
  const orders = await readCollection('orders');
  
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

app.get('/api/stats/monthly-sales', authMiddleware, async (req, res) => {
  const orders = await readCollection('orders');
  const { year } = req.query;
  const targetYear = parseInt(year) || new Date().getFullYear();

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    label: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
    revenue: 0,
    orders: 0,
    itemsSold: 0
  }));

  for (const order of orders) {
    const date = new Date(order.createdAt);
    if (date.getFullYear() === targetYear && ['paid', 'delivered'].includes(order.orderStatus)) {
      const month = date.getMonth();
      monthlyData[month].revenue += order.total;
      monthlyData[month].orders += 1;
      monthlyData[month].itemsSold += (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
    }
  }

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = monthlyData.reduce((sum, m) => sum + m.orders, 0);

  res.json({ year: targetYear, monthly: monthlyData, totalRevenue, totalOrders });
});

// ==================== SYNC ROUTES ====================

app.post('/api/sync/products', async (req, res) => {
  const { products } = req.body;
  const existing = await readCollection('products');
  
  // Only allow sync if DB is empty or request has valid admin token
  if (existing.length > 0) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        jwt.verify(token, JWT_SECRET);
      } catch {
        return res.status(401).json({ error: 'Token invalido' });
      }
    } else {
      return res.status(403).json({ error: 'Servidor ya tiene productos, se requiere autenticacion' });
    }
  }
  
  for (const newProd of products) {
    const index = existing.findIndex(p => p.id === newProd.id);
    if (index !== -1) {
      existing[index] = { ...existing[index], ...newProd };
    } else {
      existing.push(newProd);
    }
  }
  
  await writeCollection('products', existing);
  res.json({ message: `${products.length} productos sincronizados` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PRICOM Server running on http://localhost:${PORT}`);
  console.log(`📦 Database path: ${path.join(__dirname, 'data')}`);
});
