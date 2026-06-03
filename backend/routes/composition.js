const express = require('express');
const router = express.Router();
const db = require('../database/db');

const FIELDS = [
  'date', 'weight_kg', 'bmi', 'fat_free_weight',
  'body_fat_pct', 'subcutaneous_fat', 'visceral_fat',
  'seg_fat_left_arm', 'seg_fat_right_arm', 'seg_fat_left_leg', 'seg_fat_right_leg', 'seg_fat_trunk',
  'muscle_mass', 'skeletal_muscle_pct', 'bone_mass',
  'seg_muscle_left_arm', 'seg_muscle_right_arm', 'seg_muscle_left_leg', 'seg_muscle_right_leg', 'seg_muscle_trunk',
  'body_water_pct', 'bmr', 'protein_pct',
  'body_age', 'notes',
];

function toNull(v) {
  return v !== undefined && v !== '' && v !== null ? v : null;
}

router.get('/latest', (req, res) => {
  res.json(db.prepare('SELECT * FROM body_composition ORDER BY date DESC, created_at DESC LIMIT 1').get() || null);
});

router.get('/', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  res.json(db.prepare(
    'SELECT * FROM body_composition ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?'
  ).all(Number(limit), Number(offset)));
});

router.post('/', (req, res) => {
  const b = req.body;
  if (!b.date) return res.status(400).json({ error: 'date es requerido' });
  const placeholders = FIELDS.map(() => '?').join(', ');
  const values = FIELDS.map(f => toNull(b[f]));
  const result = db.prepare(
    `INSERT INTO body_composition (${FIELDS.join(', ')}) VALUES (${placeholders})`
  ).run(...values);
  res.status(201).json(db.prepare('SELECT * FROM body_composition WHERE id = ?').get(result.lastInsertRowid));
});

router.get('/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM body_composition WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Registro no encontrado' });
  res.json(r);
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM body_composition WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Registro no encontrado' });
  const b = req.body;
  const updates = FIELDS.map(f => `${f} = ?`).join(', ');
  const values = FIELDS.map(f => b[f] !== undefined ? toNull(b[f]) : existing[f]);
  db.prepare(`UPDATE body_composition SET ${updates} WHERE id = ?`).run(...values, req.params.id);
  res.json(db.prepare('SELECT * FROM body_composition WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM body_composition WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Registro no encontrado' });
  res.status(204).end();
});

module.exports = router;
