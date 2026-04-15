import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, UserPlus } from 'lucide-react';
import { PatientSchema, type PatientInput } from '@dentalflow/shared';
import api from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: '10px', fontSize: '0.875rem',
  outline: 'none', fontFamily: '"Inter", sans-serif',
  color: 'var(--text-primary)', background: 'var(--bg-subtle)',
  transition: 'all 0.15s', boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600 as const,
  color: 'var(--text-secondary)', marginBottom: '7px',
};

export default function NewPatientModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientInput>({
    resolver: zodResolver(PatientSchema),
  });

  const onSubmit = async (data: PatientInput) => {
    try {
      await api.post('/patients', data);
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating patient', error);
      alert('Error al crear el paciente. Verifique los datos.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            style={{
              position: 'relative', zIndex: 1,
              background: 'var(--bg-elevated)',
              borderRadius: '16px',
              width: '100%', maxWidth: '480px',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(16,185,129,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UserPlus size={20} color="#10b981" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    Nuevo paciente
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Registrar ficha en el sistema</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input {...register('name')} placeholder="Ej. Ana" style={inputStyle} />
                  {errors.name && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px' }}>{errors.name.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Apellido</label>
                  <input {...register('lastName')} placeholder="Ej. García" style={inputStyle} />
                  {errors.lastName && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px' }}>{errors.lastName.message}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>DNI / Identificación</label>
                  <input {...register('dni')} placeholder="Sin puntos" style={inputStyle} />
                  {errors.dni && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px' }}>{errors.dni.message}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Fecha de nacimiento</label>
                  <input type="date" {...register('dob')} style={inputStyle} />
                  {errors.dob && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px' }}>{errors.dob.message}</p>}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Número de teléfono</label>
                <input {...register('phone')} placeholder="+54 9 11..." style={inputStyle} />
                {errors.phone && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px' }}>{errors.phone.message}</p>}
              </div>

              <div>
                <label style={labelStyle}>Email (Opcional)</label>
                <input {...register('email')} placeholder="paciente@ejemplo.com" style={inputStyle} />
                {errors.email && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px' }}>{errors.email.message}</p>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '12px' }}>
                <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary" 
                  style={{ flex: 1.5 }}
                >
                  {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : '✓ Crear paciente'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
