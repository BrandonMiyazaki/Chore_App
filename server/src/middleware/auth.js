const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * Express middleware — verifies the Bearer token and attaches req.user.
 * req.user = { id, householdId, role }
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.id,
      householdId: payload.householdId,
      role: payload.role,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
}

/**
 * Requires the authenticated user to have the 'parent' role.
 */
function requireParent(req, res, next) {
  if (req.user?.role !== 'parent') {
    return res.status(403).json({ error: 'Parent access required' });
  }
  next();
}

/**
 * Sign a JWT for a user.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, householdId: user.householdId, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { authenticate, requireParent, signToken };
