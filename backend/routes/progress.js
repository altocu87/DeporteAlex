const express = require('express');
const router = express.Router();
const db = require('../database/db');

function buildWhere(conditions) {
  return conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
}

router.get('/weight', (req, res) => {
  const { from, to } = req.query;
  const conditions = ['weight_kg IS NOT NULL'];
  const params = [];
  if (from) { conditions.push('date >= ?'); params.push(from); }
  if (to)   { conditions.push('date <= ?'); params.push(to); }
  res.json(db.prepare(
    `SELECT date, weight_kg FROM body_measurements${buildWhere(conditions)} ORDER BY date`
  ).all(...params));
});

router.get('/measurements', (req, res) => {
  const { from, to } = req.query;
  const conditions = [];
  const params = [];
  if (from) { conditions.push('date >= ?'); params.push(from); }
  if (to)   { conditions.push('date <= ?'); params.push(to); }
  res.json(db.prepare(
    `SELECT date, weight_kg, waist_cm, chest_cm, arms_cm, legs_cm, hip_cm FROM body_measurements${buildWhere(conditions)} ORDER BY date`
  ).all(...params));
});

router.get('/exercise/:name', (req, res) => {
  const { from, to } = req.query;
  const conditions = ['LOWER(we.exercise_name) = LOWER(?)'];
  const params = [req.params.name];
  if (from) { conditions.push('w.date >= ?'); params.push(from); }
  if (to)   { conditions.push('w.date <= ?'); params.push(to); }
  res.json(db.prepare(`
    SELECT w.date,
      MAX(s.weight_kg) as max_weight,
      SUM(COALESCE(s.reps, 0) * COALESCE(s.weight_kg, 0)) as volume,
      COUNT(s.id) as total_sets,
      MAX(s.reps) as max_reps
    FROM workouts w
    JOIN workout_exercises we ON we.workout_id = w.id
    JOIN sets s ON s.workout_exercise_id = we.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY w.date, w.id
    ORDER BY w.date
  `).all(...params));
});

router.get('/cardio', (req, res) => {
  const { from, to, type } = req.query;
  const conditions = [];
  const params = [];
  if (from) { conditions.push('date >= ?'); params.push(from); }
  if (to)   { conditions.push('date <= ?'); params.push(to); }
  if (type) { conditions.push('type = ?'); params.push(type); }
  res.json(db.prepare(
    `SELECT date, type, duration_min, distance_km, calories, avg_heart_rate FROM cardio_sessions${buildWhere(conditions)} ORDER BY date`
  ).all(...params));
});

router.get('/summary', (req, res) => {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  res.json({
    week: {
      workouts: db.prepare('SELECT COUNT(*) as count FROM workouts WHERE date >= ?').get(weekAgo).count,
      cardio: db.prepare('SELECT COUNT(*) as count FROM cardio_sessions WHERE date >= ?').get(weekAgo).count
    },
    month: {
      workouts: db.prepare('SELECT COUNT(*) as count FROM workouts WHERE date >= ?').get(monthAgo).count,
      cardio: db.prepare('SELECT COUNT(*) as count FROM cardio_sessions WHERE date >= ?').get(monthAgo).count
    }
  });
});

module.exports = router;
