const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireParent } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, tenantScope);

// ──────────────────────────────────────────────
// GET /api/completed-lessons
// List completed lessons in the household (filterable by status, userId)
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query;

    const where = { householdId: req.householdId };
    if (status) where.status = status;
    if (userId) where.userId = parseInt(userId);

    // Kids can only see their own completions
    if (req.user.role === 'kid') {
      where.userId = req.user.id;
    }

    const completed = await prisma.completedLesson.findMany({
      where,
      include: {
        lesson: {
          select: { title: true, topic: true, icon: true, points: true },
        },
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json(completed);
  } catch (err) {
    console.error('List completed lessons error:', err);
    res.status(500).json({ error: 'Failed to fetch completed lessons' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/completed-lessons/:id/approve
// Parent approves a pending completion
// ──────────────────────────────────────────────
router.put('/:id/approve', requireParent, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const record = await prisma.completedLesson.findFirst({
      where: { id, householdId: req.householdId, status: 'pending' },
    });

    if (!record) {
      return res.status(404).json({ error: 'Pending completion not found' });
    }

    const updated = await prisma.completedLesson.update({
      where: { id },
      data: {
        status: 'approved',
        approvedByUserId: req.user.id,
      },
      include: {
        lesson: { select: { title: true, topic: true, icon: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Failed to approve completion' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/completed-lessons/:id/reject
// Parent rejects a pending completion (removes awarded points)
// ──────────────────────────────────────────────
router.put('/:id/reject', requireParent, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const record = await prisma.completedLesson.findFirst({
      where: { id, householdId: req.householdId, status: 'pending' },
    });

    if (!record) {
      return res.status(404).json({ error: 'Pending completion not found' });
    }

    // Remove the optimistically awarded points
    await prisma.user.update({
      where: { id: record.userId },
      data: {
        totalPoints: { decrement: record.pointsAwarded },
      },
    });

    const updated = await prisma.completedLesson.update({
      where: { id },
      data: {
        status: 'rejected',
        approvedByUserId: req.user.id,
      },
      include: {
        lesson: { select: { title: true, topic: true, icon: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Failed to reject completion' });
  }
});

module.exports = router;
