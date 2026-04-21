import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DashboardStats as Stats } from '../../types/dashboard';

interface Props {
  stats: Stats;
  onOpenSidebar: (patientId: string, appointmentId: string) => void;
  onStatusChange: (appId: string, newStatus: string) => void;
  getStage: (startTime: string, endTime: string) => 'FUTURE' | 'ACTIVE' | 'PASSED';
}

export const AppointmentList = ({ stats, onOpenSidebar, onStatusChange, getStage }: Props) => {
  return (
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
                onClick={() => onOpenSidebar(app.patientId, app.id)}
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
                      <button onClick={() => onStatusChange(app.id, 'CONFIRMED')} className="p-1 hover:bg-emerald-500/20 text-text-muted hover:text-emerald-500 rounded-lg transition-all"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => onStatusChange(app.id, 'CANCELLED')} className="p-1 hover:bg-red-500/20 text-text-muted hover:text-red-500 rounded-lg transition-all"><XCircle className="w-4 h-4" /></button>
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
  );
};
