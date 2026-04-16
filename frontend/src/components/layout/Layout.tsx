import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  CalendarDays, 
  Users, 
  LayoutDashboard, 
  Smile, 
  Settings, 
  Menu,
  Bell,
  Search,
  LogOut,
  Sun,
  Moon,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import api from '../../lib/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ToastContainer } from '../ui/Toast';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [clinicName, setClinicName] = useState('OdontoNexus');

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const response = await api.get('/dashboard/daily-alert');
        if (response.data.message && !response.data.message.includes('No tienes turnos')) {
          setNotification(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching alert:', error);
      }
    };
    
    const fetchClinicSettings = async () => {
      try {
        const { data } = await api.get('/settings/clinic');
        if (data?.name) {
          setClinicName(data.name);
        }
      } catch(e) {}
    };

    fetchAlert();
    fetchClinicSettings();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    { name: 'Panel', icon: LayoutDashboard, path: '/' },
    { name: 'Agenda', icon: CalendarDays, path: '/agenda' },
    { name: 'Pacientes', icon: Users, path: '/pacientes' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  return (
    <div className="flex bg-bg-main min-h-screen text-text-main font-sans transition-colors duration-500 overflow-hidden">
      
      {/* Sidebar - Elite Glass Design */}
      <aside 
        className={`bg-bg-surface border-r border-border-main transition-all duration-500 flex flex-col z-[60] relative ${
          isSidebarOpen ? 'w-72' : 'w-24'
        }`}
      >
        {/* Abstract Background Decoration */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 h-24 px-6 border-b border-border-main mb-4">
          <div className="bg-blue-600 text-white p-2 rounded-2xl shadow-lg shadow-blue-500/30 flex-shrink-0">
            <Smile className="w-7 h-7" />
          </div>
          <div className={`transition-all duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 scale-90 w-0 overflow-hidden'}`}>
            <span className="text-xl font-black tracking-tighter block leading-none">{clinicName}</span>
            <span className="text-[10px] text-text-muted mt-0.5 lowercase tracking-wider opacity-60">nexus OS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item, index) => (
            <NavLink 
              key={index}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-4 rounded-[1.5rem] transition-all group relative
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40' 
                  : 'text-text-muted hover:bg-white/5 hover:text-text-main'}
              `}
            >
              <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform duration-500 ${isSidebarOpen ? '' : 'group-hover:scale-110'}`} />
              <span className={`font-black text-sm tracking-tight transition-all duration-500 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'}`}>
                {item.name}
              </span>
              {isSidebarOpen && (
                <div className={`absolute right-4 h-1.5 w-1.5 rounded-full bg-white transition-all duration-500 ${isSidebarOpen ? 'opacity-20 translate-x-0' : 'opacity-0 translate-x-4'}`} />
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border-main space-y-4">
          <button 
            onClick={logout}
            className={`flex items-center gap-4 w-full px-4 py-4 rounded-[1.5rem] text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all group`}
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <span className={`font-black text-sm tracking-tight transition-all duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Topbar - Ultra Minimal */}
        <header className="h-24 px-8 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-3 bg-bg-surface/50 border border-border-main backdrop-blur-xl rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden lg:block">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar paciente o tratamiento..." 
                className="pl-14 pr-6 py-4 bg-bg-surface/40 backdrop-blur-xl border border-border-main rounded-xl text-sm focus:bg-bg-surface focus:border-blue-500/50 outline-none w-80 transition-all shadow-xl shadow-black/5"
              />
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="p-3.5 bg-bg-surface/50 border border-border-main backdrop-blur-xl text-text-muted hover:text-text-main rounded-xl transition-all shadow-xl shadow-black/5"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowNotification(!showNotification)}
                  className="p-3.5 bg-bg-surface/50 border border-border-main backdrop-blur-xl text-text-muted hover:text-text-main rounded-xl transition-all shadow-xl shadow-black/5 relative"
                >
                  <Bell className="w-5 h-5" />
                  {notification && (
                    <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-bg-surface animate-bounce" />
                  )}
                </button>

                {showNotification && notification && (
                  <Card 
                    variant="glass" 
                    className="absolute right-0 mt-4 w-[350px] z-[100] animate-in slide-in-from-top-4 duration-300"
                  >
                     <div className="flex items-start gap-4">
                       <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500">
                          <Bell className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                           <p className="text-sm font-black text-text-main">Alerta del Sistema</p>
                           <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Hoy</span>
                         </div>
                         <p className="text-xs text-text-muted leading-relaxed font-medium">
                           {notification}
                         </p>
                         <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowNotification(false)}
                          className="w-full mt-4 text-[10px] uppercase border border-white/5"
                         >
                           Entendido
                         </Button>
                       </div>
                     </div>
                  </Card>
                )}
              </div>
            </div>

            <div 
              onClick={() => navigate('/configuracion')}
              className="flex items-center gap-3 pl-2 pr-5 py-1.5 bg-bg-surface/50 border border-border-main backdrop-blur-xl rounded-xl hover:bg-bg-surface transition-all cursor-pointer shadow-xl shadow-black/5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex justify-center items-center text-white text-xs font-black shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
                {user ? getInitials(user.name) : '??'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black text-text-main leading-none">{user?.name.split(' ')[0]}</p>
                <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1 opacity-60">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <div className="flex-1 p-8 overflow-y-auto relative scrollbar-hide">
           {/* Visual Ambient Glow */}
           <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
              <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute bottom-[10%] left-[15%] w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full" />
           </div>

           <div className="max-w-[1440px] mx-auto min-h-full flex flex-col">
              {children}
           </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
