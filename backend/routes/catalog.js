const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/exercises', (req, res) => {
  const exercises = db.prepare(
    'SELECT * FROM exercise_catalog ORDER BY muscle_group, name'
  ).all();
  res.json(exercises);
});

router.post('/exercises', (req, res) => {
  const { name, muscle_group } = req.body;
  if (!name) return res.status(400).json({ error: 'name es requerido' });

  try {
    const result = db.prepare(
      'INSERT INTO exercise_catalog (name, muscle_group) VALUES (?, ?)'
    ).run(name, muscle_group || null);
    const exercise = db.prepare('SELECT * FROM exercise_catalog WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(exercise);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'El ejercicio ya existe' });
    }
    throw err;
  }
});

router.delete('/exercises/:id', (req, res) => {
  const result = db.prepare('DELETE FROM exercise_catalog WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Ejercicio no encontrado' });
  res.status(204).end();
});

module.exports = router;
