import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'tsvrentals.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create a seed landlord user ───────────────────────────────────────────────
const landlordId = randomUUID();
const hashedPassword = bcrypt.hashSync('password123', 10);

try {
  db.prepare(`INSERT INTO users (id, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(landlordId, 'landlord@tsvrentals.com.au', hashedPassword, 'TSV Property Management', '0747001234', 'user');
  console.log('✓ Seed landlord created');
} catch {
  // User may already exist, fetch existing
  const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get('landlord@tsvrentals.com.au');
  if (existing) {
    console.log('✓ Using existing seed landlord');
  }
}

const landlord = db.prepare(`SELECT id FROM users WHERE email = ?`).get('landlord@tsvrentals.com.au');

// ── Seed listings ─────────────────────────────────────────────────────────────
const listings = [
  {
    title: 'Spacious Family Home in Kirwan',
    type: 'house',
    price: 480,
    bedrooms: 4,
    bathrooms: 2,
    address: '14 Bandicoot Drive',
    suburb: 'Kirwan',
    postcode: '4817',
    lat: -19.3167,
    lng: 146.7333,
    description: 'Large 4 bedroom family home on a quiet street in Kirwan. Fully fenced yard, double lock-up garage, and a covered outdoor entertaining area. Close to Willows Shopping Centre and good schools.',
    available_date: '2026-05-01',
    lease_length: '12 months',
    pet_friendly: 1,
    air_con: 1,
    pool: 0,
    garage: 1,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Modern Unit Near The Strand',
    type: 'unit',
    price: 395,
    bedrooms: 2,
    bathrooms: 1,
    address: '3/8 Gregory Street',
    suburb: 'North Ward',
    postcode: '4810',
    lat: -19.2566,
    lng: 146.8190,
    description: 'Stylish 2 bedroom unit just a short walk to The Strand. Air conditioned throughout, secure parking, and a private balcony with ocean glimpses. Perfect for professionals or a couple.',
    available_date: '2026-04-28',
    lease_length: '12 months',
    pet_friendly: 0,
    air_con: 1,
    pool: 0,
    garage: 0,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Pool Home — Idalia',
    type: 'house',
    price: 520,
    bedrooms: 3,
    bathrooms: 2,
    address: '22 Flame Tree Circuit',
    suburb: 'Idalia',
    postcode: '4811',
    lat: -19.3300,
    lng: 146.7950,
    description: 'Beautiful 3 bedroom home with inground pool and large alfresco area. Modern kitchen, ensuite to main bedroom, and double garage. Walking distance to Stockland Aitkenvale.',
    available_date: '2026-05-10',
    lease_length: '12 months',
    pet_friendly: 1,
    air_con: 1,
    pool: 1,
    garage: 1,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Affordable 2 Bed Unit — Mundingburra',
    type: 'unit',
    price: 320,
    bedrooms: 2,
    bathrooms: 1,
    address: '7/45 Ross River Road',
    suburb: 'Mundingburra',
    postcode: '4812',
    lat: -19.2950,
    lng: 146.7900,
    description: 'Well-maintained 2 bedroom unit in a quiet complex. Air conditioning in living area, single car space, and within walking distance to shops and public transport.',
    available_date: '2026-04-25',
    lease_length: '6 months',
    pet_friendly: 0,
    air_con: 1,
    pool: 0,
    garage: 0,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Furnished Studio — City Centre',
    type: 'studio',
    price: 265,
    bedrooms: 1,
    bathrooms: 1,
    address: '12/99 Flinders Street',
    suburb: 'Townsville City',
    postcode: '4810',
    lat: -19.2590,
    lng: 146.8169,
    description: 'Fully furnished studio apartment in the heart of Townsville CBD. All utilities included. Perfect for FIFO workers or short-term stays. Secure building with intercom.',
    available_date: '2026-04-22',
    lease_length: '3 months',
    pet_friendly: 0,
    air_con: 1,
    pool: 0,
    garage: 0,
    furnished: 1,
    bills_included: 1,
  },
  {
    title: 'Large Family Home with Granny Flat — Kelso',
    type: 'house',
    price: 550,
    bedrooms: 4,
    bathrooms: 2,
    address: '5 Bottlebrush Crescent',
    suburb: 'Kelso',
    postcode: '4815',
    lat: -19.3750,
    lng: 146.7600,
    description: '4 bedroom main house plus a self-contained granny flat on a large 800sqm block. Ideal for extended families or use the granny flat as extra income. Fully fenced, pet friendly.',
    available_date: '2026-05-15',
    lease_length: '12 months',
    pet_friendly: 1,
    air_con: 1,
    pool: 0,
    garage: 1,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Neat 3 Bed House — Thuringowa Central',
    type: 'house',
    price: 430,
    bedrooms: 3,
    bathrooms: 1,
    address: '18 Hummock Road',
    suburb: 'Thuringowa Central',
    postcode: '4817',
    lat: -19.3400,
    lng: 146.7100,
    description: 'Well-presented 3 bedroom home in a convenient location. Fresh paint throughout, new carpets, air conditioning, and a covered patio. Close to Stockland, schools, and public transport.',
    available_date: '2026-05-01',
    lease_length: '12 months',
    pet_friendly: 1,
    air_con: 1,
    pool: 0,
    garage: 0,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Highset Queenslander — Hyde Park',
    type: 'house',
    price: 460,
    bedrooms: 3,
    bathrooms: 1,
    address: '34 Victoria Street',
    suburb: 'Hyde Park',
    postcode: '4812',
    lat: -19.2800,
    lng: 146.8050,
    description: 'Charming highset Queenslander with character features, polished timber floors, and a large wraparound verandah. Separate laundry, garden shed, and street parking. Close to The Strand.',
    available_date: '2026-05-05',
    lease_length: '12 months',
    pet_friendly: 1,
    air_con: 1,
    pool: 0,
    garage: 0,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Brand New Townhouse — Bohle Plains',
    type: 'townhouse',
    price: 445,
    bedrooms: 3,
    bathrooms: 2,
    address: '2/15 Sugarcane Way',
    suburb: 'Bohle Plains',
    postcode: '4817',
    lat: -19.3050,
    lng: 146.6950,
    description: 'Brand new 3 bedroom townhouse, never been lived in. Modern finishes throughout, open plan living, ensuite to master, single lock-up garage, and small courtyard. 12 month lease preferred.',
    available_date: '2026-05-20',
    lease_length: '12 months',
    pet_friendly: 0,
    air_con: 1,
    pool: 0,
    garage: 1,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Beachside 2 Bed Unit — Belgian Gardens',
    type: 'unit',
    price: 420,
    bedrooms: 2,
    bathrooms: 1,
    address: '4/6 Paxton Street',
    suburb: 'Belgian Gardens',
    postcode: '4810',
    lat: -19.2466,
    lng: 146.8066,
    description: '2 bedroom unit just 2 blocks from the beach at Belgian Gardens. Renovated kitchen and bathroom, air conditioning, covered parking. One of Townsville\'s most sought-after suburbs.',
    available_date: '2026-05-01',
    lease_length: '12 months',
    pet_friendly: 0,
    air_con: 1,
    pool: 0,
    garage: 0,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Investor Special — Hermit Park',
    type: 'house',
    price: 380,
    bedrooms: 3,
    bathrooms: 1,
    address: '27 Seventh Avenue',
    suburb: 'Hermit Park',
    postcode: '4812',
    lat: -19.2900,
    lng: 146.8000,
    description: '3 bedroom lowset home on a large block. Functional layout, air conditioning, and a fully fenced yard. Close to Castletown Shoppingworld and public transport. Good bones — ready to move in.',
    available_date: '2026-04-30',
    lease_length: '12 months',
    pet_friendly: 1,
    air_con: 1,
    pool: 0,
    garage: 0,
    furnished: 0,
    bills_included: 0,
  },
  {
    title: 'Executive Home with Pool — Castle Hill',
    type: 'house',
    price: 750,
    bedrooms: 4,
    bathrooms: 3,
    address: '9 Hillcrest Drive',
    suburb: 'Castle Hill',
    postcode: '4810',
    lat: -19.2650,
    lng: 146.8100,
    description: 'Stunning executive home with panoramic views of Townsville and Magnetic Island. 4 bedrooms, 3 bathrooms, gourmet kitchen, home theatre, and a resort-style pool. Double garage. A truly special property.',
    available_date: '2026-05-10',
    lease_length: '12 months',
    pet_friendly: 0,
    air_con: 1,
    pool: 1,
    garage: 1,
    furnished: 1,
    bills_included: 0,
  },
];

// Placeholder image URLs (free Unsplash house images)
const houseImages = [
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
];

const unitImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
];

const insertListing = db.prepare(`
  INSERT INTO listings (id, user_id, title, type, price, bedrooms, bathrooms, address, suburb, postcode, lat, lng, description, available_date, lease_length, pet_friendly, air_con, pool, garage, furnished, bills_included, virtual_tour)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertImage = db.prepare(`
  INSERT INTO listing_images (id, listing_id, url, position) VALUES (?, ?, ?, ?)
`);

let count = 0;
for (const l of listings) {
  const listingId = randomUUID();
  insertListing.run(
    listingId, landlord.id, l.title, l.type, l.price, l.bedrooms, l.bathrooms,
    l.address, l.suburb, l.postcode, l.lat, l.lng,
    l.description, l.available_date, l.lease_length,
    l.pet_friendly, l.air_con, l.pool, l.garage, l.furnished, l.bills_included, null
  );

  // Add 2 images per listing
  const imgs = l.type === 'unit' || l.type === 'studio' ? unitImages : houseImages;
  insertImage.run(randomUUID(), listingId, imgs[count % imgs.length], 0);
  insertImage.run(randomUUID(), listingId, imgs[(count + 1) % imgs.length], 1);

  console.log(`✓ Added: ${l.title}`);
  count++;
}

console.log(`\n✅ Done! ${listings.length} listings seeded into the database.`);
console.log(`\nTest landlord login:`);
console.log(`  Email: landlord@tsvrentals.com.au`);
console.log(`  Password: password123`);
