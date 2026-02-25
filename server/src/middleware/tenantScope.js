/**
 * Tenant-scoping middleware.
 * Ensures all Prisma queries can use req.householdId
 * so data never leaks across households.
 */
function tenantScope(req, res, next) {
  if (!req.user?.householdId) {
    return res.status(401).json({ error: 'No household context' });
  }
  req.householdId = req.user.householdId;
  next();
}

module.exports = { tenantScope };
