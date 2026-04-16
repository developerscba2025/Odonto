import React from 'react';
import { Sun, Moon, Bell, Globe } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const SystemTab = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative z-10 space-y-12 animate-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-2xl font-black text-text-main tracking-tight">Ajustes del Sistema</h2>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Personalización y Experiencia</p>
      </header>

      <div className="space-y-6">
        {/* Theme Selector */}
        <Card variant="surface" padding="none" className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 bg-bg-main/20">
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-[1.5rem] shadow-2xl transition-all ${theme === 'light' ? 'bg-orange-100 text-orange-600 scale-110' : 'bg-blue-900/30 text-blue-400'}`}>
              {theme === 'light' ? <Sun className="w-8 h-8" /> : <Moon className="w-8 h-8" />}
            </div>
            <div>
              <p className="text-xl font-black text-text-main leading-none">Apariencia Visual</p>
              <p className="text-xs font-bold text-text-muted opacity-60 mt-2">Alterna entre el modo claro y oscuro del sistema.</p>
            </div>
          </div>
          <div className="flex bg-bg-surface p-2 rounded-[1.5rem] border border-border-main shadow-inner">
            <button 
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${theme === 'light' ? 'bg-bg-main border border-border-main shadow-xl text-orange-600 scale-105' : 'text-text-muted hover:text-text-main'}`}
            >
              Modo Claro
            </button>
            <button 
              onClick={() => theme === 'light' && toggleTheme()}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${theme === 'dark' ? 'bg-[#020617] border border-white/5 shadow-2xl text-blue-400 scale-105' : 'text-text-muted hover:text-text-main'}`}
            >
              Modo Oscuro
            </button>
          </div>
        </Card>

        {/* Notifications */}
        <Card variant="surface" padding="md" className="flex justify-between items-center group bg-bg-main/10 border-border-main/30">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-indigo-500/10 text-indigo-500 rounded-[2rem] group-hover:scale-110 transition-all shadow-lg shadow-indigo-500/10">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xl font-black text-text-main leading-none">Notificaciones</p>
              <p className="text-xs font-bold text-text-muted opacity-60 mt-2">Alertas en tiempo real de turnos y urgencias.</p>
            </div>
          </div>
          <div className="w-16 h-9 bg-emerald-500 rounded-full relative p-1.5 cursor-pointer shadow-lg shadow-emerald-500/20">
            <div className="w-6 h-6 bg-white rounded-full ml-auto shadow-sm" />
          </div>
        </Card>

        {/* Language */}
        <Card variant="surface" padding="md" className="flex justify-between items-center group bg-bg-main/10 border-border-main/30">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-emerald-500/10 text-emerald-500 rounded-[2rem] group-hover:scale-110 transition-all shadow-lg shadow-emerald-500/10">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xl font-black text-text-main leading-none">Configuración Regional</p>
              <p className="text-xs font-bold text-text-muted opacity-60 mt-2">Idioma: Español (Lat/Am) / Zona Horaria: GMT-3</p>
            </div>
          </div>
          <Button variant="ghost" className="uppercase tracking-[0.2em] text-[10px]">Cambiar</Button>
        </Card>
      </div>
    </div>
  );
};
