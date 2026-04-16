import React, { useEffect, useState } from 'react';
import { X, User, Phone, Calendar as CalendarIcon, Clock, Stethoscope, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MiniOdontogram } from './MiniOdontogram';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

interface QuickPatientSidebarProps {
  patientId: string | null;
  appointmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickPatientSidebar: React.FC<QuickPatientSidebarProps> = ({ patientId, appointmentId, isOpen, onClose }) => {
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      const fetchPatient = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/patients/${patientId}`);
          setPatient(res.data);
        } catch (error) {
          console.error("Error fetching patient for quick sidebar", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatient();
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  // Process data for easy access
  const allAppointments = patient?.appointments?.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
  const now = new Date().getTime();
  
  const pastAppointments = allAppointments.filter((a: any) => new Date(a.date).getTime() < now);
  const futureAppointments = allAppointments.filter((a: any) => new Date(a.date).getTime() >= now && a.id !== appointmentId);
  
  const lastAppointment = pastAppointments.length > 0 ? pastAppointments[pastAppointments.length - 1] : null;
  const nextAppointment = futureAppointments.length > 0 ? futureAppointments[0] : null;
  
  const currentAppointment = allAppointments.find((a: any) => a.id === appointmentId);

  // Get most recent Odontogram state from historical data
  const latestHistory = patient?.clinicalHist && patient.clinicalHist.length > 0 ? patient.clinicalHist[0] : null;
  const odontogramEntries = latestHistory?.odontogramEntries || [];

  return (
    <>
      <div 
        className="fixed inset-0 bg-bg-main/60 backdrop-blur-md z-40 animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-bg-surface border-l border-border-main shadow-2xl z-50 flex flex-col transform transition-transform duration-500 overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 bg-bg-surface/80 backdrop-blur-xl border-b border-border-main px-6 py-5 flex items-center justify-between z-10">
          <h2 className="text-xl font-black text-text-main tracking-tight flex items-center gap-2">
             <User className="w-5 h-5 text-blue-500" />
             Ficha Rápida
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-border-main/30 rounded-full transition-colors text-text-muted hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col gap-8">
          {isLoading ? (
             <div className="flex flex-col items-center py-20 space-y-4">
                 <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                 <p className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted animate-pulse">Cargando contexto...</p>
             </div>
          ) : !patient ? (
             <p className="text-center text-text-muted mt-10 text-sm font-bold opacity-50">Paciente no encontrado</p>
          ) : (
            <>
               {/* 1. Datos Personales Importantes */}
               <div>
                 <h1 className="text-3xl font-black text-text-main leading-tight">{patient.firstName} {patient.lastName}</h1>
                 <div className="flex flex-col gap-2 mt-4">
                   <div className="flex flex-col gap-3">
                     <div className="flex items-center gap-3 text-sm font-bold text-text-muted">
                       <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                         <Phone className="w-4 h-4" />
                       </div>
                       {patient.phone || 'Sin número registrado'}
                     </div>
                     
                     {patient.phone && (
                       <div className="flex gap-2 ml-11">
                         <a href={`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                           <Button variant="ghost" size="sm" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-[10px] px-3 h-7">
                             WhatsApp
                           </Button>
                         </a>
                         <a href={`tel:${patient.phone}`}>
                           <Button variant="ghost" size="sm" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 text-[10px] px-3 h-7">
                             Llamar
                           </Button>
                         </a>
                       </div>
                     )}
                   </div>
                   <div className="flex items-center gap-3 text-sm font-bold text-text-muted mt-1">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                       <User className="w-4 h-4" />
                     </div>
                     DNI: {patient.dni} | {patient.obraSocial || 'Particular'}
                   </div>
                 </div>
               </div>

               {/* 2. Motivo del Turno Actual */}
               {currentAppointment && (
                 <div className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Stethoscope className="w-20 h-20" />
                   </div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-500 mb-2">Turno Seleccionado</h3>
                   <div className="flex items-center gap-2 mb-3">
                      <Badge variant="blue" size="sm">{currentAppointment.service || 'Consulta General'}</Badge>
                      <span className="text-xs font-bold text-text-muted">{currentAppointment.startTime}</span>
                   </div>
                   <p className="text-sm text-text-main font-bold leading-relaxed opacity-90">
                     {currentAppointment.reason || currentAppointment.notes || 'No se especificó un motivo para este turno.'}
                   </p>
                 </div>
               )}

               {/* 3. Contexto Temporal (Anterior / Siguiente) */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-main/30 border border-border-main rounded-[1.5rem] p-4 flex flex-col justify-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5"><CalendarIcon className="w-3 h-3" /> Última Visita</p>
                    <p className="text-sm font-black text-text-main">{lastAppointment ? new Date(lastAppointment.date).toLocaleDateString() : 'Primera Vez'}</p>
                  </div>
                  <div className="bg-bg-main/30 border border-border-main rounded-[1.5rem] p-4 flex flex-col justify-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Próximo Turno</p>
                    <p className="text-sm font-black text-text-main">{nextAppointment ? new Date(nextAppointment.date).toLocaleDateString() : 'Sin agendar'}</p>
                  </div>
               </div>

               {/* 4. Mini Odontograma */}
               <div className="mt-2">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-black text-text-main uppercase tracking-widest">Odontograma Contextual</h3>
                   <Link to={`/pacientes/${patient.id}`}>
                     <Button variant="ghost" size="sm" className="text-[9px] h-6 px-2">Ver Completo <ChevronRight className="w-3 h-3" /></Button>
                   </Link>
                 </div>
                 {odontogramEntries.length > 0 ? (
                   <MiniOdontogram entries={odontogramEntries} />
                 ) : (
                   <div className="p-6 border border-dashed border-border-main rounded-3xl flex items-center justify-center text-xs font-bold text-text-muted opacity-50">
                      Sin registros en el odontograma.
                   </div>
                 )}
               </div>

            </>
          )}
        </div>

        {/* Footer Action */}
        {!isLoading && patient && (
           <div className="p-6 border-t border-border-main sticky bottom-0 bg-bg-surface/80 backdrop-blur-lg">
             <Link to={`/pacientes/${patient.id}`}>
               <Button className="w-full" size="lg">Entrar a Ficha Completa</Button>
             </Link>
           </div>
        )}
      </div>
    </>
  );
};
