const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireParent } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication + tenant scoping
router.use(authenticate, tenantScope);

// ──────────────────────────────────────────────
// GET /api/household
// Get the current user's household info
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const household = await prisma.household.findUnique({
      where: { id: req.householdId },
      include: {
        _count: { select: { users: true, lessons: true } },
      },
    });

    if (!household) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json(household);
  } catch (err) {
    console.error('Get household error:', err);
    res.status(500).json({ error: 'Failed to fetch household' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/household
// Update household name (parent only)
// ──────────────────────────────────────────────
router.put('/', requireParent, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const household = await prisma.household.update({
      where: { id: req.householdId },
      data: { name },
    });

    res.json(household);
  } catch (err) {
    console.error('Update household error:', err);
    res.status(500).json({ error: 'Failed to update household' });
  }
});

module.exports = router;
