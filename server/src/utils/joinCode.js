const crypto = require('crypto');

/**
 * Generate a unique 6-character alphanumeric join code (uppercase).
 * Characters that look ambiguous (0/O, 1/I/L) are excluded.
 */
function generateJoinCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

module.exports = { generateJoinCode };
