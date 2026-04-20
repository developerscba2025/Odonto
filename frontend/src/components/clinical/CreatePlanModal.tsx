import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../store/ToastContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
}

export default function CreatePlanModal({ isOpen, onClose, patientId, onSuccess }: CreatePlanModalProps) {
  const { showToast } = useToast();
  const [newPlan, setNewPlan] = useState({ description: '', budget: '', tasks: [] as { id: string, desc: string, done: boolean }[] });
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreatePlan = async () => {
    if (!newPlan.description.trim()) {
      showToast('La descripción del plan es obligatoria', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/clinical/plans', {
        patientId,
        description: newPlan.description,
        budget: parseFloat(newPlan.budget) || 0,
        tasks: JSON.stringify(newPlan.tasks)
      });
      setNewPlan({ description: '', budget: '', tasks: [] });
      showToast('Plan de tratamiento creado', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating plan', error);
      showToast(error.response?.data?.error || 'Error al crear el plan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTask = () => {
    if (newTaskDesc.trim()) {
      setNewPlan(p => ({ ...p, tasks: [...p.tasks, { id: crypto.randomUUID(), desc: newTaskDesc, done: false }] }));
      setNewTaskDesc('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
                  handleAddTask();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddTask}
              variant="secondary"
            >
              Agregar
            </Button>
          </div>
          <ul className="space-y-2">
            {newPlan.tasks.map(t => (
              <li key={t.id} className="flex justify-between items-center bg-bg-surface p-2 rounded border border-border-main text-sm">
                <span>{t.desc}</span>
                <button type="button" onClick={() => setNewPlan(p => ({ ...p, tasks: p.tasks.filter(x => x.id !== t.id) }))} className="text-red-500 hover:text-red-400">
                  <X className="w-4 h-4"/>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleCreatePlan} icon={Save} isLoading={isSaving}>Guardar Plan</Button>
        </div>
      </div>
    </Modal>
  );
}
