const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'car-booking';

// Token helpers
exports.sign = (payload, options = {}) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER, ...options });

exports.verify = (token) => jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });

// Express middleware
exports.authenticate = (required = true) => (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    if (!required) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

exports.authorize = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
};
