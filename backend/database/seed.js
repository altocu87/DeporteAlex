const db = require('./db');

const exercises = [
  // Pecho
  { name: 'Press de banca', muscle_group: 'Pecho' },
  { name: 'Press de banca inclinado', muscle_group: 'Pecho' },
  { name: 'Press de banca declinado', muscle_group: 'Pecho' },
  { name: 'Press con mancuernas', muscle_group: 'Pecho' },
  { name: 'Aperturas con mancuernas', muscle_group: 'Pecho' },
  { name: 'Fondos en paralelas', muscle_group: 'Pecho' },
  { name: 'Cruces en polea', muscle_group: 'Pecho' },
  // Espalda
  { name: 'Dominadas', muscle_group: 'Espalda' },
  { name: 'Remo con barra', muscle_group: 'Espalda' },
  { name: 'Remo con mancuerna', muscle_group: 'Espalda' },
  { name: 'Jalón al pecho', muscle_group: 'Espalda' },
  { name: 'Remo en polea', muscle_group: 'Espalda' },
  { name: 'Peso muerto', muscle_group: 'Espalda' },
  { name: 'Hiperextensiones', muscle_group: 'Espalda' },
  // Hombros
  { name: 'Press militar', muscle_group: 'Hombros' },
  { name: 'Press con mancuernas (hombros)', muscle_group: 'Hombros' },
  { name: 'Elevaciones laterales', muscle_group: 'Hombros' },
  { name: 'Elevaciones frontales', muscle_group: 'Hombros' },
  { name: 'Remo al mentón', muscle_group: 'Hombros' },
  { name: 'Face pulls', muscle_group: 'Hombros' },
  // Bíceps
  { name: 'Curl con barra', muscle_group: 'Bíceps' },
  { name: 'Curl con mancuernas', muscle_group: 'Bíceps' },
  { name: 'Curl martillo', muscle_group: 'Bíceps' },
  { name: 'Curl predicador', muscle_group: 'Bíceps' },
  // Tríceps
  { name: 'Press francés', muscle_group: 'Tríceps' },
  { name: 'Extensiones en polea', muscle_group: 'Tríceps' },
  { name: 'Fondos en banco', muscle_group: 'Tríceps' },
  { name: 'Patadas de tríceps', muscle_group: 'Tríceps' },
  // Piernas
  { name: 'Sentadilla', muscle_group: 'Piernas' },
  { name: 'Prensa de piernas', muscle_group: 'Piernas' },
  { name: 'Extensiones de cuádriceps', muscle_group: 'Piernas' },
  { name: 'Curl femoral', muscle_group: 'Piernas' },
  { name: 'Peso muerto rumano', muscle_group: 'Piernas' },
  { name: 'Zancadas', muscle_group: 'Piernas' },
  { name: 'Hip thrust', muscle_group: 'Piernas' },
  { name: 'Elevaciones de pantorrilla', muscle_group: 'Piernas' },
  // Abdominales
  { name: 'Crunch', muscle_group: 'Abdominales' },
  { name: 'Plancha', muscle_group: 'Abdominales' },
  { name: 'Crunch con polea', muscle_group: 'Abdominales' },
  { name: 'Elevación de piernas', muscle_group: 'Abdominales' },
];

const stmt = db.prepare(
  'INSERT OR IGNORE INTO exercise_catalog (name, muscle_group) VALUES (?, ?)'
);

const insertAll = db.transaction(() => {
  for (const ex of exercises) {
    stmt.run(ex.name, ex.muscle_group);
  }
});

insertAll();
console.log(`Seed completado: ${exercises.length} ejercicios insertados (si no existían).`);
