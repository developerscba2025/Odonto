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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ description: '', budget: '' });

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

  const handleToothClick = (number: number) => {
    const statuses = ['HEALTHY', 'CARIES', 'REPAIR', 'EXTRACTION'];
    const currentStatus = currentOdontogram[number] || 'HEALTHY';
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    
    setCurrentOdontogram({
      ...currentOdontogram,
      [number]: statuses[nextIndex]
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
        odontogram: odontogramData,
        attachments: uploadedFiles
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

  const handleCreatePlan = async () => {
    try {
      await api.post('/clinical/plans', {
        patientId: id,
        description: newPlan.description,
        budget: parseFloat(newPlan.budget) || 0
      });
      setIsPlanModalOpen(false);
      setNewPlan({ description: '', budget: '' });
      fetchData();
      showToast('Plan de tratamiento creado', 'success');
    } catch (error) {
      showToast('Error al crear el plan', 'error');
    }
  };

  if (!patient) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-black text-text-muted uppercase tracking-[0.3em]">Cargando Nexus Clínica...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* ... (Modals and Header remain same) */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          {/* ... (Tabs and Odontogram remain same) */}

          <Card variant="inset" className="space-y-6">
            <header className="flex justify-between items-center">
               <div className="space-y-1">
                 <h3 className="text-xl font-black text-text-main tracking-tight flex items-center gap-3">
                   <FileText className="w-6 h-6 text-blue-500" />
                   Nueva Evolución Médica
                 </h3>
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60 ml-9">Registro de sesión actual</p>
               </div>
               <Badge variant="blue" size="xs">Sesión Activa</Badge>
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
                      src={`http://localhost:4000${file.url}`} 
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
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1 opacity-60">nexus stream</p>
           </header>

           <div className="space-y-6 relative ml-4 border-l-2 border-border-main/30 pl-8 pb-10">
              {activeTab === 'evoluciones' && history.map((evo) => (
                <div key={evo.id} className="relative group">
                  <div className="absolute -left-[45px] top-4 w-8 h-8 rounded-xl bg-bg-surface border border-border-main flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-xl">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <Card padding="sm" className="hover:border-blue-500/30 transition-all duration-300">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                      {new Date(evo.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="font-black text-text-main text-sm">{evo.professional.name}</p>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed opacity-80 line-clamp-4">{evo.description}</p>
                    {evo.attachments?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                         {evo.attachments.map((att: any) => (
                           <div key={att.id} className="relative group w-16 h-16 rounded-xl overflow-hidden cursor-pointer border border-border-main/50 hover:border-blue-500/50 transition-all">
                              <img 
                                src={`http://localhost:4000${att.url}`} 
                                alt="attachment" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                onClick={() => window.open(`http://localhost:4000${att.url}`, '_blank')}
                              />
                           </div>
                         ))}
                      </div>
                    )}
                  </Card>
                </div>
              ))}

              {activeTab === 'planes' && plans.map((plan) => (
                <div key={plan.id} className="relative group">
                  <div className="absolute -left-[45px] top-4 w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <Card padding="sm" className="hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="orange" size="xs">{plan.status}</Badge>
                      <span className="text-[10px] font-bold text-text-muted">{new Date(plan.createdAt).getFullYear()}</span>
                    </div>
                    <p className="font-black text-text-main text-sm">{plan.description}</p>
                    {plan.budget && (
                      <p className="text-xs font-black text-emerald-500 mt-2">$ {plan.budget.toLocaleString()}</p>
                    )}
                  </Card>
                </div>
              ))}

              {activeTab === 'galeria' && (
                <div className="grid grid-cols-2 gap-4">
                  {history.flatMap(evo => evo.attachments || []).map((att: any) => (
                    <Card key={att.id} padding="none" className="aspect-square relative group overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all">
                       <img 
                        src={`http://localhost:4000${att.url}`} 
                        alt="Gallery" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onClick={() => window.open(`http://localhost:4000${att.url}`, '_blank')}
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
