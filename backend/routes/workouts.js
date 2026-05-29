const express = require('express');
const router = express.Router();
const db = require('../database/db');

function getWorkoutDetail(id) {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(id);
  if (!workout) return null;
  const exercises = db.prepare(
    'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY order_index, id'
  ).all(id);
  const setStmt = db.prepare('SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number');
  workout.exercises = exercises.map(ex => ({ ...ex, sets: setStmt.all(ex.id) }));
  return workout;
}

router.get('/', (req, res) => {
  const { limit = 20, offset = 0, from, to } = req.query;
  const conditions = [];
  const params = [];
  if (from) { conditions.push('date >= ?'); params.push(from); }
  if (to)   { conditions.push('date <= ?'); params.push(to); }
  let query = 'SELECT * FROM workouts';
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const workouts = db.prepare(query).all(...params);
  const countStmt = db.prepare(`
    SELECT we.workout_id,
      COUNT(DISTINCT we.id) as exercise_count,
      COUNT(s.id) as set_count
    FROM workout_exercises we
    LEFT JOIN sets s ON s.workout_exercise_id = we.id
    WHERE we.workout_id = ?
    GROUP BY we.workout_id
  `);
  res.json(workouts.map(w => {
    const counts = countStmt.get(w.id) || { exercise_count: 0, set_count: 0 };
    return { ...w, exercise_count: counts.exercise_count, set_count: counts.set_count };
  }));
});

router.post('/', (req, res) => {
  const { date, name, duration_min, energy_level, sleep_quality, notes, exercises = [] } = req.body;
  if (!date) return res.status(400).json({ error: 'date es requerido' });

  const create = db.transaction(() => {
    const wResult = db.prepare(`
      INSERT INTO workouts (date, name, duration_min, energy_level, sleep_quality, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(date, name || null, duration_min || null, energy_level || null, sleep_quality || null, notes || null);
    const wId = wResult.lastInsertRowid;

    const exStmt = db.prepare(`
      INSERT INTO workout_exercises (workout_id, exercise_catalog_id, exercise_name, order_index)
      VALUES (?, ?, ?, ?)
    `);
    const setStmt = db.prepare(`
      INSERT INTO sets (workout_exercise_id, set_number, reps, weight_kg, rpe)
      VALUES (?, ?, ?, ?, ?)
    `);

    exercises.forEach((ex, idx) => {
      const exResult = exStmt.run(wId, ex.exercise_catalog_id || null, ex.exercise_name, ex.order_index ?? idx);
      const exId = exResult.lastInsertRowid;
      (ex.sets || []).forEach(s => {
        setStmt.run(exId, s.set_number, s.reps || null, s.weight_kg || null, s.rpe || null);
      });
    });

    return getWorkoutDetail(wId);
  });

  res.status(201).json(create());
});

router.get('/:id', (req, res) => {
  const workout = getWorkoutDetail(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  res.json(workout);
});

router.put('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  const { date, name, duration_min, energy_level, sleep_quality, notes } = req.body;
  db.prepare(`
    UPDATE workouts SET
      date = ?, name = ?, duration_min = ?,
      energy_level = ?, sleep_quality = ?, notes = ?
    WHERE id = ?
  `).run(
    date ?? workout.date,
    name !== undefined ? name : workout.name,
    duration_min !== undefined ? duration_min : workout.duration_min,
    energy_level !== undefined ? energy_level : workout.energy_level,
    sleep_quality !== undefined ? sleep_quality : workout.sleep_quality,
    notes !== undefined ? notes : workout.notes,
    req.params.id
  );
  res.json(getWorkoutDetail(req.params.id));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  res.status(204).end();
});

router.post('/:id/exercises', (req, res) => {
  const workout = db.prepare('SELECT id FROM workouts WHERE id = ?').get(req.params.id);
  if (!workout) return res.status(404).json({ error: 'Entrenamiento no encontrado' });
  const { exercise_name, exercise_catalog_id, order_index, sets = [] } = req.body;
  if (!exercise_name) return res.status(400).json({ error: 'exercise_name es requerido' });

  const add = db.transaction(() => {
    const exResult = db.prepare(`
      INSERT INTO workout_exercises (workout_id, exercise_catalog_id, exercise_name, order_index)
      VALUES (?, ?, ?, ?)
    `).run(req.params.id, exercise_catalog_id || null, exercise_name, order_index || 0);
    const exId = exResult.lastInsertRowid;
    const setStmt = db.prepare('INSERT INTO sets (workout_exercise_id, set_number, reps, weight_kg, rpe) VALUES (?, ?, ?, ?, ?)');
    sets.forEach(s => setStmt.run(exId, s.set_number, s.reps || null, s.weight_kg || null, s.rpe || null));
    const ex = db.prepare('SELECT * FROM workout_exercises WHERE id = ?').get(exId);
    ex.sets = db.prepare('SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number').all(exId);
    return ex;
  });

  res.status(201).json(add());
});

router.delete('/:id/exercises/:exId', (req, res) => {
  const result = db.prepare('DELETE FROM workout_exercises WHERE id = ? AND workout_id = ?').run(req.params.exId, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Ejercicio no encontrado' });
  res.status(204).end();
});

router.post('/:id/exercises/:exId/sets', (req, res) => {
  const ex = db.prepare('SELECT id FROM workout_exercises WHERE id = ? AND workout_id = ?').get(req.params.exId, req.params.id);
  if (!ex) return res.status(404).json({ error: 'Ejercicio no encontrado' });
  const { set_number, reps, weight_kg, rpe } = req.body;
  const result = db.prepare('INSERT INTO sets (workout_exercise_id, set_number, reps, weight_kg, rpe) VALUES (?, ?, ?, ?, ?)').run(req.params.exId, set_number, reps || null, weight_kg || null, rpe || null);
  res.status(201).json(db.prepare('SELECT * FROM sets WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id/exercises/:exId/sets/:setId', (req, res) => {
  const set = db.prepare('SELECT * FROM sets WHERE id = ? AND workout_exercise_id = ?').get(req.params.setId, req.params.exId);
  if (!set) return res.status(404).json({ error: 'Serie no encontrada' });
  const { set_number, reps, weight_kg, rpe } = req.body;
  db.prepare(`
    UPDATE sets SET set_number = ?, reps = ?, weight_kg = ?, rpe = ? WHERE id = ?
  `).run(
    set_number ?? set.set_number,
    reps !== undefined ? reps : set.reps,
    weight_kg !== undefined ? weight_kg : set.weight_kg,
    rpe !== undefined ? rpe : set.rpe,
    req.params.setId
  );
  res.json(db.prepare('SELECT * FROM sets WHERE id = ?').get(req.params.setId));
});

router.delete('/:id/exercises/:exId/sets/:setId', (req, res) => {
  const result = db.prepare('DELETE FROM sets WHERE id = ? AND workout_exercise_id = ?').run(req.params.setId, req.params.exId);
  if (result.changes === 0) return res.status(404).json({ error: 'Serie no encontrada' });
  res.status(204).end();
});

module.exports = router;
