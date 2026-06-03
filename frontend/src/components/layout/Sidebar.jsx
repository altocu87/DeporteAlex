import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Wind, Ruler, TrendingUp, ListChecks, X, Activity } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/entrenamientos', icon: Dumbbell, label: 'Entrenamientos' },
  { to: '/cardio', icon: Wind, label: 'Cardio' },
  { to: '/medidas', icon: Ruler, label: 'Medidas' },
  { to: '/composicion', icon: Activity, label: 'Composición' },
  { to: '/ejercicios', icon: ListChecks, label: 'Ejercicios' },
  { to: '/progreso', icon: TrendingUp, label: 'Progreso' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-56 bg-surface border-r border-border
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Dumbbell size={16} className="text-white" />
          </div>
          <span className="font-bold text-text-primary text-lg">DeporteAlex</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-text-muted hover:text-text-primary">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-text-muted text-center">DeporteAlex v1.0</p>
      </div>
    </aside>
  );
}
