const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, tenantScope);

// ──────────────────────────────────────────────
// GET /api/leaderboard
// Points ranking for all users in the household
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { householdId: req.householdId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        totalPoints: true,
      },
      orderBy: { totalPoints: 'desc' },
    });

    res.json(users);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
