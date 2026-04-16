import React, { useState, useEffect } from 'react';
import { Search, User, Clock, Stethoscope, Check, X, Users, AlertCircle, Plus, UserPlus } from 'lucide-react';
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
    appointmentId?: string;
    patient?: Patient;
    date: string;
    startTime: string;
    endTime: string;
    professionalId?: string;
    service?: string;
    notes?: string;
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
  
  // Mode: 'search' | 'create-quick'
  const [mode, setMode] = useState<'search' | 'create-quick'>('search');
  const [quickPatientForm, setQuickPatientForm] = useState({ firstName: '', lastName: '', dni: '', phone: '' });
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  const [formData, setFormData] = useState({
    professionalId: '',
    serviceId: 'consulta',
    notes: SERVICE_PRESETS[0].note,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '09:30',
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ 
        ...prev, 
        ...initialData,
        serviceId: SERVICE_PRESETS.find(p => p.label === initialData.service)?.id || 'consulta'
      }));
      if (initialData.patient && !selectedPatient) {
        setSelectedPatient(initialData.patient);
      }
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
        setPatients(res.data.data || res.data);
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

  // Create patient on the fly and then select it
  const handleCreateQuickPatient = async () => {
    if (!quickPatientForm.firstName || !quickPatientForm.lastName) {
      return showToast('Ingresá nombre y apellido', 'warning');
    }
    if (!quickPatientForm.dni) {
      return showToast('El DNI es requerido para registrar el turno', 'warning');
    }
    setIsCreatingPatient(true);
    try {
      const res = await api.post('/patients', {
        firstName: quickPatientForm.firstName,
        lastName: quickPatientForm.lastName,
        dni: quickPatientForm.dni,
        phone: quickPatientForm.phone || null,
      });
      setSelectedPatient(res.data);
      setMode('search');
      showToast(`Paciente ${res.data.firstName} registrado y seleccionado`, 'success');
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Error al registrar el paciente';
      showToast(msg, 'error');
    } finally {
      setIsCreatingPatient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return showToast('Debes seleccionar un paciente', 'warning');
    if (!formData.professionalId) return showToast('Debes seleccionar un profesional', 'warning');

    setIsSubmitting(true);
    try {
      if (!formData.date || !formData.startTime || !formData.endTime) {
        setIsSubmitting(false);
        return showToast('Debes completar fecha y horario', 'warning');
      }

      const selectedPreset = SERVICE_PRESETS.find(p => p.id === formData.serviceId);
      const payload = {
        patientId: selectedPatient.id,
        professionalId: formData.professionalId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: 'PENDING',
        service: selectedPreset?.label || 'Consulta',
        notes: formData.notes
      };

      if (initialData?.appointmentId) {
        await api.put(`/appointments/${initialData.appointmentId}`, payload);
        showToast('Turno actualizado correctamente', 'success');
      } else {
        await api.post('/appointments', payload);
        showToast('Turno agendado correctamente', 'success');
      }
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
    setMode('search');
    setQuickPatientForm({ firstName: '', lastName: '', dni: '', phone: '' });
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
      title={initialData?.appointmentId ? "Editar Turno" : "Agendar Nuevo Turno"} 
      subtitle={`${formData.date || 'Sin fecha'} | ${formData.startTime || '--:--'} - ${formData.endTime || '--:--'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Time Selection */}
        <div className="space-y-3 p-4 bg-bg-main/20 border border-border-main rounded-2xl">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Fecha y Horario</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              type="date"
              label="Día"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              type="time"
              label="Desde"
              value={formData.startTime}
              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              type="time"
              label="Hasta"
              value={formData.endTime}
              onChange={e => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>
        </div>

        {/* Patient Search / Quick Create */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Paciente</label>
            {!selectedPatient && (
              <button
                type="button"
                onClick={() => setMode(mode === 'search' ? 'create-quick' : 'search')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  mode === 'create-quick' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20'
                }`}
              >
                {mode === 'create-quick' 
                  ? <><Search className="w-2.5 h-2.5" /> Buscar Existente</>
                  : <><UserPlus className="w-2.5 h-2.5" /> Nuevo Paciente</>
                }
              </button>
            )}
          </div>

          {selectedPatient ? (
            // Selected patient pill
            <div className="flex items-center justify-between p-4 bg-bg-main/30 border border-border-main rounded-2xl">
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
          ) : mode === 'search' ? (
            // Search existing patient
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
                      onClick={() => { setSelectedPatient(p); setSearchTerm(''); setPatients([]); }}
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
              {searchTerm.length >= 2 && patients.length === 0 && (
                <p className="text-[10px] text-text-muted mt-2 ml-1 opacity-60">
                  Sin resultados · <button type="button" onClick={() => setMode('create-quick')} className="text-blue-500 underline font-black">Registrar nuevo paciente</button>
                </p>
              )}
            </div>
          ) : (
            // Quick create form
            <div className="space-y-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-3 h-3" /> Datos Básicos del Nuevo Paciente
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Nombre *"
                  value={quickPatientForm.firstName}
                  onChange={e => setQuickPatientForm(p => ({ ...p, firstName: e.target.value }))}
                />
                <Input
                  placeholder="Apellido *"
                  value={quickPatientForm.lastName}
                  onChange={e => setQuickPatientForm(p => ({ ...p, lastName: e.target.value }))}
                />
                <Input
                  placeholder="DNI *"
                  value={quickPatientForm.dni}
                  onChange={e => setQuickPatientForm(p => ({ ...p, dni: e.target.value }))}
                />
                <Input
                  placeholder="Teléfono (WhatsApp)"
                  value={quickPatientForm.phone}
                  onChange={e => setQuickPatientForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={UserPlus}
                isLoading={isCreatingPatient}
                onClick={handleCreateQuickPatient}
                className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
              >
                Registrar y Seleccionar
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4 bg-bg-main/20 border border-border-main rounded-2xl">
           <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Especialista</label>
           {professionals.length === 0 ? (
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
               <p className="text-xs font-bold text-red-500">No hay especialistas disponibles.</p>
               <p className="text-[10px] text-red-500/70 mt-1">Ve a Ajustes ➝ Equipo para agregar un Odontólogo.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 gap-3">
               {professionals.map(prof => (
                 <button
                  key={prof.id}
                  type="button"
                  onClick={() => setFormData({...formData, professionalId: prof.id})}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.professionalId === prof.id ? 'border-blue-600 bg-blue-600/10' : 'border-border-main hover:bg-bg-main/20'}`}
                 >
                   <div className="w-5 h-5 rounded-lg flex-shrink-0" style={{ backgroundColor: prof.color || '#3b82f6' }} />
                   <span className="text-[10px] font-black uppercase tracking-tight text-text-main">{prof.name}</span>
                 </button>
               ))}
             </div>
           )}
        </div>

        <div className="space-y-3 p-4 bg-bg-main/20 border border-border-main rounded-2xl">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Servicio (Sugerencias)</label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border-2 transition-all ${formData.serviceId === preset.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-bg-main/30 border-border-main text-text-muted hover:border-blue-500 hover:text-text-main'}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Indicaciones / Notas</label>
          <textarea 
            className="w-full mt-2 p-4 bg-bg-main/30 border-2 border-border-main rounded-2xl text-xs text-text-main focus:border-blue-500/50 outline-none transition-all min-h-[80px] shadow-inner"
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
