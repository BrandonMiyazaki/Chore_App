const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const householdRoutes = require('./routes/household');
const userRoutes = require('./routes/users');
const lessonRoutes = require('./routes/lessons');
const completedLessonRoutes = require('./routes/completedLessons');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// ─── Security & Parsing ─────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ─── Health Check ────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/household', householdRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/completed-lessons', completedLessonRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ─── Serve React Frontend (production) ───────
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// SPA fallback — any non-API route serves index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ─── Global Error Handler ────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
