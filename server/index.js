import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import multer from 'multer';
import { db, Listings, Images, Enquiries, Saved, Analytics } from './db.js';
import { registerRoutes as authRoutes, requireAuth, optionalAuth } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
authRoutes(app);

// ── Image upload setup ────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// ── Seed data ─────────────────────────────────────────────────────────────────
try {
  const existing = db.prepare(`SELECT COUNT(*) as count FROM users WHERE email = ?`).get('landlord@tsvrentals.com.au');
  if (existing.count === 0) {
    const landlordId = randomUUID();
    const bcrypt = (await import('bcryptjs')).default;
    const hashed = bcrypt.hashSync('tsvlandlord2026', 10);
    db.prepare(`INSERT INTO users (id, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`).run(landlordId, 'landlord@tsvrentals.com.au', hashed, 'TSV Property Management', '0747001234', 'user');
  }
} catch (e) { console.log('Seed skipped:', e.message); }
// ── Image upload ──────────────────────────────────────────────────────────────
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  const urls = req.files.map(f => '/uploads/' + f.filename);
  res.json({ urls });
});

app.post('/api/upload/single', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: '/uploads/' + req.file.filename });
});

// ── Admin image endpoints ─────────────────────────────────────────────────────
app.post('/api/admin/listing/:id/images', (req, res) => {
  if (req.query.key !== 'tsvadmin2026') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { urls } = req.body;
    urls.forEach((url, i) => Images.insert.run(randomUUID(), req.params.id, url, i));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin listing endpoints ───────────────────────────────────────────────────
app.post('/api/admin/listing', async (req, res) => {
  if (req.query.key !== 'tsvadmin2026') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const {
      title, type, price, bedrooms, bathrooms, address, suburb, postcode,
      lat, lng, description, availableDate, leaseLength,
      petFriendly, airCon, pool, garage, furnished, billsIncluded,
      contactName, contactPhone, agentLogo
    } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const bcrypt = await import('bcryptjs');
    const adminEmail = 'admin@tsvrentals.internal';
    let adminUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get(adminEmail);
    if (!adminUser) {
      const adminId = randomUUID();
      const hashedPassword = bcrypt.default.hashSync(randomUUID(), 10);
      db.prepare(`INSERT INTO users (id, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`).run(adminId, adminEmail, hashedPassword, contactName || 'TSV Rentals', contactPhone || '', 'user');
      adminUser = { id: adminId };
    } else {
      if (contactName) db.prepare(`UPDATE users SET name = ?, phone = ? WHERE email = ?`).run(contactName, contactPhone || '', adminEmail);
    }
    const id = randomUUID();
    Listings.insert.run(
      id, adminUser.id, title, type || 'house',
      parseInt(price) || 0, parseInt(bedrooms) || 0, parseInt(bathrooms) || 0,
      address || '', suburb || '', postcode || '',
      lat ? parseFloat(lat) : null, lng ? parseFloat(lng) : null,
      description || null, availableDate || null, leaseLength || null,
      petFriendly ? 1 : 0, airCon ? 1 : 0, pool ? 1 : 0,
      garage ? 1 : 0, furnished ? 1 : 0, billsIncluded ? 1 : 0,
      null, agentLogo || null
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/listing/:id', async (req, res) => {
  if (req.query.key !== 'tsvadmin2026') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const {
      title, type, price, bedrooms, bathrooms, address, suburb, postcode,
      lat, lng, description, availableDate, leaseLength,
      petFriendly, airCon, pool, garage, furnished, billsIncluded,
      contactName, contactPhone, agentLogo
    } = req.body;
    db.prepare(`
      UPDATE listings SET
        title=?, type=?, price=?, bedrooms=?, bathrooms=?,
        address=?, suburb=?, postcode=?, lat=?, lng=?,
        description=?, available_date=?, lease_length=?,
        pet_friendly=?, air_con=?, pool=?, garage=?,
        furnished=?, bills_included=?, agent_logo=?
      WHERE id=?
    `).run(
      title, type, parseInt(price) || 0, parseInt(bedrooms) || 0, parseInt(bathrooms) || 0,
      address, suburb, postcode,
      lat ? parseFloat(lat) : null, lng ? parseFloat(lng) : null,
      description || null, availableDate || null, leaseLength || null,
      petFriendly ? 1 : 0, airCon ? 1 : 0, pool ? 1 : 0,
      garage ? 1 : 0, furnished ? 1 : 0, billsIncluded ? 1 : 0,
      agentLogo || null, req.params.id
    );
    if (contactName) {
      db.prepare(`UPDATE users SET name = ?, phone = ? WHERE email = ?`).run(contactName, contactPhone || '', 'admin@tsvrentals.internal');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/listing/:id', (req, res) => {
  if (req.query.key !== 'tsvadmin2026') return res.status(401).json({ error: 'Unauthorized' });
  try {
    db.prepare(`UPDATE listings SET active = 0 WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Listings ──────────────────────────────────────────────────────────────────
app.get('/api/listings', optionalAuth, (req, res) => {
  try {
    let listings = Listings.findAll.all();
    const { suburb, type, minPrice, maxPrice, bedrooms, petFriendly, airCon, pool, garage } = req.query;
    if (suburb) listings = listings.filter(l => l.suburb.toLowerCase().includes(suburb.toLowerCase()));
    if (type) listings = listings.filter(l => l.type === type);
    if (minPrice) listings = listings.filter(l => l.price >= parseInt(minPrice));
    if (maxPrice) listings = listings.filter(l => l.price <= parseInt(maxPrice));
    if (bedrooms) listings = listings.filter(l => l.bedrooms >= parseInt(bedrooms));
    if (petFriendly === 'true') listings = listings.filter(l => l.pet_friendly === 1);
    if (airCon === 'true') listings = listings.filter(l => l.air_con === 1);
    if (pool === 'true') listings = listings.filter(l => l.pool === 1);
    if (garage === 'true') listings = listings.filter(l => l.garage === 1);
    try { Analytics.track.run(randomUUID(), 'listings_view', null, req.user?.id || null, null); } catch {}
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/listings/:id', (req, res) => {
  try {
    const listing = Listings.findById.get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    const images = Images.findByListingId.all(req.params.id);
    try { Analytics.track.run(randomUUID(), 'listing_view', req.params.id, null, null); } catch {}
    res.json({ listing, images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/listings', requireAuth, (req, res) => {
  try {
    const {
      title, type, price, bedrooms, bathrooms, address, suburb, postcode,
      lat, lng, description, availableDate, leaseLength,
      petFriendly, airCon, pool, garage, furnished, billsIncluded, virtualTour
    } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const id = randomUUID();
    Listings.insert.run(
      id, req.user.id, title, type, price, bedrooms, bathrooms,
      address, suburb, postcode, lat || null, lng || null,
      description || null, availableDate || null, leaseLength || null,
      petFriendly ? 1 : 0, airCon ? 1 : 0, pool ? 1 : 0,
      garage ? 1 : 0, furnished ? 1 : 0, billsIncluded ? 1 : 0,
      virtualTour || null, null
    );
    res.status(201).json({ id, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/listings/:id', requireAuth, (req, res) => {
  Listings.deactivate.run(req.params.id, req.user.id);
  res.json({ success: true });
});

app.get('/api/my-listings', requireAuth, (req, res) => {
  const listings = Listings.findByUserId.all(req.user.id);
  res.json({ listings });
});

// ── Enquiries ─────────────────────────────────────────────────────────────────
app.post('/api/enquiries', async (req, res) => {
  try {
    const { listingId, name, email, phone, message } = req.body;
    if (!listingId || !name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
    const listing = Listings.findById.get(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    const id = randomUUID();
    Enquiries.insert.run(id, listingId, name, email, phone || null, message);
    try {
      await resend.emails.send({
        from: 'TSV Rentals <noreply@tsvrentals.com.au>',
        to: listing.landlord_email,
        subject: `New enquiry for ${listing.title}`,
        html: `
          <h2>New Enquiry — ${listing.title}</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr/>
          <p>Log in to TSV Rentals to view and manage your enquiries.</p>
        `,
      });
    } catch {}
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Saved listings ────────────────────────────────────────────────────────────
app.post('/api/saved/:listingId', requireAuth, (req, res) => {
  Saved.save.run(randomUUID(), req.user.id, req.params.listingId);
  res.json({ success: true });
});

app.delete('/api/saved/:listingId', requireAuth, (req, res) => {
  Saved.unsave.run(req.user.id, req.params.listingId);
  res.json({ success: true });
});

app.get('/api/saved', requireAuth, (req, res) => {
  const listings = Saved.findByUserId.all(req.user.id);
  res.json({ listings });
});

// ── Admin stats ───────────────────────────────────────────────────────────────
app.get('/api/admin/stats', (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({
    totalListings: Analytics.totalListings(),
    totalUsers: Analytics.totalUsers(),
    totalEnquiries: Analytics.totalEnquiries(),
    topListings: Analytics.topListings(),
    generatedAt: new Date().toISOString(),
  });
});

// ── Static files ──────────────────────────────────────────────────────────────
const dist = path.join(__dirname, '../client/dist');
app.use(express.static(dist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  const index = path.join(dist, 'index.html');
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    res.send('<h1>TSV Rentals — server running!</h1>');
  }
});

app.listen(PORT, () => console.log('TSV Rentals server on http://localhost:' + PORT));
