import React from 'react';
import { Stethoscope, TrendingUp, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import api from '../../lib/api';
import { Evolution, TreatmentPlan, Attachment } from '../../types/clinical';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';



interface ClinicalTimelineProps {
  activeTab: 'evoluciones' | 'planes' | 'galeria';
  history: Evolution[];
  plans: TreatmentPlan[];
  onPlanStatusUpdate: (planId: string, currentStatus: string) => Promise<void>;
  onPlanTaskToggle: (planId: string, taskId: string, allTasksJSON: string) => Promise<void>;
}

export default function ClinicalTimeline({ activeTab, history, plans, onPlanStatusUpdate, onPlanTaskToggle }: ClinicalTimelineProps) {
  return (
    <div className="space-y-6 relative ml-4 border-l-2 border-border-main/30 pl-8 pb-10">
      {activeTab === 'evoluciones' && history.map((evo) => (
        <div key={evo.id} className="relative group">
          <div className="absolute -left-[45px] top-4 w-8 h-8 rounded-xl bg-bg-surface border border-border-main flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-xl">
            <Stethoscope className="w-4 h-4" />
          </div>
          <Card padding="sm" className="hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                {new Date(evo.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-black text-text-main uppercase tracking-tight">{evo.professional?.name || 'Profesional'}</p>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-2 leading-relaxed opacity-80">{evo.description}</p>
            {evo.attachments?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                  {evo.attachments.map((att: Attachment) => (
                    <div key={att.id} className="relative group w-16 h-16 rounded-xl overflow-hidden cursor-pointer border border-border-main/50 hover:border-blue-500/50 transition-all">
                      <img 
                        src={`${API_BASE}${att.url}`} 
                        alt="attachment" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onClick={() => window.open(`${API_BASE}${att.url}`, '_blank')}
                      />
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      ))}

      {activeTab === 'planes' && plans.map((plan) => {
        let parsedTasks: any[] = [];
        try { parsedTasks = JSON.parse(plan.tasks || "[]"); } catch {}
        
        const completedCount = parsedTasks.filter(t => t.done).length;
        const progressPct = parsedTasks.length > 0 ? (completedCount / parsedTasks.length) * 100 : (plan.status === 'COMPLETED' ? 100 : 0);

        return (
          <div key={plan.id} className="relative group">
            <div className="absolute -left-[45px] top-4 w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
            <Card padding="sm" className="hover:border-orange-500/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <button type="button" onClick={() => onPlanStatusUpdate(plan.id, plan.status)} className="focus:outline-none rounded-full hover:scale-105 transition-transform">
                    <Badge 
                      variant={plan.status === 'COMPLETED' ? 'emerald' : plan.status === 'IN_PROGRESS' ? 'blue' : 'orange'} 
                      size="xs"
                      className="uppercase tracking-widest cursor-pointer"
                    >
                      {plan.status === 'COMPLETED' ? 'Finalizado' : plan.status === 'IN_PROGRESS' ? 'En Curso' : 'Pendiente'}
                    </Badge>
                  </button>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-50 block mt-1">
                    Iniciado {new Date(plan.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  {plan.budget && (
                    <p className="text-sm font-black text-emerald-500">$ {plan.budget.toLocaleString()}</p>
                  )}
                </div>
              </div>
              
              <p className="font-bold text-sm text-text-main mb-4">{plan.description}</p>

              {parsedTasks.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {parsedTasks.map(t => (
                      <div key={t.id} className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={t.done} 
                          onChange={() => onPlanTaskToggle(plan.id, t.id, plan.tasks)} 
                          className="w-4 h-4 rounded border-border-main text-blue-500 focus:ring-blue-500 bg-bg-surface cursor-pointer"
                        />
                        <span className={`text-xs ${t.done ? 'line-through text-text-muted opacity-50' : 'text-text-main'}`}>{t.desc}</span>
                      </div>
                    ))}
                  </div>
              )}

              {/* Progress Bar visual indicator */}
              <div className="w-full bg-bg-main h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-1000 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {parsedTasks.length > 0 && (
                <p className="text-[9px] text-right mt-1 font-bold text-text-muted uppercase">{completedCount} / {parsedTasks.length} Tareas</p>
              )}
            </Card>
          </div>
        );
      })}

      {activeTab === 'galeria' && (
        <div className="grid grid-cols-2 gap-4">
          {history.flatMap(evo => evo.attachments || []).map((att: Attachment) => (
            <Card key={att.id} padding="none" className="aspect-square relative group overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all">
                <img 
                src={`${API_BASE}${att.url}`} 
                alt="Gallery" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onClick={() => window.open(`${API_BASE}${att.url}`, '_blank')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Ver Placa</p>
                </div>
            </Card>
          ))}
          {history.every(evo => !evo.attachments?.length) && (
            <Card variant="inset" className="col-span-2 aspect-square flex flex-col items-center justify-center text-center p-6 border-dashed border-2">
                <ImageIcon className="w-10 h-10 text-text-muted opacity-20 mb-4" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sin Radiografías</p>
            </Card>
          )}
        </div>
      )}

      {history.length === 0 && activeTab === 'evoluciones' && (
        <div className="p-10 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-text-muted opacity-20 mx-auto" />
          <p className="text-xs font-bold text-text-muted">Aún no hay registros en la línea de tiempo.</p>
        </div>
      )}
    </div>
  );
}
