const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try { req.user = jwt.verify(token, SECRET); } catch { /* treat as logged out */ }
  }
  next();
}

function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Log in to continue.' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Log in again.' });
  }
}

function requireOwner(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner accounts can do this.' });
    }
    next();
  });
}

module.exports = { sign, optionalAuth, requireAuth, requireOwner };
