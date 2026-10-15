const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { sign, optionalAuth, requireAuth, requireOwner } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const TYPES = ['PG', 'Hostel', 'Apartment', 'House'];
const SHARING = ['Single', 'Double', 'Triple', 'Entire home'];
const GENDERS = ['Any', 'Men', 'Women'];
const STATUSES = ['new', 'contacted', 'closed'];

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role });
const cleanPhone = (p) => String(p || '').replace(/\D/g, '').slice(-10);
const validPhone = (p) => /^[6-9]\d{9}$/.test(p);

const safeJson = (val, fallback = []) => {
  if (!val) return fallback;
  try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return fallback; }
};

const shape = (row) => row && {
  ...row,
  amenities: safeJson(row.amenities, []),
  gallery: safeJson(row.gallery, []),
  rules: safeJson(row.rules, []),
  available: !!row.available,
  featured: !!row.featured,
  rating: row.rating != null ? Number(row.rating) : 4.8,
  reviews_count: row.reviews_count != null ? Number(row.reviews_count) : 12,
};

/* ---------- Auth ---------- */

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role } = req.body || {};
  const mobile = cleanPhone(phone);
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (String(password).length < 6) return res.status(400).json({ error: 'Password needs at least 6 characters.' });
  if (!validPhone(mobile)) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });

  const mail = String(email).toLowerCase().trim();
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(mail)) {
    return res.status(409).json({ error: 'An account with this email already exists. Log in instead.' });
  }
  const info = db
    .prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run(String(name).trim(), mail, mobile, bcrypt.hashSync(String(password), 10), role === 'owner' ? 'owner' : 'tenant');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email || '').toLowerCase().trim());
  if (!user || !bcrypt.compareSync(String(password || ''), user.password_hash)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  res.json({ token: sign(user), user: publicUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'Account not found. Log in again.' });
  res.json({ user: publicUser(user) });
});

/* ---------- Public Discovery ---------- */

app.get('/api/cities', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT city FROM listings WHERE available = 1 ORDER BY city').all();
  res.json(rows.map((r) => r.city));
});

app.get('/api/featured', (req, res) => {
  const rows = db.prepare('SELECT * FROM listings WHERE available = 1 AND featured = 1 ORDER BY rating DESC, rent ASC LIMIT 4').all();
  res.json(rows.map(shape));
});

app.get('/api/listings', (req, res) => {
  const { city, type, gender, sharing, minRent, maxRent, q, sort } = req.query;
  const where = ['l.available = 1'];
  const params = [];

  if (city) { where.push('LOWER(l.city) = LOWER(?)'); params.push(city); }
  if (TYPES.includes(type)) { where.push('l.type = ?'); params.push(type); }
  if (SHARING.includes(sharing)) { where.push('l.sharing = ?'); params.push(sharing); }
  if (gender === 'Men' || gender === 'Women') { where.push("l.gender IN (?, 'Any')"); params.push(gender); }
  if (minRent && Number(minRent) > 0) { where.push('l.rent >= ?'); params.push(Number(minRent)); }
  if (maxRent && Number(maxRent) > 0) { where.push('l.rent <= ?'); params.push(Number(maxRent)); }
  if (q) {
    where.push('(l.title LIKE ? OR l.area LIKE ? OR l.address LIKE ? OR l.city LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  const order = {
    rent_asc: 'l.rent ASC',
    rent_desc: 'l.rent DESC',
    rating_desc: 'l.rating DESC, l.reviews_count DESC',
    newest: 'l.created_at DESC, l.id DESC'
  }[sort] || 'l.created_at DESC, l.id DESC';

  const rows = db.prepare(`SELECT l.* FROM listings l WHERE ${where.join(' AND ')} ORDER BY ${order}`).all(...params);
  res.json(rows.map(shape));
});

app.get('/api/listings/:id', (req, res) => {
  const row = db
    .prepare(
      `SELECT l.*, u.name AS owner_name, u.phone AS owner_phone
       FROM listings l JOIN users u ON u.id = l.owner_id WHERE l.id = ?`
    )
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: 'This listing no longer exists.' });
  res.json(shape(row));
});

app.get('/api/listings/:id/similar', (req, res) => {
  const current = db.prepare('SELECT id, city, type, rent FROM listings WHERE id = ?').get(req.params.id);
  if (!current) return res.json([]);
  const rows = db.prepare(
    `SELECT * FROM listings 
     WHERE available = 1 AND id != ? AND (city = ? OR type = ?)
     ORDER BY CASE WHEN city = ? THEN 0 ELSE 1 END, ABS(rent - ?) ASC
     LIMIT 3`
  ).all(current.id, current.city, current.type, current.city, current.rent);
  res.json(rows.map(shape));
});

/* ---------- Enquiries ---------- */

app.post('/api/listings/:id/enquiries', optionalAuth, (req, res) => {
  const listing = db.prepare('SELECT id, available FROM listings WHERE id = ?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'This listing no longer exists.' });
  if (!listing.available) return res.status(400).json({ error: 'This place is not available right now.' });

  const { name, phone, message, moveIn } = req.body || {};
  const mobile = cleanPhone(phone);
  if (!String(name || '').trim()) return res.status(400).json({ error: 'Enter your name.' });
  if (!validPhone(mobile)) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });

  db.prepare('INSERT INTO enquiries (listing_id, user_id, name, phone, message, move_in) VALUES (?, ?, ?, ?, ?, ?)').run(
    listing.id,
    req.user ? req.user.id : null,
    String(name).trim(),
    mobile,
    String(message || '').trim().slice(0, 1000),
    String(moveIn || '').slice(0, 20)
  );
  res.status(201).json({ ok: true });
});

/* ---------- Tenant Hub ---------- */

app.get('/api/tenant/enquiries', requireAuth, (req, res) => {
  const rows = db.prepare(
    `SELECT e.*, l.title AS listing_title, l.type AS listing_type, l.city, l.area, l.rent, l.image_url,
            u.name AS owner_name, u.phone AS owner_phone
     FROM enquiries e
     JOIN listings l ON l.id = e.listing_id
     JOIN users u ON u.id = l.owner_id
     WHERE e.user_id = ?
     ORDER BY e.created_at DESC`
  ).all(req.user.id);
  res.json(rows);
});

app.get('/api/favorites', requireAuth, (req, res) => {
  const full = req.query.full === 'true';
  if (full) {
    const rows = db.prepare(
      `SELECT l.* FROM listings l
       JOIN favorites f ON f.listing_id = l.id
       WHERE f.user_id = ? ORDER BY f.created_at DESC`
    ).all(req.user.id);
    return res.json(rows.map(shape));
  }
  const rows = db.prepare('SELECT listing_id FROM favorites WHERE user_id = ?').all(req.user.id);
  res.json(rows.map((r) => r.listing_id));
});

app.post('/api/favorites/:id', requireAuth, (req, res) => {
  const listingId = Number(req.params.id);
  const exists = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND listing_id = ?').get(req.user.id, listingId);
  if (exists) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND listing_id = ?').run(req.user.id, listingId);
    return res.json({ favorited: false, listingId });
  } else {
    db.prepare('INSERT INTO favorites (user_id, listing_id) VALUES (?, ?)').run(req.user.id, listingId);
    return res.json({ favorited: true, listingId });
  }
});

/* ---------- Owner Management ---------- */

function parseListing(b) {
  const gallery = Array.isArray(b.gallery) ? b.gallery.filter((g) => typeof g === 'string' && g.trim()) : [];
  const rules = Array.isArray(b.rules) ? b.rules.filter((r) => typeof r === 'string' && r.trim()) : [];
  const l = {
    title: String(b.title || '').trim(),
    type: b.type,
    city: String(b.city || '').trim(),
    area: String(b.area || '').trim(),
    address: String(b.address || '').trim(),
    rent: Number(b.rent),
    deposit: Number(b.deposit || 0),
    sharing: b.sharing,
    gender: b.gender || 'Any',
    amenities: Array.isArray(b.amenities) ? b.amenities.map(String).slice(0, 20) : [],
    description: String(b.description || '').trim(),
    image_url: String(b.image_url || '').trim() || null,
    gallery,
    rules,
    featured: b.featured ? 1 : 0
  };
  const errors = [];
  if (l.title.length < 5) errors.push('Title needs at least 5 characters.');
  if (!TYPES.includes(l.type)) errors.push('Choose a property type.');
  if (!l.city) errors.push('Enter the city.');
  if (!l.area) errors.push('Enter the area or locality.');
  if (!Number.isFinite(l.rent) || l.rent <= 0) errors.push('Enter the monthly rent.');
  if (!Number.isFinite(l.deposit) || l.deposit < 0) errors.push('Deposit cannot be negative.');
  if (!SHARING.includes(l.sharing)) errors.push('Choose the sharing type.');
  if (!GENDERS.includes(l.gender)) errors.push('Choose who the place is for.');
  if (l.image_url && !/^https?:\/\//i.test(l.image_url)) errors.push('Photo link must start with http:// or https://');
  return { l, errors };
}

function ownedListing(req, res) {
  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!row) { res.status(404).json({ error: 'This listing no longer exists.' }); return null; }
  if (row.owner_id !== req.user.id) { res.status(403).json({ error: 'You can only change your own listings.' }); return null; }
  return row;
}

app.get('/api/owner/stats', requireOwner, (req, res) => {
  const listings = db.prepare('SELECT id, rent, available FROM listings WHERE owner_id = ?').all(req.user.id);
  const total = listings.length;
  const active = listings.filter((l) => l.available === 1).length;
  const potentialRent = listings.filter((l) => l.available === 1).reduce((sum, l) => sum + (l.rent || 0), 0);
  
  const enquiries = db.prepare(
    `SELECT e.id, e.status FROM enquiries e JOIN listings l ON l.id = e.listing_id WHERE l.owner_id = ?`
  ).all(req.user.id);
  const totalEnquiries = enquiries.length;
  const newEnquiries = enquiries.filter((e) => e.status === 'new').length;
  const contactedEnquiries = enquiries.filter((e) => e.status === 'contacted').length;
  const closedEnquiries = enquiries.filter((e) => e.status === 'closed').length;

  res.json({
    total,
    active,
    hidden: total - active,
    potentialRent,
    totalEnquiries,
    newEnquiries,
    contactedEnquiries,
    closedEnquiries,
    conversionRate: totalEnquiries > 0 ? Math.round((closedEnquiries / totalEnquiries) * 100) : 0
  });
});

app.get('/api/owner/listings', requireOwner, (req, res) => {
  const rows = db
    .prepare(
      `SELECT l.*, (SELECT COUNT(*) FROM enquiries e WHERE e.listing_id = l.id) AS enquiry_count
       FROM listings l WHERE l.owner_id = ? ORDER BY l.created_at DESC, l.id DESC`
    )
    .all(req.user.id);
  res.json(rows.map(shape));
});

app.post('/api/listings', requireOwner, (req, res) => {
  const { l, errors } = parseListing(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  const info = db
    .prepare(
      `INSERT INTO listings (owner_id, title, type, city, area, address, rent, deposit, sharing, gender, amenities, description, image_url, gallery, rules, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      l.title,
      l.type,
      l.city,
      l.area,
      l.address,
      l.rent,
      l.deposit,
      l.sharing,
      l.gender,
      JSON.stringify(l.amenities),
      l.description,
      l.image_url,
      JSON.stringify(l.gallery),
      JSON.stringify(l.rules),
      l.featured
    );
  res.status(201).json(shape(db.prepare('SELECT * FROM listings WHERE id = ?').get(info.lastInsertRowid)));
});

app.put('/api/listings/:id', requireOwner, (req, res) => {
  const row = ownedListing(req, res);
  if (!row) return;
  const { l, errors } = parseListing(req.body || {});
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  db.prepare(
    `UPDATE listings 
     SET title=?, type=?, city=?, area=?, address=?, rent=?, deposit=?, sharing=?, gender=?, amenities=?, description=?, image_url=?, gallery=?, rules=?, featured=?
     WHERE id=?`
  ).run(
    l.title,
    l.type,
    l.city,
    l.area,
    l.address,
    l.rent,
    l.deposit,
    l.sharing,
    l.gender,
    JSON.stringify(l.amenities),
    l.description,
    l.image_url,
    JSON.stringify(l.gallery),
    JSON.stringify(l.rules),
    l.featured,
    row.id
  );
  res.json(shape(db.prepare('SELECT * FROM listings WHERE id = ?').get(row.id)));
});

app.patch('/api/listings/:id/availability', requireOwner, (req, res) => {
  const row = ownedListing(req, res);
  if (!row) return;
  db.prepare('UPDATE listings SET available = ? WHERE id = ?').run(req.body && req.body.available ? 1 : 0, row.id);
  res.json(shape(db.prepare('SELECT * FROM listings WHERE id = ?').get(row.id)));
});

app.delete('/api/listings/:id', requireOwner, (req, res) => {
  const row = ownedListing(req, res);
  if (!row) return;
  db.prepare('DELETE FROM listings WHERE id = ?').run(row.id);
  res.json({ ok: true });
});

app.get('/api/owner/enquiries', requireOwner, (req, res) => {
  const rows = db
    .prepare(
      `SELECT e.*, l.title AS listing_title, l.city, l.area, l.rent
       FROM enquiries e JOIN listings l ON l.id = e.listing_id
       WHERE l.owner_id = ? ORDER BY e.created_at DESC, e.id DESC`
    )
    .all(req.user.id);
  res.json(rows);
});

app.patch('/api/enquiries/:id', requireOwner, (req, res) => {
  const status = req.body && req.body.status;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Status must be new, contacted or closed.' });
  const row = db
    .prepare('SELECT e.id FROM enquiries e JOIN listings l ON l.id = e.listing_id WHERE e.id = ? AND l.owner_id = ?')
    .get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Enquiry not found.' });
  db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(status, row.id);
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Smart Stay Homes API running on http://localhost:${PORT}`));

