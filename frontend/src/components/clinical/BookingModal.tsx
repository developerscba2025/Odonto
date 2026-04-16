import React, { useState, useEffect } from 'react';
import { Search, User, Clock, Stethoscope, Check, X, Users, AlertCircle, Plus } from 'lucide-react';
import api from '../../lib/api';

// UI Atoms
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../store/ToastContext';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
}

interface Professional {
  id: string;
  name: string;
  color: string | null;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    date: string;
    startTime: string;
    endTime: string;
    professionalId?: string;
  };
}

const SERVICE_PRESETS = [
  { id: 'consulta', label: 'Consulta Inicial', note: 'Evaluación integral, diagnóstico y plan de tratamiento.' },
  { id: 'limpieza', label: 'Limpieza / Profilaxis', note: 'Remoción de placa y sarro, pulido dental.' },
  { id: 'resina', label: 'Resina (Arreglo)', note: 'Restauración estética de pieza con caries.' },
  { id: 'extraccion', label: 'Extracción / Exodoncia', note: 'Extracción de pieza dentaria indicada.' },
  { id: 'urgencia', label: 'Urgencia', note: 'Atención por dolor agudo o traumatismo.' },
  { id: 'personalizado', label: 'Otro / Personalizado', note: '' },
];

export const BookingModal = ({ isOpen, onClose, onSuccess, initialData }: BookingModalProps) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    professionalId: '',
    serviceId: 'consulta',
    notes: SERVICE_PRESETS[0].note,
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const res = await api.get('/auth/professionals');
        setProfessionals(res.data);
        if (res.data.length > 0 && !formData.professionalId) {
          setFormData(prev => ({ ...prev, professionalId: res.data[0].id }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfessionals();
  }, [formData.professionalId]);

  useEffect(() => {
    const searchPatients = async () => {
      if (searchTerm.length < 2) {
        setPatients([]);
        return;
      }
      try {
        const res = await api.get(`/patients?search=${searchTerm}`);
        setPatients(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    const timer = setTimeout(searchPatients, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectPreset = (preset: typeof SERVICE_PRESETS[0]) => {
    setFormData({
      ...formData,
      serviceId: preset.id,
      notes: preset.note
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return showToast('Debes seleccionar un paciente', 'warning');
    if (!formData.professionalId) return showToast('Debes seleccionar un profesional', 'warning');

    setIsSubmitting(true);
    try {
      const selectedPreset = SERVICE_PRESETS.find(p => p.id === formData.serviceId);
      await api.post('/appointments', {
        patientId: selectedPatient.id,
        professionalId: formData.professionalId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: 'PENDING',
        service: selectedPreset?.label || 'Consulta',
        notes: formData.notes
      });
      showToast('Turno agendado correctamente', 'success');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      showToast('Error al agendar el turno', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedPatient(null);
    setFormData({
      professionalId: professionals[0]?.id || '',
      serviceId: 'consulta',
      notes: SERVICE_PRESETS[0].note,
      date: initialData?.date || '',
      startTime: initialData?.startTime || '',
      endTime: initialData?.endTime || ''
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Agendar Nuevo Turno" 
      subtitle={`${formData.date} | ${formData.startTime} - ${formData.endTime}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Search */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Paciente</label>
          {!selectedPatient ? (
            <div className="relative">
              <Input 
                placeholder="Buscar por DNI o Apellido..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                icon={Search}
              />
              {patients.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-bg-surface border border-border-main rounded-2xl shadow-2xl z-[100] max-h-48 overflow-y-auto overflow-x-hidden p-2 space-y-1">
                  {patients.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPatient(p)}
                      className="w-full text-left p-3 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex justify-between items-center group"
                    >
                      <div className="flex flex-col">
                         <span className="font-black text-sm">{p.lastName}, {p.firstName}</span>
                         <span className="text-[10px] opacity-60">DNI: {p.dni}</span>
                      </div>
                      <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-blue-600/5 border border-blue-600/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-text-main text-sm">{selectedPatient.lastName}, {selectedPatient.firstName}</p>
                  <p className="text-[10px] font-bold text-text-muted">DNI {selectedPatient.dni}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedPatient(null)}
                className="p-2 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Professional Selection */}
        <div className="space-y-2">
           <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Especialista</label>
           <div className="grid grid-cols-2 gap-3">
             {professionals.map(prof => (
               <button
                key={prof.id}
                type="button"
                onClick={() => setFormData({...formData, professionalId: prof.id})}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${formData.professionalId === prof.id ? 'border-blue-600 bg-blue-600/5' : 'border-border-main'}`}
               >
                 <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: prof.color || '#3b82f6' }} />
                 <span className="text-xs font-black text-text-main">{prof.name}</span>
               </button>
             ))}
           </div>
        </div>

        {/* Service Presets */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Servicio (Presets Nexus)</label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${formData.serviceId === preset.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'border-border-main text-text-muted hover:border-blue-500'}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes / Plan detail */}
        <div>
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Indicaciones / Notas</label>
          <textarea 
            className="w-full mt-2 p-4 bg-bg-main/50 border border-border-main rounded-2xl text-xs text-text-main focus:border-blue-500/50 outline-none transition-all min-h-[80px]"
            placeholder="Especificaciones del turno..."
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1" icon={Check}>Confirmar Turno</Button>
        </div>
      </form>
    </Modal>
  );
};
