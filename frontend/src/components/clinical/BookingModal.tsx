import React, { useState, useEffect } from 'react';
import { Search, User, Check, X, Plus, UserPlus } from 'lucide-react';
import api from '../../lib/api';

import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
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
  { id: 'consulta',    label: 'Consulta Inicial',       note: 'Evaluación integral, diagnóstico y plan de tratamiento.' },
  { id: 'limpieza',   label: 'Limpieza / Profilaxis',   note: 'Remoción de placa y sarro, pulido dental.' },
  { id: 'resina',     label: 'Resina (Arreglo)',         note: 'Restauración estética de pieza con caries.' },
  { id: 'extraccion', label: 'Extracción / Exodoncia',  note: 'Extracción de pieza dentaria indicada.' },
  { id: 'urgencia',   label: 'Urgencia',                 note: 'Atención por dolor agudo o traumatismo.' },
  { id: 'personalizado', label: 'Otro / Personalizado', note: '' },
];

export const BookingModal = ({ isOpen, onClose, onSuccess, initialData }: BookingModalProps) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        serviceId: SERVICE_PRESETS.find(p => p.label === initialData.service)?.id || 'consulta',
      }));
      if (initialData.patient && !selectedPatient) setSelectedPatient(initialData.patient);
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
      } catch (e) { console.error(e); }
    };
    fetchProfessionals();
  }, [formData.professionalId]);

  useEffect(() => {
    const searchPatients = async () => {
      if (searchTerm.length < 2) { setPatients([]); return; }
      try {
        const res = await api.get(`/patients?search=${searchTerm}`);
        setPatients(res.data.data || res.data);
      } catch (e) { console.error(e); }
    };
    const timer = setTimeout(searchPatients, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectPreset = (preset: typeof SERVICE_PRESETS[0]) => {
    setFormData({ ...formData, serviceId: preset.id, notes: preset.note });
  };

  const handleCreateQuickPatient = async () => {
    if (!quickPatientForm.firstName || !quickPatientForm.lastName)
      return showToast('Ingresá nombre y apellido', 'warning');
    if (!quickPatientForm.dni)
      return showToast('El DNI es requerido para registrar el turno', 'warning');
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
      showToast(error?.response?.data?.error || 'Error al registrar el paciente', 'error');
    } finally { setIsCreatingPatient(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return showToast('Debes seleccionar un paciente', 'warning');
    if (!formData.professionalId) return showToast('Debes seleccionar un profesional', 'warning');
    if (!formData.date || !formData.startTime || !formData.endTime)
      return showToast('Debes completar fecha y horario', 'warning');
    setIsSubmitting(true);
    try {
      const selectedPreset = SERVICE_PRESETS.find(p => p.id === formData.serviceId);
      const payload = {
        patientId: selectedPatient.id,
        professionalId: formData.professionalId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: 'PENDING',
        service: selectedPreset?.label || 'Consulta',
        notes: formData.notes,
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
    } catch {
      showToast('Error al agendar el turno', 'error');
    } finally { setIsSubmitting(false); }
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
      endTime: initialData?.endTime || '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.appointmentId ? 'Editar Turno' : 'Agendar Nuevo Turno'}
      subtitle={`${formData.date || 'Sin fecha'} | ${formData.startTime || '--:--'} - ${formData.endTime || '--:--'}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ROW 1 — Fecha y Horario */}
        <div
          className="relative overflow-hidden px-5 py-4 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          style={{ animationDelay: '50ms' }}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-2xl" />
          <label className="text-[9px] font-black text-blue-400/80 uppercase tracking-[0.2em] mb-3 block pl-2">
            Planificación Temporal
          </label>
          <div className="grid grid-cols-3 gap-3 pl-2">
            <Input type="date" label="Fecha" value={formData.date}
              className="bg-black/30 border-white/5 focus:border-blue-500/50 h-11 text-sm"
              onChange={e => setFormData({ ...formData, date: e.target.value })} />
            <Input type="time" label="Inicio" value={formData.startTime}
              className="bg-black/30 border-white/5 focus:border-blue-500/50 h-11 text-sm"
              onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
            <Input type="time" label="Fin" value={formData.endTime}
              className="bg-black/30 border-white/5 focus:border-blue-500/50 h-11 text-sm"
              onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
          </div>
        </div>

        {/* ROW 2 — Paciente | Especialista (2 columnas) */}
        <div
          className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          style={{ animationDelay: '150ms' }}
        >
          {/* ── Paciente ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Paciente</label>
              {!selectedPatient && (
                <button
                  type="button"
                  onClick={() => setMode(mode === 'search' ? 'create-quick' : 'search')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 ${
                    mode === 'create-quick'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20'
                  }`}
                >
                  {mode === 'create-quick'
                    ? <><Search className="w-3 h-3" /> Buscar</>
                    : <><UserPlus className="w-3 h-3" /> Nuevo</>}
                </button>
              )}
            </div>

            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-600/20 to-indigo-900/10 border border-blue-500/25 rounded-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg ring-2 ring-blue-500/10">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-bg-surface rounded-full animate-pulse" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-black text-white text-sm tracking-tight truncate">
                      {selectedPatient.lastName}, {selectedPatient.firstName}
                    </p>
                    <span className="text-[9px] font-bold bg-white/10 px-1.5 py-0.5 rounded uppercase text-blue-200">
                      DNI: {selectedPatient.dni}
                    </span>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-red-500/20 text-text-muted hover:text-red-400 rounded-xl transition-all hover:rotate-90 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : mode === 'search' ? (
              <div className="relative">
                <Input
                  placeholder="DNI, nombre o apellido..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  icon={Search}
                  className="bg-white/[0.03] border-white/10 focus:border-blue-500/50 h-11 text-sm"
                />
                {patients.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-bg-surface/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[100] max-h-52 overflow-y-auto p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {patients.map(p => (
                      <button key={p.id} type="button"
                        onClick={() => { setSelectedPatient(p); setSearchTerm(''); setPatients([]); }}
                        className="w-full text-left p-3 hover:bg-blue-600 rounded-xl transition-all flex justify-between items-center group/item">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover/item:bg-white/20 transition-colors flex-shrink-0">
                            <User className="w-4 h-4 text-blue-400 group-hover/item:text-white" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-black text-sm group-hover/item:text-white transition-colors truncate">{p.lastName}, {p.firstName}</span>
                            <span className="text-[9px] font-bold opacity-40 group-hover/item:text-white/60 uppercase">DNI: {p.dni}</span>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 opacity-0 group-hover/item:opacity-100 group-hover/item:text-white transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-2xl space-y-3 animate-in slide-in-from-right-4 duration-400">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400"><UserPlus className="w-4 h-4" /></div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Registro Rápido</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Nombre *" value={quickPatientForm.firstName} className="bg-black/30 border-white/5 h-10 text-xs" onChange={e => setQuickPatientForm(p => ({ ...p, firstName: e.target.value }))} />
                  <Input placeholder="Apellido *" value={quickPatientForm.lastName} className="bg-black/30 border-white/5 h-10 text-xs" onChange={e => setQuickPatientForm(p => ({ ...p, lastName: e.target.value }))} />
                  <Input placeholder="DNI *" value={quickPatientForm.dni} className="bg-black/30 border-white/5 h-10 text-xs" onChange={e => setQuickPatientForm(p => ({ ...p, dni: e.target.value }))} />
                  <Input placeholder="WhatsApp" value={quickPatientForm.phone} className="bg-black/30 border-white/5 h-10 text-xs" onChange={e => setQuickPatientForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <Button type="button" variant="secondary" icon={Check} isLoading={isCreatingPatient} onClick={handleCreateQuickPatient}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-none py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Registrar Paciente
                </Button>
              </div>
            )}
          </div>

          {/* ── Especialista ── */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] block">Especialista</label>
            <div className="space-y-2">
              {professionals.map(prof => (
                <button key={prof.id} type="button"
                  onClick={() => setFormData({ ...formData, professionalId: prof.id })}
                  className={`group relative w-full p-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 hover:-translate-y-0.5 ${
                    formData.professionalId === prof.id
                      ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: prof.color || '#3b82f6', boxShadow: `0 4px 12px ${prof.color || '#3b82f6'}44` }}
                    >
                      {prof.name.substring(0, 2).toUpperCase()}
                    </div>
                    {formData.professionalId === prof.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow border-2 border-bg-surface">
                        <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-xs font-black uppercase tracking-tight text-text-main group-hover:text-blue-400 transition-colors truncate w-full text-left">{prof.name}</span>
                    <span className="text-[9px] font-bold text-text-muted uppercase opacity-50">Odontólogo</span>
                  </div>
                  {formData.professionalId === prof.id && <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-xl pointer-events-none" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3 — Servicios | Notas (2 columnas) */}
        <div
          className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          style={{ animationDelay: '250ms' }}
        >
          {/* ── Servicios ── */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Tipo de Prestación</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_PRESETS.map(preset => (
                <button key={preset.id} type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 border active:scale-95 ${
                    formData.serviceId === preset.id
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 border-white/10 text-white shadow-[0_0_18px_rgba(79,70,229,0.4)] scale-105 z-10'
                      : 'bg-white/[0.03] border-white/5 text-text-muted hover:border-white/20 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Notas ── */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Observaciones</label>
            <textarea
              className="w-full min-h-[130px] p-4 bg-black/20 border border-white/10 rounded-2xl text-sm text-text-main placeholder:text-text-muted/20 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
              placeholder="Notas clínicas, indicaciones..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        {/* ROW 4 — Acciones */}
        <div
          className="flex gap-3 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          style={{ animationDelay: '350ms' }}
        >
          <Button variant="ghost" onClick={onClose}
            className="flex-1 h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-300">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} icon={Check}
            className="flex-[2] h-12 rounded-xl font-black uppercase tracking-[0.25em] text-[9px] shadow-xl shadow-blue-900/40 bg-blue-600 hover:bg-blue-500 transform hover:scale-[1.02] active:scale-[0.98] transition-all">
            Confirmar y Agendar
          </Button>
        </div>

      </form>
    </Modal>
  );
};
