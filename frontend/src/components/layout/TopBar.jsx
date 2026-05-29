import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const titles = {
  '/': 'Inicio',
  '/entrenamientos': 'Entrenamientos',
  '/entrenamientos/nuevo': 'Nuevo Entrenamiento',
  '/cardio': 'Cardio',
  '/medidas': 'Medidas Corporales',
  '/progreso': 'Progreso',
};

export default function TopBar({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = pathname.startsWith('/entrenamientos/')
    ? 'Detalle del Entrenamiento'
    : titles[pathname] || '';

  return (
    <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-surface border-b border-border">
      <button
        onClick={onMenuClick}
        className="text-text-muted hover:text-text-primary p-1 rounded"
      >
        <Menu size={22} />
      </button>
      <h1 className="font-semibold text-text-primary">{title}</h1>
    </header>
  );
}
