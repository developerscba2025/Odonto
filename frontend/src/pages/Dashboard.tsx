import { useState, useEffect } from 'react';
import { UserPlus, PlusCircle, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { QuickPatientSidebar } from '../components/dashboard/QuickPatientSidebar';
import { useToast } from '../store/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Imported dashboard modules
import { DashboardStats as Stats, FunnelStats } from '../types/dashboard';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { AppointmentList } from '../components/dashboard/AppointmentList';
import { DailyCalendar } from '../components/dashboard/DailyCalendar';

export default function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats>({ 
    patientCount: 0, 
    appointmentsToday: 0,
    pendingAppointments: 0,
    upcomingAppointments: [],
    showingNextDays: false,
    clinicSettings: {
      openTime: '08:00',
      closeTime: '20:00'
    }
  });
  const [dailyAlert, setDailyAlert] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Sidebar states
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/daily-alert')
        ]);
        setStats(statsRes.data);
        setDailyAlert(alertRes.data.message);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const openQuickSidebar = (patientId: string, appointmentId: string) => {
    setSelectedPatientId(patientId);
    setSelectedAppointmentId(appointmentId);
    setIsSidebarOpen(true);
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${appId}`, { status: newStatus });
      setStats(prev => ({
        ...prev,
        upcomingAppointments: prev.upcomingAppointments.map(app => 
          app.id === appId ? { ...app, status: newStatus } : app
        ),
        pendingAppointments: newStatus === 'PENDING' 
           ? prev.pendingAppointments + 1 
           : prev.upcomingAppointments.find(a => a.id === appId)?.status === 'PENDING' 
              ? prev.pendingAppointments - 1 
              : prev.pendingAppointments
      }));
      showToast('Estado actualizado', 'success');
    } catch (error) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  const quickActions = [
    { name: 'Nuevo Paciente', icon: UserPlus, path: '/pacientes', color: 'bg-blue-600', desc: 'Registrar ficha clínica' },
    { name: 'Agendar Turno', icon: PlusCircle, path: '/agenda', color: 'bg-indigo-600', desc: 'Gestionar disponibilidad' },
    { name: 'Nueva Evolución', icon: ClipboardList, path: '/pacientes', color: 'bg-emerald-600', desc: 'Seguimiento de tratamiento' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-text-muted uppercase tracking-[0.3em] animate-pulse">Sincronizando DentalFlow...</p>
      </div>
    );
  }

  // Time & Funnel Logic
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getStage = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return 'FUTURE';
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startObj = startH * 60 + startM;
    const endObj = endH * 60 + endM;
    if (currentMinutes > endObj) return 'PASSED';
    if (currentMinutes >= startObj && currentMinutes <= endObj) return 'ACTIVE';
    return 'FUTURE';
  };

  const funnelStats: FunnelStats = {
    total: stats.upcomingAppointments.length,
    confirmed: stats.upcomingAppointments.filter(a => a.status === 'CONFIRMED').length,
    passed: stats.upcomingAppointments.filter(a => getStage(a.startTime, a.endTime) === 'PASSED').length,
    active: stats.upcomingAppointments.filter(a => getStage(a.startTime, a.endTime) === 'ACTIVE').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 w-full mx-auto pb-12">
      {/* ── HEADER COMPACTO ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-tighter uppercase">Panel de Control</h1>
          {dailyAlert && (
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
              {dailyAlert}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-bg-surface border border-border-main rounded-xl shadow-sm shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-[10px] font-black text-text-main uppercase tracking-widest">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* ── STATS + FUNNEL ROW (Module) ── */}
      <DashboardStats stats={stats} funnelStats={funnelStats} />

      {/* ── GRID PRINCIPAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        {/* Columna Izquierda */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Acciones Rápidas */}
          <Card padding="sm" className="border-border-main bg-bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-3xl">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 pl-1">Acceso Directo</p>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <Link key={idx} to={action.path} className={idx === 0 ? "col-span-2 block" : "col-span-1 block"}>
                  <Button
                    variant={idx === 0 ? 'primary' : 'secondary'}
                    icon={action.icon}
                    className={`w-full justify-center px-4 py-3.5 text-xs font-black shadow-none border ${idx !== 0 && 'border-border-main/50 bg-bg-main hover:border-blue-500/30'} rounded-2xl`}
                  >
                    {action.name}
                  </Button>
                </Link>
              ))}
            </div>
          </Card>

          {/* Lista de Próximos Turnos (Module) */}
          <AppointmentList 
            stats={stats} 
            onOpenSidebar={openQuickSidebar} 
            onStatusChange={handleStatusChange} 
            getStage={getStage}
          />
        </div>

        {/* Columna Derecha: Timeline (Module) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <DailyCalendar stats={stats} onOpenSidebar={openQuickSidebar} />
        </div>
      </div>

      <QuickPatientSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        patientId={selectedPatientId}
        appointmentId={selectedAppointmentId}
      />
    </div>
  );
}
