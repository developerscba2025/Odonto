import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  PlusCircle, 
  ClipboardList, 
  ChevronRight,
  ArrowUpRight,
  User as UserIcon,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

// UI Atoms
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface UpcomingAppointment {
  id: string;
  startTime: string;
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
  upcomingAppointments: UpcomingAppointment[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ 
    patientCount: 0, 
    appointmentsToday: 0,
    upcomingAppointments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { name: 'Nuevo Paciente', icon: UserPlus, path: '/pacientes', color: 'bg-blue-600', desc: 'Registrar ficha clínica' },
    { name: 'Agendar Turno', icon: PlusCircle, path: '/agenda', color: 'bg-indigo-600', desc: 'Gestionar disponibilidad' },
    { name: 'Nueva Evolución', icon: ClipboardList, path: '/pacientes', color: 'bg-emerald-600', desc: 'Seguimiento de tratamiento' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-text-muted uppercase tracking-[0.3em] animate-pulse">DentalFlow Nexus Syncing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Resumen */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-text-main tracking-tighter">Panel Genérico</h1>
          <div className="flex items-center gap-3">
            <Badge variant="blue" size="xs">Live Data</Badge>
            <p className="text-sm text-text-muted font-bold opacity-60">Resumen operativo del consultorio</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 bg-bg-surface/50 border border-border-main/50 rounded-[2rem] shadow-xl shadow-black/5 backdrop-blur-xl">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <p className="text-xs font-black text-text-main uppercase tracking-widest">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* Grid de Stats Elite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card variant="surface" className="group hover:border-blue-500/50 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-600/10 text-blue-500 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500">
              <Calendar className="w-7 h-7" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500 opacity-40" />
          </div>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest leading-none">Turnos de Hoy</p>
          <div className="flex items-end gap-3 mt-4">
            <h2 className="text-5xl font-black text-text-main tracking-tighter">{stats.appointmentsToday}</h2>
            <Badge variant="emerald" size="xs">+12%</Badge>
          </div>
        </Card>

        <Card variant="surface" className="group hover:border-indigo-500/50 transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-indigo-600/10 text-indigo-500 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500">
              <Users className="w-7 h-7" />
            </div>
            <Activity className="w-5 h-5 text-indigo-500 opacity-40" />
          </div>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest leading-none">Total Pacientes</p>
          <div className="flex items-end gap-3 mt-4">
            <h2 className="text-5xl font-black text-text-main tracking-tighter">{stats.patientCount}</h2>
            <Badge variant="blue" size="xs">CRM Activo</Badge>
          </div>
        </Card>

        <Card variant="surface" className="group hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden">
          {/* Decorative Graph Placeholder */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
          
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-600/10 text-emerald-500 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500">
              <AlertCircle className="w-7 h-7" />
            </div>
          </div>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest leading-none">Alertas Clínicas</p>
          <div className="mt-4">
            <h3 className="text-xl font-black text-text-main">Operación Estable</h3>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Sin anomalías críticas</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Próximos Turnos (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-text-main tracking-tight">Próximos en Lista</h3>
            <Link to="/agenda">
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest">Ver Agenda <ChevronRight className="w-3 h-3 ml-1" /></Button>
            </Link>
          </div>

          <Card padding="none" className="overflow-hidden border-border-main/30">
            <div className="divide-y divide-border-main/30">
              {stats.upcomingAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted space-y-4">
                  <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center border border-border-main opacity-20">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold opacity-40">No hay más turnos agendados para este momento.</p>
                </div>
              ) : (
                stats.upcomingAppointments.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-7 hover:bg-blue-600/5 transition-all group relative overflow-hidden">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-bg-surface/50 rounded-2xl flex flex-col items-center justify-center border border-border-main/50 group-hover:border-blue-500/50 transition-all shadow-xl shadow-black/5">
                        <span className="text-lg font-black leading-none text-text-main">{app.startTime.split(':')[0]}</span>
                        <span className="text-[10px] font-bold text-blue-500 leading-none mt-1 uppercase tracking-widest">{app.startTime.split(':')[1]}</span>
                      </div>
                      <div>
                        <p className="font-black text-text-main text-xl group-hover:text-blue-600 transition-colors">
                          {app.patient.lastName}, {app.patient.firstName}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge variant="blue" size="xs">{app.service || 'Consulta General'}</Badge>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-tighter opacity-60">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: app.professional.color || '#3b82f6' }} />
                             <span>Dr/a. {app.professional.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => navigate(`/pacientes/${app.id}`)}
                      className="opacity-0 group-hover:opacity-100 transition-all p-3 shadow-lg"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Accesos Rápidos (2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-text-main tracking-tight px-2">Gestión Nexo</h3>
          <div className="space-y-4">
            {quickActions.map((action, idx) => (
              <Link key={idx} to={action.path} className="block group">
                <Card padding="sm" className="flex items-center gap-5 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group-active:scale-[0.98]">
                  <div className={`${action.color} p-4 rounded-2xl text-white shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-text-main text-sm uppercase tracking-tight">{action.name}</p>
                    <p className="text-[10px] text-text-muted font-bold opacity-60 mt-0.5">{action.desc}</p>
                  </div>
                  <div className="w-10 h-10 bg-bg-main/50 rounded-xl flex items-center justify-center border border-border-main/50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <Card variant="inset" padding="md" className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/10 mt-8">
             <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg">
                   <Activity className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-black text-text-main uppercase tracking-widest text-[10px]">Optimización IA</p>
             </div>
             <p className="text-xs font-bold text-text-muted leading-relaxed">System nexus is operational. All medical records are synchronized and cloud-secured.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
