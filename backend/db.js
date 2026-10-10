const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'smartstay.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant','owner')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT,
  rent INTEGER NOT NULL,
  deposit INTEGER NOT NULL DEFAULT 0,
  sharing TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'Any',
  amenities TEXT NOT NULL DEFAULT '[]',
  description TEXT,
  image_url TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  move_in TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_listing ON enquiries(listing_id);
`);

// Safe column additions for listings if they do not exist
const columns = db.pragma('table_info(listings)').map((c) => c.name);
if (!columns.includes('rating')) {
  db.exec('ALTER TABLE listings ADD COLUMN rating REAL DEFAULT 4.8');
}
if (!columns.includes('reviews_count')) {
  db.exec('ALTER TABLE listings ADD COLUMN reviews_count INTEGER DEFAULT 12');
}
if (!columns.includes('gallery')) {
  db.exec("ALTER TABLE listings ADD COLUMN gallery TEXT DEFAULT '[]'");
}
if (!columns.includes('rules')) {
  db.exec("ALTER TABLE listings ADD COLUMN rules TEXT DEFAULT '[]'");
}
if (!columns.includes('featured')) {
  db.exec('ALTER TABLE listings ADD COLUMN featured INTEGER DEFAULT 0');
}

module.exports = db;

