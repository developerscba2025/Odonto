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
      <div style={{ padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
            flexShrink: 0,
          }}>
            <Stethoscope size={18} color="white" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              OdontoMax
            </span>
            <p style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.6)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Professional OS
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <p className="sidebar-section-label" style={{ marginBottom: '8px' }}>Principal</p>

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
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              style={{ marginBottom: '2px' }}
            >
              <item.icon size={18} className="nav-icon" strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer', marginBottom: '12px', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(148,163,184,0.8)' }}>
            {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          </span>
          {isDarkMode
            ? <Sun size={15} color="#fbbf24" />
            : <Moon size={15} color="#94a3b8" />
          }
        </button>

        {/* User */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          marginTop: '4px'
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: user?.professionalProfile?.color ?? '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Dr. {user?.lastName || 'Doctor'}
            </p>
            <button
              onClick={handleLogout}
              style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}
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
