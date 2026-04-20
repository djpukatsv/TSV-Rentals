import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { db, Listings, Images, Enquiries, Saved, Analytics } from './db.js';
import { registerRoutes as authRoutes, requireAuth, optionalAuth } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
authRoutes(app);

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

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
    if (!title || !type || !price || !bedrooms || !bathrooms || !address || !suburb || !postcode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = randomUUID();
    Listings.insert.run(
      id, req.user.id, title, type, price, bedrooms, bathrooms,
      address, suburb, postcode, lat || null, lng || null,
      description || null, availableDate || null, leaseLength || null,
      petFriendly ? 1 : 0, airCon ? 1 : 0, pool ? 1 : 0,
      garage ? 1 : 0, furnished ? 1 : 0, billsIncluded ? 1 : 0,
      virtualTour || null
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

// ── Admin ─────────────────────────────────────────────────────────────────────
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

app.listen(PORT, () => console.log(`TSV Rentals server on http://localhost:${PORT}`));
