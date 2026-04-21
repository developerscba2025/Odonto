import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import Odontogram from '../components/clinical/Odontogram';
import CreatePlanModal from '../components/clinical/CreatePlanModal';
import ClinicalTimeline from '../components/clinical/ClinicalTimeline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../store/ToastContext';

// Import newly created modules
import { ClinicalHeader } from '../components/clinical/ClinicalHeader';
import { OdontogramToolbar } from '../components/clinical/OdontogramToolbar';
import { EvolutionForm } from '../components/clinical/EvolutionForm';

import { Patient, Evolution, TreatmentPlan, OdontogramEntry } from '../types/clinical';

export default function ClinicalRecord() {
  const { id } = useParams();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'evoluciones' | 'planes' | 'galeria'>('evoluciones');
  
  const [currentOdontogram, setCurrentOdontogram] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');


  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<'RED' | 'BLUE'>('RED');

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

  const handleFaceClick = (number: number, face: string) => { 
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
    } else {
       const isWholeTooth = ['EXTRACTION', 'CROWN', 'TC', 'EQUAL', 'BRIDGE_TOP', 'BRIDGE_BOTTOM'].includes(activeTool);
       const toolWithColor = `${activeTool}_${activeColor}`;
       
       if (isWholeTooth) {
         if (state.W === toolWithColor) {
           delete state.W; // Toggle off
         } else {
           state = { W: toolWithColor }; // Aplica a todo el diente, borra lo demás
         }
       } else if (activeTool === 'PAINT') {
         const targetFace = face === 'W' ? 'C' : face;
         if (state[targetFace] === toolWithColor) {
           delete state[targetFace];
         } else {
           state[targetFace] = toolWithColor;
         }
       }
    }

    setCurrentOdontogram({
      ...currentOdontogram,
      [number]: Object.keys(state).length > 0 ? JSON.stringify(state) : ''
    });
  };

  const handleSaveEvolution = async (description: string, attachments: any[]) => {
    setIsSaving(true);
    try {
      const odontogramData = Object.entries(currentOdontogram).map(([num, status]) => ({
        toothNumber: parseInt(num),
        status
      }));

      await api.post('/clinical', {
        patientId: id,
        description,
        odontogram: odontogramData.filter(o => o.status !== ''), // clean empty statuses
        attachments,
        treatmentPlanId: selectedPlanId || undefined
      });


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
      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Cargando Ficha Clínica...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-16">


      {id && (
        <CreatePlanModal 
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          patientId={id}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clinical', id, 'plans'] })}
        />
      )}

      {/* Header del Paciente (Module) */}
      <ClinicalHeader 
        patient={patient} 
        history={history} 
        onNewPlan={() => setIsPlanModalOpen(true)} 
      />

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

          {/* Toolbar de Herramientas del Odontograma (Module) */}
          <OdontogramToolbar 
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
          />

          {/* Odontograma (Existing Module) */}
          <Odontogram
            data={currentOdontogram}
            onFaceClick={handleFaceClick}
          />

          {/* Evolution Form (Module) */}
          <EvolutionForm 
            plans={plans}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            onSave={handleSaveEvolution}
            isSaving={isSaving}
          />
        </div>

        {/* Lado Derecho: Timeline Unificado */}
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
