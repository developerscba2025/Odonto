import React, { useState } from 'react';
import { 
  CalendarDays, 
  Users, 
  LayoutDashboard, 
  Smile, 
  Settings, 
  Menu,
  Bell,
  Search,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Agenda', icon: CalendarDays, path: '/agenda' },
    { name: 'Pacientes', icon: Users, path: '/pacientes' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg flex-shrink-0">
              <Smile className="w-6 h-6" />
            </div>
            <span className={`text-lg font-bold text-slate-800 tracking-tight transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
              DentalFlow
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 relative">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
              title={!isSidebarOpen ? item.name : ""}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.name}
              </span>
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button 
              onClick={logout}
              className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
              title={!isSidebarOpen ? "Cerrar Sesión" : ""}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                Cerrar Sesión
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
             {/* Buscador Rápido */}
             <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none w-64 transition-all"
              />
            </div>
            
            <button className="p-2 relative text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div 
              className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex justify-center items-center text-blue-700 text-xs font-bold overflow-hidden cursor-pointer hover:bg-blue-200 transition-colors"
              title={user?.name}
            >
              {user ? getInitials(user.name) : '??'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children || (
            <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 h-full">
              <p>Contenido principal de la vista</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
