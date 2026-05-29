const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const { limit = 20, offset = 0, from, to } = req.query;
  const conditions = [];
  const params = [];
  if (from) { conditions.push('date >= ?'); params.push(from); }
  if (to)   { conditions.push('date <= ?'); params.push(to); }
  let query = 'SELECT * FROM cardio_sessions';
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  res.json(db.prepare(query).all(...params));
});

router.post('/', (req, res) => {
  const { date, type, duration_min, distance_km, avg_heart_rate, max_heart_rate, calories, energy_level, sleep_quality, notes } = req.body;
  if (!date || !type || !duration_min) {
    return res.status(400).json({ error: 'date, type y duration_min son requeridos' });
  }
  const result = db.prepare(`
    INSERT INTO cardio_sessions (date, type, duration_min, distance_km, avg_heart_rate, max_heart_rate, calories, energy_level, sleep_quality, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(date, type, duration_min, distance_km || null, avg_heart_rate || null, max_heart_rate || null, calories || null, energy_level || null, sleep_quality || null, notes || null);
  res.status(201).json(db.prepare('SELECT * FROM cardio_sessions WHERE id = ?').get(result.lastInsertRowid));
});

router.get('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM cardio_sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });
  res.json(session);
});

router.put('/:id', (req, res) => {
  const session = db.prepare('SELECT * FROM cardio_sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });
  const { date, type, duration_min, distance_km, avg_heart_rate, max_heart_rate, calories, energy_level, sleep_quality, notes } = req.body;
  db.prepare(`
    UPDATE cardio_sessions SET
      date = ?, type = ?, duration_min = ?, distance_km = ?,
      avg_heart_rate = ?, max_heart_rate = ?, calories = ?,
      energy_level = ?, sleep_quality = ?, notes = ?
    WHERE id = ?
  `).run(
    date ?? session.date,
    type ?? session.type,
    duration_min ?? session.duration_min,
    distance_km !== undefined ? distance_km : session.distance_km,
    avg_heart_rate !== undefined ? avg_heart_rate : session.avg_heart_rate,
    max_heart_rate !== undefined ? max_heart_rate : session.max_heart_rate,
    calories !== undefined ? calories : session.calories,
    energy_level !== undefined ? energy_level : session.energy_level,
    sleep_quality !== undefined ? sleep_quality : session.sleep_quality,
    notes !== undefined ? notes : session.notes,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM cardio_sessions WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM cardio_sessions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Sesión no encontrada' });
  res.status(204).end();
});

module.exports = router;
