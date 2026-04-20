import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Eraser
} from 'lucide-react';
import api from '../lib/api';
import Odontogram from '../components/clinical/Odontogram';
import CreatePlanModal from '../components/clinical/CreatePlanModal';
import ClinicalTimeline from '../components/clinical/ClinicalTimeline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// UI Atoms
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../store/ToastContext';

import { Patient, Evolution, TreatmentPlan, OdontogramEntry } from '../types/clinical';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';




const CLINICAL_PRESETS = [
  { label: 'Limpieza', text: 'Se realiza detartraje supra y subgingival con ultrasonido. Pulido coronario con pasta abrasiva.' },
  { label: 'Restauración', text: 'Se realiza apertura de cavidad, eliminación de tejido cariado y restauración con resina compuesta fotopolimerizable.' },
  { label: 'Exodoncia', text: 'Bajo anestesia local, se realiza la extracción de la pieza dental indicada. Hemostasia lograda. Indicaciones post-quirúrgicas.' },
  { label: 'Urgencia', text: 'Atención por dolor agudo. Apertura cameral, toilette y medicación intraconducto pautada.' },
];

export default function ClinicalRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'evoluciones' | 'planes' | 'galeria'>('evoluciones');
  
  const [currentOdontogram, setCurrentOdontogram] = useState<Record<number, string>>({});
  const [newEvolution, setNewEvolution] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{url: string, type: string}[]>([]);
  
  const [fileInputRef, setFileInputRef] = useState<any>(null);
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setFileInputRef(internalFileInputRef); }, []);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  const handleApplyPreset = (text: string) => {
    setNewEvolution(prev => prev ? `${prev}\n\n${text}` : text);
    showToast('Plantilla aplicada', 'info');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedFiles(prev => [...prev, { url: res.data.url, type: 'PHOTO' }]);
      showToast('Imagen subida correctamente', 'success');
    } catch (error) {
      showToast('Error al subir la imagen', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 1. Fetching con React Query
  const { data: patient, isLoading: isPatientLoading } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await api.get(`/patients/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const { data: plans = [] } = useQuery<TreatmentPlan[]>({
    queryKey: ['clinical', id, 'plans'],
    queryFn: async () => {
      const res = await api.get(`/clinical/patient/${id}/plans`);
      return res.data;
    },
    enabled: !!id
  });

  const { data: history = [] } = useQuery<Evolution[]>({
    queryKey: ['clinical', id, 'history'],
    queryFn: async () => {
      const res = await api.get(`/clinical/patient/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  // Re-sync odontogram state whenever history updates
  useEffect(() => {
    if (history.length > 0) {
      const latest = history[0];
      const state: Record<number, string> = {};
      latest.odontogramEntries?.forEach((entry: OdontogramEntry) => {
        state[entry.toothNumber] = entry.status;
      });
      setCurrentOdontogram(state);
    }
  }, [history]);

  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleFaceClick = (number: number, face: any) => { 
    if (!activeTool) {
      showToast('Selecciona una herramienta clínica (arriba del odontograma) antes de interactuar.', 'info');
      return;
    }
    
    const currStr = currentOdontogram[number] || '{}';
    let state: any = {};
    if (currStr.startsWith('{')) {
      try { state = JSON.parse(currStr); } catch(e) {}
    } else {
      if (currStr) state = { W: currStr };
    }

    if (activeTool === 'ERASE') {
       if (face === 'W') {
         state = {}; // Borrar todo el diente
       } else {
         delete state[face]; // Borrar solo la cara
       }
    } else if (activeTool === 'EXTRACTION' || activeTool === 'CROWN') {
       if (state.W === activeTool) {
         delete state.W; // Toggle off
       } else {
         state = { W: activeTool }; // Aplica a todo el diente, borra lo demás
       }
    } else {
       const targetFace = face === 'W' ? 'C' : face; // Si clica el botón Opción teniendo "Caries", aplica al Centro 
       if (state[targetFace] === activeTool) {
         delete state[targetFace];
       } else {
         state[targetFace] = activeTool;
       }
    }

    setCurrentOdontogram({
      ...currentOdontogram,
      [number]: Object.keys(state).length > 0 ? JSON.stringify(state) : ''
    });
  };

  const handleSaveEvolution = async () => {
    if (!newEvolution.trim() && uploadedFiles.length === 0) {
      return showToast('Por favor, escribe una descripción o sube una imagen.', 'warning');
    }
    
    setIsSaving(true);
    try {
      const odontogramData = Object.entries(currentOdontogram).map(([num, status]) => ({
        toothNumber: parseInt(num),
        status
      }));

      await api.post('/clinical', {
        patientId: id,
        description: newEvolution,
        odontogram: odontogramData.filter(o => o.status !== ''), // clean empty statuses
        attachments: uploadedFiles,
        treatmentPlanId: selectedPlanId || undefined
      });

      setNewEvolution('');
      setUploadedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['clinical', id] });
      showToast('Evolución médica registrada', 'success');
    } catch (error) {
      showToast('Error al guardar la evolución', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePlanStatusMutation = useMutation({
    mutationFn: async ({ planId, newStatus }: { planId: string, newStatus: string }) => {
      return api.put(`/clinical/plans/${planId}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical', id, 'plans'] });
      showToast('Estado del plan actualizado', 'success');
    },
    onError: () => {
      showToast('Error al actualizar plan', 'error');
    }
  });

  const handleUpdatePlanStatus = (planId: string, currentStatus: string) => {
    const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    
    updatePlanStatusMutation.mutate({ planId, newStatus });
  };

  const updatePlanTaskMutation = useMutation({
    mutationFn: async ({ planId, newTasks }: { planId: string, newTasks: any[] }) => {
      return api.put(`/clinical/plans/${planId}`, { tasks: JSON.stringify(newTasks) });
    },
    onSuccess: () => {
      // Invalidate to refresh tasks
      queryClient.invalidateQueries({ queryKey: ['clinical', id, 'plans'] });
    },
    onError: () => {
      showToast('Error al actualizar tarea', 'error');
    }
  });

  const handlePlanTaskToggle = (planId: string, taskId: string, allTasksJSON: string) => {
    let parsedTasks: any[] = [];
    try { parsedTasks = JSON.parse(allTasksJSON || "[]"); } catch {}
    
    const newTasks = parsedTasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    updatePlanTaskMutation.mutate({ planId, newTasks });
  };

  if (isPatientLoading || !patient) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-black text-text-muted uppercase tracking-[0.3em]">Cargando Ficha Clínica...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-16">

      {/* Modal: Nuevo Plan de Tratamiento */}
      {id && (
        <CreatePlanModal 
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          patientId={id}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clinical', id, 'plans'] })}
        />
      )}

      {/* Header del Paciente */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/pacientes')}
            className="p-2.5 rounded-xl bg-bg-surface border border-border-main text-text-muted hover:text-text-main hover:border-blue-500/40 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 rounded-2xl flex items-center justify-center text-lg font-black text-blue-500">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black text-text-main tracking-tight">
              {patient.lastName}, {patient.firstName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="blue" size="xs">DNI {patient.dni}</Badge>
              {patient.obraSocial && <Badge variant="slate" size="xs">{patient.obraSocial}</Badge>}
              
              {/* Analytics: Días desde la última visita */}
              {history.length > 0 && (
                 <Badge variant="orange" size="xs" className="opacity-80">
                   Última visita: {Math.floor((Date.now() - new Date(history[0].date).getTime()) / (1000 * 60 * 60 * 24))} días
                 </Badge>
              )}
            </div>
          </div>
        </div>
        <Button icon={Plus} onClick={() => setIsPlanModalOpen(true)} variant="secondary" size="sm">
          Nuevo Plan
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">

          {/* Tabs de navegación */}
          <div className="flex items-center gap-1 bg-bg-main p-1 rounded-xl border border-border-main/50 w-fit">
            {(['evoluciones', 'planes', 'galeria'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-bg-surface text-text-main shadow-sm border border-border-main'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab === 'evoluciones' ? 'Evoluciones' : tab === 'planes' ? 'Planes' : 'Galería'}
              </button>
            ))}
          </div>

          {/* Toolbar de Herramientas del Odontograma */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-bg-surface/80 backdrop-blur-xl rounded-[1.5rem] border border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] w-full">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mr-3 ml-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Instrumento:
            </span>
            
            <button 
              onClick={() => setActiveTool(activeTool === 'CARIES' ? null : 'CARIES')}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all duration-300 ${
                activeTool === 'CARIES' ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] scale-105' : 'bg-transparent border-border-main/50 text-text-muted hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
              }`}
            >
              Caries
            </button>
            <button 
              onClick={() => setActiveTool(activeTool === 'REPAIR' ? null : 'REPAIR')}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all duration-300 ${
                activeTool === 'REPAIR' ? 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-105' : 'bg-transparent border-border-main/50 text-text-muted hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30'
              }`}
            >
              Restauración
            </button>
            <button 
              onClick={() => setActiveTool(activeTool === 'SEALANT' ? null : 'SEALANT')}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all duration-300 ${
                activeTool === 'SEALANT' ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.4)] scale-105' : 'bg-transparent border-border-main/50 text-text-muted hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30'
              }`}
              type="button"
            >
              Sellador
            </button>
            
            <div className="w-px h-6 bg-border-main mx-2" />

            <button 
              onClick={() => setActiveTool(activeTool === 'EXTRACTION' ? null : 'EXTRACTION')}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all duration-300 ${
                activeTool === 'EXTRACTION' ? 'bg-slate-500 text-white border-slate-500 shadow-[0_4px_15px_rgba(100,116,139,0.4)] scale-105' : 'bg-transparent border-border-main/50 text-text-muted hover:bg-slate-500/10 hover:text-slate-500 hover:border-slate-500/30'
              }`}
            >
              Extracción
            </button>
            <button 
              onClick={() => setActiveTool(activeTool === 'CROWN' ? null : 'CROWN')}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all duration-300 ${
                activeTool === 'CROWN' ? 'bg-amber-500 text-white border-amber-500 shadow-[0_4px_15px_rgba(245,158,11,0.4)] scale-105' : 'bg-transparent border-border-main/50 text-text-muted hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30'
              }`}
            >
              Corona
            </button>
            
            <div className="w-px h-6 bg-border-main mx-2 flex-1" />

            <button 
              onClick={() => setActiveTool(activeTool === 'ERASE' ? null : 'ERASE')}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                activeTool === 'ERASE' ? 'bg-text-main text-bg-main border-text-main shadow-[0_4px_15px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.2)] scale-105' : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/10 hover:text-text-main hover:border-text-main/30'
              }`}
            >
              <Eraser className="w-4 h-4" /> Borrador
            </button>
          </div>

          {/* Odontograma */}
          <Odontogram
            data={currentOdontogram}
            onFaceClick={handleFaceClick}
          />

          <Card padding="none" className="p-6 md:p-8 space-y-8 bg-bg-surface border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem]">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div className="space-y-1">
                 <h3 className="text-2xl font-black text-text-main tracking-tighter flex items-center gap-3">
                   <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                     <FileText className="w-6 h-6" />
                   </div>
                   Nueva Evolución
                 </h3>
                 <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-[3.25rem]">Registro Clínico Oficial</p>
               </div>
               
               {/* Link a tratamiento: */}
               <div className="flex items-center gap-3 bg-bg-main px-4 py-2 rounded-xl border border-border-main">
                 <span className="text-[9px] uppercase font-black text-text-muted tracking-widest">Asignar a Plan:</span>
                 <select 
                   value={selectedPlanId}
                   onChange={e => setSelectedPlanId(e.target.value)}
                   className="bg-transparent border-none text-xs font-bold p-0 pr-4 text-text-main focus:outline-none focus:ring-0 cursor-pointer"
                 >
                   <option value="">(Registro suelto)</option>
                   {plans.filter(p => p.status === 'IN_PROGRESS').map(p => (
                     <option key={p.id} value={p.id}>{p.description.substring(0, 30)}...</option>
                   ))}
                 </select>
               </div>
            </header>

            {/* Nexus Design Presets Section */}
            <div className="space-y-4">
               <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                 <span className="w-4 h-[1px] bg-border-main" /> Textos predefinidos
               </p>
               <div className="flex flex-wrap gap-2">
                 {CLINICAL_PRESETS.map((p) => (
                   <button
                    key={p.label}
                    onClick={() => handleApplyPreset(p.text)}
                    className="px-5 py-2.5 bg-bg-main border border-border-main/50 hover:border-blue-500/50 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-wider shadow-sm hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 active:translate-y-0 duration-200"
                   >
                     + {p.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <textarea 
                value={newEvolution}
                onChange={(e) => setNewEvolution(e.target.value)}
                placeholder="Escribe el diagnóstico detallado, observaciones y/o el procedimiento realizado en esta sesión..."
                className="relative w-full h-56 p-8 bg-bg-surface border border-border-main/80 rounded-[1.8rem] text-sm text-text-main focus:border-blue-500 focus:bg-bg-main outline-none transition-all resize-none shadow-inner leading-relaxed"
              />
            </div>

            {/* Uploaded Files Previews */}
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-4 px-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden border border-border-main shadow-lg">
                    <img 
                      src={`${API_BASE}${file.url}`} 
                      alt="preview" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center">
               <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={isUploading ? Clock : ImageIcon} 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Subiendo...' : 'Anexar Placa'}
                  </Button>
               </div>
               <Button 
                onClick={handleSaveEvolution} 
                isLoading={isSaving}
                icon={Save}
                size="lg"
                className="px-10"
               >
                Registrar Atención
               </Button>
            </div>
          </Card>
        </div>

        {/* Lado Derecho: Timeline Unificado (1/4) */}
        <div className="space-y-8">
           <header className="px-2">
              <h3 className="text-xl font-black text-text-main tracking-tight">Línea de Tiempo</h3>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1 opacity-60">seguimiento clínico</p>
           </header>

           <ClinicalTimeline 
             activeTab={activeTab}
             history={history}
             plans={plans}
             onPlanStatusUpdate={handleUpdatePlanStatus}
             onPlanTaskToggle={handlePlanTaskToggle}
           />
        </div>
      </div>
    </div>
  );
}
