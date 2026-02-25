const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, tenantScope);

// ──────────────────────────────────────────────
// GET /api/users
// List all users in the household
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
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ──────────────────────────────────────────────
// GET /api/users/:id
// Get a single user's profile + points
// ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(req.params.id),
        householdId: req.householdId,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/users/:id
// Update avatar or name (user can update themselves, parent can update anyone)
// ──────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);

    // Users can only update themselves, unless they are a parent
    if (req.user.role !== 'parent' && req.user.id !== targetId) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Ensure target belongs to the same household
    const existing = await prisma.user.findFirst({
      where: { id: targetId, householdId: req.householdId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, avatarUrl } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

    const user = await prisma.user.update({
      where: { id: targetId },
      data,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
