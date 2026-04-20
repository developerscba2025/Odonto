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
  clinicSettings?: {
    openTime: string;
    closeTime: string;
  };
}

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
        <Card variant="surface" className="relative overflow-hidden group border-0 shadow-lg shadow-blue-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Turnos Hoy</p>
              <h2 className="text-5xl font-black text-text-main tracking-tighter mt-1">{stats.appointmentsToday}</h2>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          {stats.pendingAppointments > 0 && (
            <div className="mt-4 pt-3 border-t border-border-main/50 flex items-center gap-2 relative z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
              <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">{stats.pendingAppointments} por confirmar</p>
            </div>
          )}
        </Card>

        {/* Stat: Pacientes */}
        <Card variant="surface" className="relative overflow-hidden group border-0 shadow-lg shadow-indigo-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Pacientes</p>
              <h2 className="text-5xl font-black text-text-main tracking-tighter mt-1">{stats.patientCount}</h2>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-main/50 relative z-10">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-50">Base de Datos Activa</p>
          </div>
        </Card>

        {/* Funnel: En Consultorio */}
        <Card variant="surface" className="relative overflow-hidden group border-0 shadow-lg shadow-cyan-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">En Consultorio</p>
              <h2 className="text-5xl font-black text-cyan-500 tracking-tighter mt-1 animate-pulse drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">{funnelStats.active}</h2>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-cyan-500 text-white shadow-lg shadow-cyan-400/30 rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-main/50 relative z-10">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full inline-block animate-ping" /> Tiempo Real
            </p>
          </div>
        </Card>

        {/* Funnel: Atendidos */}
        <Card variant="surface" className="relative overflow-hidden group border-0 shadow-lg shadow-emerald-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Atendidos</p>
              <h2 className="text-5xl font-black text-emerald-500 tracking-tighter mt-1">{funnelStats.passed}</h2>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 rounded-2xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-main/50 flex items-center gap-3 relative z-10">
            <div className="w-full bg-border-main/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: funnelStats.total > 0 ? `${Math.round((funnelStats.passed / funnelStats.total) * 100)}%` : '0%' }}
              />
            </div>
            <span className="text-[10px] font-black text-emerald-500 shrink-0">
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

          {/* Lista de Próximos Turnos */}
          <Card padding="none" className="overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border-border-main bg-bg-surface flex flex-col rounded-3xl">
            <div className="p-5 border-b border-border-main bg-bg-main/20 flex justify-between items-center backdrop-blur-sm">
              <div>
                <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.2em]">Agenda del Día</h3>
                {stats.showingNextDays && (
                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-0.5 opacity-90 drop-shadow-md">Mostrando próximos 7 días</p>
                )}
              </div>
              <Link to="/agenda" className="p-1 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="divide-y divide-border-main/50 max-h-[460px] overflow-y-auto">
              {stats.upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center ring-1 ring-blue-500/20 shadow-inner">
                    <Calendar className="w-10 h-10 text-blue-500/50" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-text-main mb-1">¡Jornada Despejada!</h4>
                    <p className="text-[10px] font-bold text-text-muted opacity-60">No hay turnos pendientes para hoy.</p>
                  </div>
                  <Link to="/agenda" className="pt-2">
                    <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-wider font-black text-blue-500 bg-blue-500/10 rounded-xl hover:bg-blue-500/20">
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
                      className={`group p-4 lg:p-5 transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-4
                        ${isPassed ? 'opacity-40 grayscale hover:grayscale-0 hover:bg-bg-main/20' : 'hover:bg-bg-main/30'}
                        ${isActive ? 'bg-gradient-to-r from-blue-500/5 to-transparent' : ''}
                      `}
                      onClick={() => openQuickSidebar(app.patientId, app.id)}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
                      
                      <div className="flex items-center gap-4 flex-1 min-w-0 z-10">
                        <div className="shrink-0 text-center w-16 px-2 py-1.5 rounded-xl bg-bg-main/50 border border-border-main shadow-inner">
                          <span className={`text-[13px] font-black block tracking-tight ${isPassed ? 'text-text-muted' : isActive ? 'text-cyan-500' : 'text-blue-500'}`}>{app.startTime}</span>
                          {stats.showingNextDays && (
                            <span className="text-[8px] font-black text-text-muted uppercase opacity-70 block mt-0.5">
                              {new Date(app.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-black text-[13px] truncate tracking-tight flex items-center gap-2 ${isPassed ? 'text-text-muted' : 'text-text-main'}`}>
                            {app.patient.lastName}, {app.patient.firstName}
                            {isActive && <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-500 text-[8px] uppercase tracking-widest border border-cyan-500/20">Ahorita</span>}
                          </p>
                          <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em] truncate opacity-60 mt-1">
                            {isPassed ? 'FINALIZADO • ' : ''}{app.service || 'Consulta General'}
                          </p>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="z-10 shrink-0">
                        {app.status === 'PENDING' ? (
                          <div className="flex gap-2 bg-bg-main/50 p-1.5 rounded-xl border border-border-main">
                            <button onClick={() => handleStatusChange(app.id, 'CONFIRMED')} className="p-1 hover:bg-emerald-500/20 text-text-muted hover:text-emerald-500 rounded-lg transition-all"><CheckCircle className="w-4 h-4" /></button>
                            <button onClick={() => handleStatusChange(app.id, 'CANCELLED')} className="p-1 hover:bg-red-500/20 text-text-muted hover:text-red-500 rounded-lg transition-all"><XCircle className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-bg-surface ${
                            app.status === 'CANCELLED' ? 'bg-red-500 ring-red-500/30' : 
                            app.status === 'CONFIRMED' ? 'bg-emerald-500 ring-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                            'bg-slate-500'
                          }`} />
                        )}
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
                slotMinTime={`${stats.clinicSettings?.openTime || '08:00'}:00`}
                slotMaxTime={`${stats.clinicSettings?.closeTime || '20:00'}:00`}
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
                // Si estamos mostrando próximos días, forzamos al calendario a iniciar en la fecha del primer turno
                initialDate={stats.upcomingAppointments.length > 0 ? stats.upcomingAppointments[0].date.split('T')[0] : undefined}
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

