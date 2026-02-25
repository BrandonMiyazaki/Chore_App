const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireParent } = require('../middleware/auth');
const { tenantScope } = require('../middleware/tenantScope');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, tenantScope);

// ──────────────────────────────────────────────
// GET /api/lessons
// List all active lessons in the household
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { topic } = req.query;

    const where = {
      householdId: req.householdId,
      isActive: true,
    };
    if (topic) where.topic = topic;

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(lessons);
  } catch (err) {
    console.error('List lessons error:', err);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// ──────────────────────────────────────────────
// POST /api/lessons
// Create a new lesson (parent only)
// ──────────────────────────────────────────────
router.post('/', requireParent, async (req, res) => {
  try {
    const { title, description, topic, points, icon } = req.body;

    if (!title || !topic || !points) {
      return res.status(400).json({ error: 'title, topic, and points are required' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        householdId: req.householdId,
        title,
        description: description || null,
        topic,
        points: parseInt(points),
        icon: icon || null,
      },
    });

    res.status(201).json(lesson);
  } catch (err) {
    console.error('Create lesson error:', err);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// ──────────────────────────────────────────────
// PUT /api/lessons/:id
// Update a lesson (parent only)
// ──────────────────────────────────────────────
router.put('/:id', requireParent, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);

    // Verify lesson belongs to household
    const existing = await prisma.lesson.findFirst({
      where: { id: lessonId, householdId: req.householdId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const { title, description, topic, points, icon, isActive } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (topic !== undefined) data.topic = topic;
    if (points !== undefined) data.points = parseInt(points);
    if (icon !== undefined) data.icon = icon;
    if (isActive !== undefined) data.isActive = isActive;

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    res.json(lesson);
  } catch (err) {
    console.error('Update lesson error:', err);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/lessons/:id
// Soft-delete a lesson (set isActive = false, parent only)
// ──────────────────────────────────────────────
router.delete('/:id', requireParent, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);

    const existing = await prisma.lesson.findFirst({
      where: { id: lessonId, householdId: req.householdId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { isActive: false },
    });

    res.json({ message: 'Lesson deactivated' });
  } catch (err) {
    console.error('Delete lesson error:', err);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// ──────────────────────────────────────────────
// POST /api/lessons/:id/complete
// Kid marks a lesson as completed (creates a pending CompletedLesson)
// ──────────────────────────────────────────────
router.post('/:id/complete', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);

    // Verify lesson is active and belongs to household
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, householdId: req.householdId, isActive: true },
    });
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found or inactive' });
    }

    // Create the completed lesson record
    const completed = await prisma.completedLesson.create({
      data: {
        lessonId: lesson.id,
        userId: req.user.id,
        householdId: req.householdId,
        status: 'pending',
        pointsAwarded: lesson.points,
      },
    });

    // Optimistically add points to the user's total
    await prisma.user.update({
      where: { id: req.user.id },
      data: { totalPoints: { increment: lesson.points } },
    });

    res.status(201).json(completed);
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

module.exports = router;
