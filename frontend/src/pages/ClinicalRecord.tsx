import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Clock, 
  FileText, 
  ChevronRight, 
  Image as ImageIcon, 
  Stethoscope,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import api from '../lib/api';
import Odontogram from '../components/clinical/Odontogram';
import { useRef } from 'react';

// UI Atoms
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../store/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';


interface Evolution {
  id: string;
  date: string;
  description: string;
  professional: { name: string };
  odontogramEntries: any[];
  attachments: any[];
}

interface TreatmentPlan {
  id: string;
  description: string;
  budget: number | null;
  status: string;
  tasks: string; 
  createdAt: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  obraSocial: string | null;
}

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
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<Evolution[]>([]);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
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
  const [newPlan, setNewPlan] = useState({ description: '', budget: '', tasks: [] as { id: string, desc: string, done: boolean }[] });
  const [newTaskDesc, setNewTaskDesc] = useState('');
  
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

  const fetchData = useCallback(async () => {
    try {
      const [pRes, hRes, plansRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/clinical/patient/${id}`),
        api.get(`/clinical/patient/${id}/plans`)
      ]);
      
      setPatient(pRes.data);
      setHistory(hRes.data);
      setPlans(plansRes.data);

      if (hRes.data.length > 0) {
        const latest = hRes.data[0];
        const state: Record<number, string> = {};
        latest.odontogramEntries.forEach((entry: any) => {
          state[entry.toothNumber] = entry.status;
        });
        setCurrentOdontogram(state);
      }
    } catch (error) {
      console.error('Error fetching clinical data:', error);
      showToast('Error al cargar la historia clínica', 'error');
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFaceClick = (number: number, face: any) => { // face is type ToothFace
    const statuses = ['', 'CARIES', 'REPAIR', 'SEALANT', 'EXTRACTION'];
    
    // Parse curr state
    const currStr = currentOdontogram[number] || '{}';
    let state: any = {};
    if (currStr.startsWith('{')) {
      try { state = JSON.parse(currStr); } catch(e) {}
    } else {
      state = { W: currStr };
    }

    const currentStatus = state[face] || '';
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    state[face] = statuses[nextIndex];
    
    if (!state[face]) delete state[face]; // clear empty

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
      fetchData();
      showToast('Evolución médica registrada', 'success');
    } catch (error) {
      showToast('Error al guardar la evolución', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePlanStatus = async (planId: string, currentStatus: string) => {
    const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    
    try {
      await api.put(`/clinical/plans/${planId}`, { status: newStatus });
      fetchData();
      showToast('Estado del plan actualizado', 'success');
    } catch (error) {
      showToast('Error al actualizar plan', 'error');
    }
  };

  const handleCreatePlan = async () => {
    try {
      await api.post('/clinical/plans', {
        patientId: id,
        description: newPlan.description,
        budget: parseFloat(newPlan.budget) || 0,
        tasks: JSON.stringify(newPlan.tasks)
      });
      setIsPlanModalOpen(false);
      setNewPlan({ description: '', budget: '', tasks: [] });
      fetchData();
      showToast('Plan de tratamiento creado', 'success');
    } catch (error) {
      showToast('Error al crear el plan', 'error');
    }
  };

  if (!patient) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-black text-text-muted uppercase tracking-[0.3em]">Cargando Ficha Clínica...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-16">

      {/* Modal: Nuevo Plan de Tratamiento */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Nuevo Plan de Tratamiento"
      >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <Input
              label="Descripción del plan"
              placeholder="Ej: Rehabilitación completa de sector anterior..."
              value={newPlan.description}
              onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              label="Presupuesto estimado (opcional)"
              type="number"
              placeholder="0.00"
              value={newPlan.budget}
              onChange={(e) => setNewPlan(prev => ({ ...prev, budget: e.target.value }))}
            />
            <div className="border border-border-main p-3 rounded-xl bg-bg-main/30">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Lista de Tareas / Procedimientos</label>
              <div className="flex gap-2 mb-3">
                <Input
                  className="flex-1"
                  placeholder="Ej: Extracción pieza 21"
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTaskDesc.trim()) {
                        setNewPlan(p => ({ ...p, tasks: [...p.tasks, { id: crypto.randomUUID(), desc: newTaskDesc, done: false }] }));
                        setNewTaskDesc('');
                      }
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    if (newTaskDesc.trim()) {
                      setNewPlan(p => ({ ...p, tasks: [...p.tasks, { id: crypto.randomUUID(), desc: newTaskDesc, done: false }] }));
                      setNewTaskDesc('');
                    }
                  }}
                  variant="secondary"
                >Agregar</Button>
              </div>
              <ul className="space-y-2">
                {newPlan.tasks.map(t => (
                  <li key={t.id} className="flex justify-between items-center bg-bg-surface p-2 rounded border border-border-main text-sm">
                    <span>{t.desc}</span>
                    <button onClick={() => setNewPlan(p => ({ ...p, tasks: p.tasks.filter(x => x.id !== t.id) }))} className="text-red-500 hover:text-red-400"><X className="w-4 h-4"/></button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
              <Button variant="ghost" onClick={() => setIsPlanModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreatePlan} icon={Save}>Guardar Plan</Button>
            </div>
          </div>
      </Modal>

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

          {/* Odontograma */}
          <Odontogram
            data={currentOdontogram}
            onFaceClick={handleFaceClick}
          />

          <Card variant="inset" className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div className="space-y-1">
                 <h3 className="text-xl font-black text-text-main tracking-tight flex items-center gap-3">
                   <FileText className="w-6 h-6 text-blue-500" />
                   Nueva Evolución Médica
                 </h3>
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-9">Registro de sesión actual</p>
               </div>
               
               {/* Link a tratamiento: */}
               <div className="flex items-center gap-2">
                 <span className="text-[10px] uppercase font-bold text-text-muted">Vincular a:</span>
                 <select 
                   value={selectedPlanId}
                   onChange={e => setSelectedPlanId(e.target.value)}
                   className="bg-bg-main border border-border-main text-xs p-1.5 rounded-lg text-text-main focus:outline-none focus:border-blue-500"
                 >
                   <option value="">(Ningún plan)</option>
                   {plans.filter(p => p.status === 'IN_PROGRESS').map(p => (
                     <option key={p.id} value={p.id}>{p.description.substring(0, 30)}...</option>
                   ))}
                 </select>
               </div>
            </header>

            {/* Nexus Design Presets Section */}
            <div className="space-y-3">
               <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-2">Protocolos de Carga Rápida (Presets):</p>
               <div className="flex flex-wrap gap-2">
                 {CLINICAL_PRESETS.map((p) => (
                   <button
                    key={p.label}
                    onClick={() => handleApplyPreset(p.text)}
                    className="px-4 py-2 border border-border-main/50 rounded-xl bg-bg-surface hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider shadow-sm group"
                   >
                     {p.label}
                   </button>
                 ))}
               </div>
            </div>

            <textarea 
              value={newEvolution}
              onChange={(e) => setNewEvolution(e.target.value)}
              placeholder="Escribe el diagnóstico, procedimientos o notas de la sesión..."
              className="w-full h-52 p-8 bg-bg-main/50 border border-border-main/50 rounded-[2.5rem] text-sm text-text-main focus:border-blue-500/50 focus:bg-bg-surface outline-none transition-all resize-none shadow-inner"
            />

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
                         {evo.attachments.map((att: any) => (
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
                
                const toggleTask = async (taskId: string) => {
                  const newTasks = parsedTasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
                  try {
                    await api.put(`/clinical/plans/${plan.id}`, { tasks: JSON.stringify(newTasks) });
                    fetchData();
                  } catch(e) {}
                };

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
                          <button type="button" onClick={() => handleUpdatePlanStatus(plan.id, plan.status)} className="focus:outline-none rounded-full hover:scale-105 transition-transform">
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
                                  onChange={() => toggleTask(t.id)} 
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
                  {history.flatMap(evo => evo.attachments || []).map((att: any) => (
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
        </div>
      </div>
    </div>
  );
}
