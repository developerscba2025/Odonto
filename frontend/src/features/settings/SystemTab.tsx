import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Bell, Globe, Wifi, WifiOff, RefreshCw, LogOut, MessageCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import api from '../../lib/api';

type WAStatus = 'DISCONNECTED' | 'QR_READY' | 'CONNECTED' | 'LOADING';

interface WAStatusResponse {
  status: WAStatus;
  qrDataUrl: string | null;
  isConnected: boolean;
}

const WhatsAppWidget = () => {
  const [waStatus, setWaStatus] = useState<WAStatusResponse>({ 
    status: 'LOADING', 
    qrDataUrl: null, 
    isConnected: false 
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pollingActive, setPollingActive] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get('/whatsapp/status');
      setWaStatus(res.data);
      // Dejar de hacer polling una vez conectado para ahorrar recursos
      if (res.data.status === 'CONNECTED') {
        setPollingActive(false);
      }
    } catch (err) {
      console.error('[WA Widget] Error consultando estado:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    if (!pollingActive) return;
    // Polling cada 3 segundos cuando esperando QR o conectando
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus, pollingActive]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/whatsapp/logout');
      setPollingActive(true);
      fetchStatus();
    } catch (err) {
      console.error('[WA Widget] Error al cerrar sesión:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const statusConfig = {
    CONNECTED: {
      label: 'Conectado',
      sublabel: 'Los mensajes se envían automáticamente a los pacientes.',
      color: 'emerald',
      icon: Wifi,
      pulse: true,
    },
    QR_READY: {
      label: 'Esperando vinculación',
      sublabel: 'Escaneá el código QR con WhatsApp en tu celular.',
      color: 'yellow',
      icon: MessageCircle,
      pulse: true,
    },
    LOADING: {
      label: 'Inicializando...',
      sublabel: 'El motor de WhatsApp se está iniciando. Esto puede tomar unos segundos.',
      color: 'blue',
      icon: Loader2,
      pulse: false,
    },
    DISCONNECTED: {
      label: 'Desconectado',
      sublabel: 'El servicio de mensajería no está activo.',
      color: 'red',
      icon: WifiOff,
      pulse: false,
    },
  };

  const { label, sublabel, color, icon: StatusIcon, pulse } = statusConfig[waStatus.status] || statusConfig.DISCONNECTED;

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  
  const dotColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  };

  return (
    <Card variant="surface" padding="none" className={`border ${colorMap[color]} bg-bg-main/5`}>
      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className={`relative p-4 rounded-2xl ${colorMap[color]}`}>
            <StatusIcon className={`w-7 h-7 ${waStatus.status === 'LOADING' ? 'animate-spin' : ''}`} />
            {pulse && (
              <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ${dotColorMap[color]} animate-ping`} />
            )}
          </div>
          <div>
            <p className="text-lg font-black text-text-main leading-none">Motor de WhatsApp</p>
            <p className={`text-xs font-black uppercase tracking-widest mt-1 opacity-80 text-${color}-400`}>{label}</p>
            <p className="text-[11px] text-text-muted opacity-60 mt-1 leading-relaxed max-w-sm">{sublabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={() => { setPollingActive(true); fetchStatus(); }}
            className="opacity-60 hover:opacity-100"
          />
          {waStatus.isConnected && (
            <Button
              variant="secondary"
              size="sm"
              icon={LogOut}
              isLoading={isLoggingOut}
              onClick={handleLogout}
              className="text-red-500 border-red-500/30 hover:bg-red-500/10"
            >
              Desvincular
            </Button>
          )}
        </div>
      </div>

      {/* QR Code Panel */}
      {waStatus.status === 'QR_READY' && waStatus.qrDataUrl && (
        <div className="border-t border-yellow-500/20 p-6 flex flex-col md:flex-row items-center gap-8 bg-yellow-500/5">
          <div className="p-3 bg-white rounded-2xl shadow-2xl shadow-yellow-500/10 flex-shrink-0">
            <img
              src={waStatus.qrDataUrl}
              alt="WhatsApp QR Code"
              className="w-44 h-44 rounded-xl"
            />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <p className="text-sm font-black text-text-main">¿Cómo vincular?</p>
            <ol className="space-y-2">
              {[
                'Abrí WhatsApp en tu celular',
                'Tocá los 3 puntos → Dispositivos vinculados',
                'Tocá "Vincular un dispositivo"',
                'Apuntá la cámara a este código QR'
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Connected state info */}
      {waStatus.status === 'CONNECTED' && (
        <div className="border-t border-emerald-500/20 px-6 py-4 bg-emerald-500/5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold text-emerald-500">
            ✅ Sesión activa · Recordatorios automáticos a las 08:00 AM · Confirmaciones en tiempo real al reservar
          </p>
        </div>
      )}
    </Card>
  );
};

export const SystemTab = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative z-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-2xl font-black text-text-main tracking-tight">Ajustes del Sistema</h2>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Personalización y Experiencia</p>
      </header>

      <div className="space-y-6">
        {/* WhatsApp Widget */}
        <WhatsAppWidget />

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
              <p className="text-xl font-black text-text-main leading-none">Notificaciones Push</p>
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
