import React, { useEffect, useState } from 'react';
import { User, Fingerprint, Phone, Shield, Check, Mail } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../store/ToastContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Atoms
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

// Validation Schema with Zod
const patientSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 letras'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 letras'),
  dni: z.string().min(7, 'DNI no válido').max(10, 'DNI no válido'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email no válido').optional().or(z.literal('')).nullable(),
  obraSocial: z.string().optional().nullable(),
  affiliateNum: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
});

export type PatientData = z.infer<typeof patientSchema> & { id?: string };

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: PatientData | null; // To populate form for editing
}

export default function CreatePatientModal({ isOpen, onClose, onSuccess, initialData }: CreatePatientModalProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      email: '',
      obraSocial: '',
      affiliateNum: '',
      birthDate: ''
    }
  });

  // Re-populate form whenever modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        dni: initialData.dni || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        obraSocial: initialData.obraSocial || '',
        affiliateNum: initialData.affiliateNum || '',
        birthDate: initialData.birthDate ? initialData.birthDate.split('T')[0] : ''
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        dni: '',
        phone: '',
        email: '',
        obraSocial: '',
        affiliateNum: '',
        birthDate: ''
      });
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: PatientData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        birthDate: data.birthDate || null,
        phone: data.phone || null,
        email: data.email || null,
        obraSocial: data.obraSocial || null,
        affiliateNum: data.affiliateNum || null
      };

      if (isEditing && initialData?.id) {
        await api.put(`/patients/${initialData.id}`, payload);
        showToast('Paciente actualizado con éxito.', 'success');
      } else {
        await api.post('/patients', payload);
        showToast(`${data.firstName} ${data.lastName} registrado con éxito.`, 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error in patient modal:', error);
      const backendMessage = error.response?.data?.error;
      showToast(
        backendMessage || (isEditing ? 'Error al actualizar el paciente.' : 'Error al crear el paciente. Verifique los datos o si el DNI está duplicado.'),
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
      subtitle={isEditing ? `Actualizar ficha: ${initialData?.firstName} ${initialData?.lastName}` : 'Ficha Clínica Integral'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            placeholder="Ej: Juan"
            icon={User}
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Apellido"
            placeholder="Ej: Pérez"
            icon={User}
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        {/* DNI y Fecha de nac */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="DNI"
            placeholder="Ej: 30123456"
            icon={Fingerprint}
            {...register('dni')}
            error={errors.dni?.message}
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            {...register('birthDate')}
            error={errors.birthDate?.message}
          />
        </div>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono / WhatsApp"
            placeholder="+54 11 1234 5678"
            type="tel"
            icon={Phone}
            {...register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label="Email"
            placeholder="paciente@mail.com"
            type="email"
            icon={Mail}
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        {/* Obra Social */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Obra Social"
            placeholder="Ej: OSDE, IOMA, Particular"
            icon={Shield}
            {...register('obraSocial')}
            error={errors.obraSocial?.message}
          />
          <Input
            label="Nº de Afiliado"
            placeholder="Opcional"
            {...register('affiliateNum')}
            error={errors.affiliateNum?.message}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 pt-2">
          <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} icon={Check} className="flex-1">
            {isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
