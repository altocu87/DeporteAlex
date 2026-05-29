import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Workouts from './pages/Workouts.jsx';
import WorkoutDetail from './pages/WorkoutDetail.jsx';
import WorkoutForm from './components/workout/WorkoutForm.jsx';
import Cardio from './pages/Cardio.jsx';
import Measurements from './pages/Measurements.jsx';
import Progress from './pages/Progress.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="entrenamientos" element={<Workouts />} />
          <Route path="entrenamientos/nuevo" element={<WorkoutForm />} />
          <Route path="entrenamientos/:id" element={<WorkoutDetail />} />
          <Route path="cardio" element={<Cardio />} />
          <Route path="medidas" element={<Measurements />} />
          <Route path="progreso" element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
