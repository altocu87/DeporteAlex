const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/latest', (req, res) => {
  const m = db.prepare('SELECT * FROM body_measurements ORDER BY date DESC, created_at DESC LIMIT 1').get();
  res.json(m || null);
});

router.get('/', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const measurements = db.prepare(
    'SELECT * FROM body_measurements ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?'
  ).all(Number(limit), Number(offset));
  res.json(measurements);
});

router.post('/', (req, res) => {
  const { date, weight_kg, waist_cm, chest_cm, arms_cm, legs_cm, hip_cm, body_fat_pct, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'date es requerido' });
  const result = db.prepare(`
    INSERT INTO body_measurements (date, weight_kg, waist_cm, chest_cm, arms_cm, legs_cm, hip_cm, body_fat_pct, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(date, weight_kg || null, waist_cm || null, chest_cm || null, arms_cm || null, legs_cm || null, hip_cm || null, body_fat_pct || null, notes || null);
  res.status(201).json(db.prepare('SELECT * FROM body_measurements WHERE id = ?').get(result.lastInsertRowid));
});

router.get('/:id', (req, res) => {
  const m = db.prepare('SELECT * FROM body_measurements WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Medida no encontrada' });
  res.json(m);
});

router.put('/:id', (req, res) => {
  const m = db.prepare('SELECT * FROM body_measurements WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Medida no encontrada' });
  const { date, weight_kg, waist_cm, chest_cm, arms_cm, legs_cm, hip_cm, body_fat_pct, notes } = req.body;
  db.prepare(`
    UPDATE body_measurements SET
      date = ?, weight_kg = ?, waist_cm = ?, chest_cm = ?,
      arms_cm = ?, legs_cm = ?, hip_cm = ?, body_fat_pct = ?, notes = ?
    WHERE id = ?
  `).run(
    date ?? m.date,
    weight_kg !== undefined ? weight_kg : m.weight_kg,
    waist_cm !== undefined ? waist_cm : m.waist_cm,
    chest_cm !== undefined ? chest_cm : m.chest_cm,
    arms_cm !== undefined ? arms_cm : m.arms_cm,
    legs_cm !== undefined ? legs_cm : m.legs_cm,
    hip_cm !== undefined ? hip_cm : m.hip_cm,
    body_fat_pct !== undefined ? body_fat_pct : m.body_fat_pct,
    notes !== undefined ? notes : m.notes,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM body_measurements WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM body_measurements WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Medida no encontrada' });
  res.status(204).end();
});

module.exports = router;
