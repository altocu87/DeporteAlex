const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const lastWorkout = db.prepare(`
    SELECT w.*, COUNT(DISTINCT we.id) as exercise_count, COUNT(s.id) as set_count
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN sets s ON s.workout_exercise_id = we.id
    GROUP BY w.id
    ORDER BY w.date DESC, w.created_at DESC
    LIMIT 1
  `).get();

  const lastCardio = db.prepare(
    'SELECT * FROM cardio_sessions ORDER BY date DESC, created_at DESC LIMIT 1'
  ).get();

  const latestMeasurement = db.prepare(
    'SELECT * FROM body_measurements ORDER BY date DESC, created_at DESC LIMIT 1'
  ).get();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const weekWorkouts = db.prepare('SELECT COUNT(*) as count FROM workouts WHERE date >= ?').get(weekStartStr);
  const weekCardio = db.prepare('SELECT COUNT(*) as count FROM cardio_sessions WHERE date >= ?').get(weekStartStr);

  res.json({
    lastWorkout: lastWorkout || null,
    lastCardio: lastCardio || null,
    latestMeasurement: latestMeasurement || null,
    weekStats: {
      workouts: weekWorkouts.count,
      cardio: weekCardio.count,
      total: weekWorkouts.count + weekCardio.count
    }
  });
});

module.exports = router;
