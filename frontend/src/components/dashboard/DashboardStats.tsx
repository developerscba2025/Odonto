import { Calendar, Users, Activity, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { DashboardStats as Stats, FunnelStats } from '../../types/dashboard';

interface Props {
  stats: Stats;
  funnelStats: FunnelStats;
}

export const DashboardStats = ({ stats, funnelStats }: Props) => {
  return (
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
  );
};
