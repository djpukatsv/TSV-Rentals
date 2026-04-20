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
      address, suburb, postcode, lat
