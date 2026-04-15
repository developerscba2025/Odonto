import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarPlus, Clock, User, Stethoscope, Loader2, ChevronDown } from "lucide-react";
import { AppointmentSchema, type AppointmentInput } from "@dentalflow/shared";
import { PRACTICE_TYPES } from "@dentalflow/shared";
import api from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { useQueryClient as useQC } from "@tanstack/react-query";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

const selectStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px', fontSize: '0.875rem',
  outline: 'none', fontFamily: '"Inter", sans-serif',
  color: '#0f172a', background: '#f9fafb',
  transition: 'all 0.15s', boxSizing: 'border-box' as const,
  appearance: 'none' as const,
  cursor: 'pointer',
};

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px', fontSize: '0.875rem',
  outline: 'none', fontFamily: '"Inter", sans-serif',
  color: '#0f172a', background: '#f9fafb',
  transition: 'all 0.15s', boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600 as const,
  color: '#374151', marginBottom: '7px',
};

export default function NewAppointmentModal({ isOpen, onClose, initialDate }: Props) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ["patients-list"],
    queryFn: async () => {
      const res = await api.get("/patients?limit=200");
      return res.data.patients ?? res.data;
    },
    enabled: isOpen,
  });

  const { data: professionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const res = await api.get("/auth/professionals");
      return res.data;
    },
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      date: initialDate || new Date().toISOString().slice(0, 16),
      duration: 30,
      professionalId: user?.id,
      practiceType: 'GENERAL_CONSULTATION',
    },
  });

  const onSubmit = async (data: AppointmentInput) => {
    try {
      await api.post('/appointments', {
        ...data,
        date: new Date(data.date).toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating appointment', error);
      alert('Error al agendar el turno.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'relative', zIndex: 1,
              background: '#fff',
              borderRadius: '16px',
              width: '100%', maxWidth: '520px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fafafa',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(16,185,129,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CalendarPlus size={20} color="#10b981" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.01em' }}>
                    Nueva cita
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1px' }}>Completá los datos del turno</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#f1f5f9', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', transition: 'background 0.15s',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Patient */}
              <div>
                <label style={labelStyle}>Paciente</label>
                <select {...register('patientId')} style={selectStyle}>
                  <option value="">Seleccionar paciente...</option>
                  {patients?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.lastName}, {p.name} — DNI {p.dni}</option>
                  ))}
                </select>
                {errors.patientId && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px' }}>{errors.patientId.message}</p>}
              </div>

              {/* Professional */}
              <div>
                <label style={labelStyle}>Profesional</label>
                <select {...register('professionalId')} style={selectStyle}>
                  {professionals?.map((p: any) => (
                    <option key={p.id} value={p.id}>Dr. {p.lastName}, {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Practice Type */}
              <div>
                <label style={labelStyle}>Tipo de práctica</label>
                <select {...register('practiceType')} style={selectStyle}>
                  {PRACTICE_TYPES?.map((t: any) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  )) ?? (
                    <option value="GENERAL_CONSULTATION">Consulta general</option>
                  )}
                </select>
              </div>

              {/* Date & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Fecha y hora</label>
                  <input type="datetime-local" {...register('date')} style={inputStyle} />
                  {errors.date && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px' }}>{errors.date.message as string}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Duración (min)</label>
                  <select {...register('duration', { valueAsNumber: true })} style={selectStyle}>
                    {[15, 20, 30, 45, 60, 90, 120].map(d => (
                      <option key={d} value={d}>{d} minutos</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>Notas (opcional)</label>
                <textarea
                  {...register('notes')}
                  placeholder="Observaciones del turno..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                <button type="button" onClick={onClose} style={{
                  flex: 1, padding: '11px',
                  background: '#f8fafc', border: '1px solid #e5e7eb',
                  borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
                  color: '#64748b', cursor: 'pointer', fontFamily: '"Inter", sans-serif',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} style={{
                  flex: 2, padding: '11px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: '10px',
                  fontSize: '0.875rem', fontWeight: 700, color: '#fff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
                  fontFamily: '"Inter", sans-serif',
                }}>
                  {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '✓ Confirmar turno'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
