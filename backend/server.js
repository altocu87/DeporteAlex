const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/cardio', require('./routes/cardio'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`DeporteAlex backend corriendo en http://localhost:${PORT}`);
  // Auto-seed on first run
  require('./database/seed');
});
