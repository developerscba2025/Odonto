import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Moon,
  Sun,
  Stethoscope,
  LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/' },
  { icon: Users,           label: 'Pacientes',     path: '/pacientes' },
  { icon: Calendar,        label: 'Agenda',        path: '/agenda' },
  { icon: Settings,        label: 'Configuración', path: '/configuracion' },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.name[0]}${user.lastName[0]}`.toUpperCase()
    : '??';

  return (
    <aside className="sidebar hidden md:flex">
      {/* Logo */}
      <div className="pt-7 px-5 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-[10px] flex items-center justify-center shadow-lg shadow-primary/35 shrink-0">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div>
            <span className="font-display text-base font-bold text-text-primary tracking-tight leading-none uppercase">
              OdontoMax
            </span>
            <p className="text-[0.65rem] text-text-tertiary mt-0.5 uppercase tracking-widest">
              Professional OS
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-sidebar-border mx-5" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="sidebar-section-label mb-2">Principal</p>

        {navItems.map((item, i) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          >
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link mb-0.5${isActive ? ' active' : ''}`}
            >
              <item.icon size={18} className="nav-icon" strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-subtle border border-sidebar-border cursor-pointer mb-3 transition-all hover:bg-bg-elevated"
        >
          <span className="text-[0.75rem] font-semibold text-text-secondary">
            {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          </span>
          {isDarkMode
            ? <Sun size={15} className="text-amber-500" />
            : <Moon size={15} className="text-text-tertiary" />
          }
        </button>

        {/* User */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-bg-subtle border border-sidebar-border mt-1">
          <div 
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-extrabold text-[0.8rem] shrink-0 shadow-lg shadow-black/10"
            style={{ background: user?.professionalProfile?.color ?? 'var(--color-primary)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.825rem] font-bold text-text-primary truncate">
              Dr. {user?.lastName || 'Doctor'}
            </p>
            <button
              onClick={handleLogout}
              className="text-[0.7rem] text-text-tertiary bg-transparent border-none p-0 cursor-pointer flex items-center gap-1 mt-0.5 hover:text-red-500 transition-colors"
            >
              <LogOut size={11} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
