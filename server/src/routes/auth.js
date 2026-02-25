const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { signToken } = require('../middleware/auth');
const { generateJoinCode } = require('../utils/joinCode');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const prisma = new PrismaClient();

// Rate-limit auth endpoints — 20 requests per minute per IP
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please try again later.' },
});
router.use(authLimiter);

// ──────────────────────────────────────────────
// POST /api/auth/register
// Create a new household + parent user
// ──────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { householdName, name, pin } = req.body;

    if (!householdName || !name || !pin) {
      return res.status(400).json({ error: 'householdName, name, and pin are required' });
    }

    if (pin.length < 4) {
      return res.status(400).json({ error: 'PIN must be at least 4 characters' });
    }

    // Generate a unique join code
    let joinCode;
    let attempts = 0;
    do {
      joinCode = generateJoinCode();
      const existing = await prisma.household.findUnique({ where: { joinCode } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return res.status(500).json({ error: 'Could not generate unique join code' });
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    // Create household + parent in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const household = await tx.household.create({
        data: {
          name: householdName,
          joinCode,
        },
      });

      const user = await tx.user.create({
        data: {
          householdId: household.id,
          name,
          pin: hashedPin,
          role: 'parent',
        },
      });

      return { household, user };
    });

    const token = signToken(result.user);

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        role: result.user.role,
        avatarUrl: result.user.avatarUrl,
        totalPoints: result.user.totalPoints,
        householdId: result.user.householdId,
      },
      household: {
        id: result.household.id,
        name: result.household.name,
        joinCode: result.household.joinCode,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/join
// Kid (or another parent) joins an existing household
// ──────────────────────────────────────────────
router.post('/join', async (req, res) => {
  try {
    const { joinCode, name, pin, avatarUrl, role } = req.body;

    if (!joinCode || !name || !pin) {
      return res.status(400).json({ error: 'joinCode, name, and pin are required' });
    }

    const household = await prisma.household.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
    });

    if (!household) {
      return res.status(404).json({ error: 'Invalid join code' });
    }

    // Check for duplicate name in the same household
    const existingUser = await prisma.user.findFirst({
      where: { householdId: household.id, name },
    });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with that name already exists in this household' });
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    const user = await prisma.user.create({
      data: {
        householdId: household.id,
        name,
        pin: hashedPin,
        avatarUrl: avatarUrl || null,
        role: role === 'parent' ? 'parent' : 'kid',
      },
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        totalPoints: user.totalPoints,
        householdId: user.householdId,
      },
      household: {
        id: household.id,
        name: household.name,
        joinCode: household.joinCode,
      },
    });
  } catch (err) {
    console.error('Join error:', err);
    res.status(500).json({ error: 'Failed to join household' });
  }
});

// ──────────────────────────────────────────────
// POST /api/auth/login
// Login with name + PIN (scoped to household via name uniqueness)
// ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ error: 'name and pin are required' });
    }

    // Find user by name (there may be duplicates across households,
    // so we check all matches and verify PIN)
    const users = await prisma.user.findMany({
      where: { name },
      include: { household: true },
    });

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid name or PIN' });
    }

    // Try matching PIN against each user with this name
    for (const user of users) {
      const valid = await bcrypt.compare(pin, user.pin);
      if (valid) {
        const token = signToken(user);
        return res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            totalPoints: user.totalPoints,
            householdId: user.householdId,
          },
          household: {
            id: user.household.id,
            name: user.household.name,
            joinCode: user.household.joinCode,
          },
        });
      }
    }

    return res.status(401).json({ error: 'Invalid name or PIN' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
