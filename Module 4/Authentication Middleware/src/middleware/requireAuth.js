const jwt = require('jsonwebtoken');

/**
 * requireAuth middleware
 * 
 * Enforces authentication on protected routes:
 * 1. Reads Authorization header safely with nullish coalescing.
 * 2. Enforces Bearer scheme strictly via regex.
 * 3. Returns 401 generic error immediately if token is missing or malformed.
 * 4. Verifies token cryptographically with server-owned algorithm policy ('HS256').
 * 5. Attaches verified payload to req.user only after successful verification.
 * 6. Returns identical 401 generic response on any verification failure.
 */
module.exports = function requireAuth(req, res, next) {
  // ── Extract ──────────────────────────────────────────────
  const authHeader = req.headers.authorization ?? '';
  const match = /^Bearer ([^\s]+)$/i.exec(authHeader);
  const token = match ? match[1] : null;

  if (!token) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' }
    });
  }

  // ── Verify ───────────────────────────────────────────────
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = payload;
    next();
  } catch (_error) {
    return res.status(401).json({
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' }
    });
  }
};
