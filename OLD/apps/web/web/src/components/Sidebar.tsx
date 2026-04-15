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
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',     path: '/' },
  { icon: Users,           label: 'Pacientes',     path: '/pacientes' },
  { icon: Calendar,        label: 'Agenda',        path: '/agenda' },
  { icon: Settings,        label: 'Configuración', path: '/configuracion' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.name?.[0] || '?'}${user.lastName?.[0] || '?'}`.toUpperCase()
    : '??';

  const sidebarClasses = twMerge(
    clsx(
      "sidebar flex",
      "fixed md:fixed", // Always fixed
      "translate-x-0 transition-transform duration-300",
      !isOpen && "-translate-x-full md:translate-x-0"
    )
  );

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={sidebarClasses}>
        {/* Logo & Close button */}
        <div className="pt-7 px-5 pb-5 flex items-center justify-between">
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
          
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
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
                onClick={() => window.innerWidth < 768 && onClose?.()}
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
            className="btn-secondary w-full justify-between mb-3 !p-3"
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
    </>
  );
}
