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
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative z-10 w-full max-w-[500px] bg-bg-elevated rounded-2xl shadow-xl overflow-hidden border border-border"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-bg-subtle/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary font-display">
                    Nuevo paciente
                  </h2>
                  <p className="text-[0.7rem] text-text-tertiary mt-0.5">
                    Registrar ficha en el sistema
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-bg-subtle hover:text-red-500 transition-all border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Nombre</label>
                  <input {...register('name')} placeholder="Ej. Ana" className="input-field" />
                  {errors.name && <p className="text-[0.7rem] text-red-500 mt-1.5 font-medium">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Apellido</label>
                  <input {...register('lastName')} placeholder="Ej. García" className="input-field" />
                  {errors.lastName && <p className="text-[0.7rem] text-red-500 mt-1.5 font-medium">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">DNI / Identificación</label>
                  <input {...register('dni')} placeholder="Sin puntos" className="input-field font-mono" />
                  {errors.dni && <p className="text-[0.7rem] text-red-500 mt-1.5 font-medium">{errors.dni.message}</p>}
                </div>
                <div>
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Fecha de nacimiento</label>
                  <input type="date" {...register('dob')} className="input-field" />
                  {errors.dob && <p className="text-[0.7rem] text-red-500 mt-1.5 font-medium">{errors.dob.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Número de teléfono</label>
                <input {...register('phone')} placeholder="+54 9 11..." className="input-field" />
                {errors.phone && <p className="text-[0.7rem] text-red-500 mt-1.5 font-medium">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Email (Opcional)</label>
                <input {...register('email')} placeholder="paciente@ejemplo.com" className="input-field" />
                {errors.email && <p className="text-[0.7rem] text-red-500 mt-1.5 font-medium">{errors.email.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary flex-[1.5] justify-center"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : '✓ Crear paciente'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
