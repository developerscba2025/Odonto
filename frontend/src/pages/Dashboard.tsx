import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  PlusCircle,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { QuickPatientSidebar } from '../components/dashboard/QuickPatientSidebar';
import { useToast } from '../store/ToastContext';


// UI Atoms
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface UpcomingAppointment {
  id: string;
  patientId: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
  service: string | null;

  patient: {
    firstName: string;
    lastName: string;
  };
  professional: {
    name: string;
    color: string | null;
  };
}


interface Stats {
  patientCount: number;
  appointmentsToday: number;
  pendingAppointments: number;
  upcomingAppointments: UpcomingAppointment[];
  showingNextDays?: boolean;
}

export default function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats>({ 
    patientCount: 0, 
    appointmentsToday: 0,
    pendingAppointments: 0,
    upcomingAppointments: [],
    showingNextDays: false
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

  const funnelStats = {
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

      {/* ── STATS + FUNNEL ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat: Turnos Hoy */}
        <Card variant="surface" className="relative overflow-hidden border-t-2 border-t-blue-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Turnos Hoy</p>
              <h2 className="text-4xl font-black text-text-main tracking-tighter mt-1">{stats.appointmentsToday}</h2>
            </div>
            <div className="p-2.5 bg-blue-600/10 text-blue-500 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          {stats.pendingAppointments > 0 && (
            <div className="mt-3 pt-3 border-t border-border-main flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{stats.pendingAppointments} por confirmar</p>
            </div>
          )}
        </Card>

        {/* Stat: Pacientes */}
        <Card variant="surface" className="relative overflow-hidden border-t-2 border-t-indigo-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Pacientes</p>
              <h2 className="text-4xl font-black text-text-main tracking-tighter mt-1">{stats.patientCount}</h2>
            </div>
            <div className="p-2.5 bg-indigo-600/10 text-indigo-500 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-main">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Base de Datos</p>
          </div>
        </Card>

        {/* Funnel: En Consultorio */}
        <Card variant="surface" className="relative overflow-hidden border-t-2 border-t-blue-400">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">En Consultorio</p>
              <h2 className="text-4xl font-black text-blue-400 tracking-tighter mt-1 animate-pulse">{funnelStats.active}</h2>
            </div>
            <div className="p-2.5 bg-blue-400/10 text-blue-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-main">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Tiempo Real</p>
          </div>
        </Card>

        {/* Funnel: Atendidos */}
        <Card variant="surface" className="relative overflow-hidden border-t-2 border-t-emerald-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Atendidos</p>
              <h2 className="text-4xl font-black text-emerald-400 tracking-tighter mt-1">{funnelStats.passed}</h2>
            </div>
            <div className="p-2.5 bg-emerald-600/10 text-emerald-500 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-main flex items-center gap-2">
            <div className="w-full bg-border-main rounded-full h-1">
              <div
                className="bg-emerald-500 h-1 rounded-full transition-all duration-700"
                style={{ width: funnelStats.total > 0 ? `${Math.round((funnelStats.passed / funnelStats.total) * 100)}%` : '0%' }}
              />
            </div>
            <span className="text-[9px] font-black text-emerald-500 shrink-0">
              {funnelStats.total > 0 ? Math.round((funnelStats.passed / funnelStats.total) * 100) : 0}%
            </span>
          </div>
        </Card>
      </div>

      {/* ── GRID PRINCIPAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">

        {/* Columna Izquierda */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">

          {/* Acciones Rápidas dentro del panel */}
          <Card padding="sm" className="border-border-main bg-bg-surface">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">Acciones Rápidas</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, idx) => (
                <Link key={idx} to={action.path} className={idx === 0 ? "col-span-2 block" : "col-span-1 block"}>
                  <Button
                    variant={idx === 0 ? 'primary' : 'secondary'}
                    size="sm"
                    icon={action.icon}
                    className="w-full justify-center px-3 py-2.5 text-xs"
                  >
                    {action.name}
                  </Button>
                </Link>
              ))}
            </div>
          </Card>

          {/* Lista de Próximos Turnos */}
          <Card padding="none" className="overflow-hidden border-border-main bg-bg-surface flex flex-col rounded-3xl">
            <div className="p-4 border-b border-border-main bg-bg-main/30 flex justify-between items-center">
              <div>
                <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.2em]">Próximos Turnos</h3>
                {stats.showingNextDays && (
                  <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest mt-0.5 opacity-80">Mostrando próximos 7 días</p>
                )}
              </div>
              <Link to="/agenda" className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline">Ver Todo</Link>
            </div>

            <div className="divide-y divide-border-main/10 max-h-[500px] overflow-y-auto">
              {stats.upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                    <Calendar className="w-8 h-8 text-blue-500 opacity-80" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-text-main mb-1">¡Jornada Despejada!</h4>
                    <p className="text-[10px] font-bold text-text-muted opacity-60 max-w-[200px]">No hay turnos pendientes para hoy.</p>
                  </div>
                  <Link to="/agenda">
                    <Button variant="ghost" size="sm" className="text-[9px] uppercase tracking-wider text-blue-400 bg-blue-500/10 rounded-full">
                      Abrir Planner
                    </Button>
                  </Link>
                </div>
              ) : (
                stats.upcomingAppointments.map((app) => {
                  const stage = getStage(app.startTime, app.endTime);
                  const isPassed = stage === 'PASSED';
                  const isActive = stage === 'ACTIVE';

                  return (
                    <div key={app.id}
                      className={`group p-4 transition-all cursor-pointer border-l-2 relative overflow-hidden
                        ${isPassed ? 'border-transparent opacity-50 grayscale hover:grayscale-0' : ''}
                        ${isActive ? 'border-blue-500 bg-blue-500/5 hover:bg-blue-500/10' : ''}
                        ${!isPassed && !isActive ? 'border-transparent hover:bg-bg-main/40' : ''}
                      `}
                      onClick={() => openQuickSidebar(app.patientId, app.id)}
                    >
                      {isActive && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none animate-pulse" />}
                      <div className="flex items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 text-right w-14">
                            <span className={`text-xs font-black block ${isPassed ? 'text-text-muted' : 'text-blue-500'}`}>{app.startTime}</span>
                            {stats.showingNextDays && (
                              <span className="text-[8px] font-bold text-text-muted opacity-50 block">
                                {new Date(app.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-bold text-xs truncate uppercase tracking-tight flex items-center gap-2 ${isPassed ? 'text-text-muted' : 'text-text-main'}`}>
                              {app.patient.lastName}, {app.patient.firstName.charAt(0)}.
                              {isActive && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />}
                            </p>
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.1em] truncate opacity-50">
                              {isPassed ? 'FINALIZADO • ' : ''}{app.service || 'Consulta General'}
                            </p>
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          {app.status === 'PENDING' ? (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleStatusChange(app.id, 'CONFIRMED')} className="p-1 hover:text-emerald-500 text-text-muted transition-colors"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => handleStatusChange(app.id, 'CANCELLED')} className="p-1 hover:text-red-500 text-text-muted transition-colors"><XCircle className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ${app.status === 'CANCELLED' ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Columna Derecha: Timeline */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card padding="none" className="bg-bg-surface border-border-main h-[650px] overflow-hidden flex flex-col rounded-3xl">
            <div className="p-4 border-b border-border-main bg-bg-main/30 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.2em]">Timeline Diario</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">En Tiempo Real</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                locale={esLocale}
                headerToolbar={false}
                dayHeaders={false}
                height="auto"
                expandRows={true}
                slotMinTime="07:00:00"
                slotMaxTime="19:00:00"
                slotDuration="00:30:00"
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  omitZeroMinute: false,
                  meridiem: false,
                  hour12: false
                }}
                slotLabelContent={(arg) => (
                  <div className="text-[14px] font-medium text-text-main flex items-center gap-1">
                    <span>{arg.text}</span>
                    <span className="text-[9px] opacity-40 uppercase">hs</span>
                  </div>
                )}
                allDaySlot={false}
                events={stats.upcomingAppointments.map(app => ({
                  id: app.id,
                  title: `${app.patient.lastName}, ${app.patient.firstName}`,
                  start: `${app.date.split('T')[0]}T${app.startTime}:00`,
                  end: `${app.date.split('T')[0]}T${app.endTime || '23:59'}:00`,
                  backgroundColor: app.status === 'CANCELLED' ? 'transparent' : (app.professional.color || '#3b82f6'),
                  borderColor: app.status === 'CANCELLED' ? '#ef4444' : 'transparent',
                  classNames: app.status === 'CANCELLED' ? ['border-2', 'border-dashed', 'opacity-30'] : ['shadow-sm'],
                  extendedProps: { patientId: app.patientId }
                }))}
                eventClick={(info) => openQuickSidebar(info.event.extendedProps.patientId, info.event.id)}
              />
            </div>
          </Card>
        </div>
      </div>

      <QuickPatientSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        patientId={selectedPatientId}
        appointmentId={selectedAppointmentId}
      />

      <style>{`
        .fc {
          --fc-border-color: rgba(39, 53, 72, 0.3);
          --fc-page-bg-color: transparent;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border: 1px solid rgba(39, 53, 72, 0.2) !important;
          border-radius: 0 !important;
        }
        .fc-timegrid-slots td {
          border-bottom: none !important;
        }
        .fc-scrollgrid {
          border: none !important;
          background: transparent !important;
          border-radius: 0 !important;
        }
        .fc-scrollgrid-sync-inner {
          background: transparent !important;
        }
        .fc-col-header-cell-cushion {
          display: none !important;
        }
        .fc-timegrid-axis-frame, .fc-timegrid-axis-cushion {
          background: transparent !important;
          color: var(--color-text-main) !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          font-size: 14px !important;
          letter-spacing: 0.02em !important;
        }
        .fc-timegrid-slot-label, .fc-timegrid-axis {
          border: none !important;
        }
        .fc-timegrid-slot-label-frame {
          border: none !important;
          border-radius: 0 !important;
        }
        /* Eliminar scrollbar interno y asegurar que no haya desbordamiento */
        .fc-scroller {
          overflow: hidden !important;
          border-radius: 0 !important;
        }
        .fc-scroller-harness {
           background: transparent !important;
           border-radius: 0 !important;
        }
        /* Corregir el 'espacio blanco' que suele ser el fondo del scrollgrid */
        .fc-scrollgrid-section-header, .fc-scrollgrid-section-footer {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

