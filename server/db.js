import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'tsvrentals.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    name        TEXT,
    phone       TEXT,
    role        TEXT DEFAULT 'user',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listings (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    type            TEXT NOT NULL,
    price           INTEGER NOT NULL,
    bedrooms        INTEGER NOT NULL,
    bathrooms       INTEGER NOT NULL,
    address         TEXT NOT NULL,
    suburb          TEXT NOT NULL,
    postcode        TEXT NOT NULL,
    lat             REAL,
    lng             REAL,
    description     TEXT,
    available_date  TEXT,
    lease_length    TEXT,
    pet_friendly    INTEGER DEFAULT 0,
    air_con         INTEGER DEFAULT 0,
    pool            INTEGER DEFAULT 0,
    garage          INTEGER DEFAULT 0,
    furnished       INTEGER DEFAULT 0,
    bills_included  INTEGER DEFAULT 0,
    virtual_tour    TEXT,
    promoted        INTEGER DEFAULT 0,
    promoted_until  TEXT,
    active          INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS listing_images (
    id          TEXT PRIMARY KEY,
    listing_id  TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    position    INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id          TEXT PRIMARY KEY,
    listing_id  TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    message     TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saved_listings (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id  TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at  TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, listing_id)
  );

  CREATE TABLE IF NOT EXISTS analytics_events (
    id          TEXT PRIMARY KEY,
    event       TEXT NOT NULL,
    listing_id  TEXT,
    user_id     TEXT,
    meta        TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_listings_suburb ON listings(suburb);
  CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
  CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(active);
`);

export const Users = {
  create: db.prepare(`INSERT INTO users (id, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)`),
  findByEmail: db.prepare(`SELECT * FROM users WHERE email = ?`),
  findById: db.prepare(`SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?`),
};

export const Listings = {
  insert: db.prepare(`
    INSERT INTO listings (id, user_id, title, type, price, bedrooms, bathrooms, address, suburb, postcode, lat, lng, description, available_date, lease_length, pet_friendly, air_con, pool, garage, furnished, bills_included, virtual_tour)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  findAll: db.prepare(`
    SELECT l.*, u.name as landlord_name, u.phone as landlord_phone,
    (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY position LIMIT 1) as cover_image
    FROM listings l JOIN users u ON l.user_id = u.id
    WHERE l.active = 1
    ORDER BY l.promoted DESC, l.created_at DESC
  `),
  findById: db.prepare(`
    SELECT l.*, u.name as landlord_name, u.email as landlord_email, u.phone as landlord_phone
    FROM listings l JOIN users u ON l.user_id = u.id
    WHERE l.id = ?
  `),
  findByUserId: db.prepare(`SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC`),
  deactivate: db.prepare(`UPDATE listings SET active = 0 WHERE id = ? AND user_id = ?`),
  promote: db.prepare(`UPDATE listings SET promoted = 1, promoted_until = ? WHERE id = ?`),
};

export const Images = {
  insert: db.prepare(`INSERT INTO listing_images (id, listing_id, url, position) VALUES (?, ?, ?, ?)`),
  findByListingId: db.prepare(`SELECT * FROM listing_images WHERE listing_id = ? ORDER BY position`),
};

export const Enquiries = {
  insert: db.prepare(`INSERT INTO enquiries (id, listing_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?, ?)`),
  findByListingId: db.prepare(`SELECT * FROM enquiries WHERE listing_id = ? ORDER BY created_at DESC`),
};

export const Saved = {
  save: db.prepare(`INSERT OR IGNORE INTO saved_listings (id, user_id, listing_id) VALUES (?, ?, ?)`),
  unsave: db.prepare(`DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?`),
  findByUserId: db.prepare(`
    SELECT l.*, s.created_at as saved_at,
    (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY position LIMIT 1) as cover_image
    FROM saved_listings s JOIN listings l ON s.listing_id = l.id
    WHERE s.user_id = ? AND l.active = 1
  `),
};

export const Analytics = {
  track: db.prepare(`INSERT INTO analytics_events (id, event, listing_id, user_id, meta) VALUES (?, ?, ?, ?, ?)`),
  totalListings: () => db.prepare(`SELECT COUNT(*) as count FROM listings WHERE active = 1`).get(),
  totalUsers: () => db.prepare(`SELECT COUNT(*) as count FROM users`).get(),
  totalEnquiries: () => db.prepare(`SELECT COUNT(*) as count FROM enquiries`).get(),
  topListings: () => db.prepare(`
    SELECT l.title, l.suburb, COUNT(e.id) as enquiries
    FROM listings l LEFT JOIN enquiries e ON l.id = e.listing_id
    WHERE l.active = 1 GROUP BY l.id ORDER BY enquiries DESC LIMIT 5
  `).all(),
};

export { db };
export default db;
