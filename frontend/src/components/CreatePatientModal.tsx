import React, { useState, useEffect } from 'react';
import { User, Fingerprint, Phone, Shield, Check, Mail, Building2 } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../store/ToastContext';

// UI Atoms
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // To populate form for editing
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  dni: '',
  phone: '',
  email: '',
  obraSocial: '',
  affiliateNum: '',
  birthDate: ''
};

export default function CreatePatientModal({ isOpen, onClose, onSuccess, initialData }: CreatePatientModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  // Re-populate form whenever modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setFormData({
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
      setFormData(EMPTY_FORM);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        birthDate: formData.birthDate || null,
        phone: formData.phone || null,
        email: formData.email || null,
        obraSocial: formData.obraSocial || null,
        affiliateNum: formData.affiliateNum || null
      };

      if (isEditing) {
        await api.put(`/patients/${initialData.id}`, payload);
        showToast('Paciente actualizado con éxito.', 'success');
      } else {
        await api.post('/patients', payload);
        showToast(`${formData.firstName} ${formData.lastName} registrado con éxito.`, 'success');
      }
      onSuccess();
      onClose();
    } catch (error) {
      showToast(
        isEditing
          ? 'Error al actualizar el paciente.'
          : 'Error al crear el paciente. El DNI podría estar duplicado.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleField = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
      subtitle={isEditing ? `Actualizar ficha: ${initialData?.firstName} ${initialData?.lastName}` : 'Ficha Clínica Integral'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            required
            label="Nombre"
            placeholder="Ej: Juan"
            icon={User}
            value={formData.firstName}
            onChange={handleField('firstName')}
          />
          <Input
            required
            label="Apellido"
            placeholder="Ej: Pérez"
            icon={User}
            value={formData.lastName}
            onChange={handleField('lastName')}
          />
        </div>

        {/* DNI y Fecha de nac */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            required
            label="DNI"
            placeholder="Ej: 30123456"
            icon={Fingerprint}
            value={formData.dni}
            onChange={handleField('dni')}
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={formData.birthDate}
            onChange={handleField('birthDate')}
          />
        </div>

        {/* Teléfono y Email */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono / WhatsApp"
            placeholder="+54 11 1234 5678"
            type="tel"
            icon={Phone}
            value={formData.phone}
            onChange={handleField('phone')}
          />
          <Input
            label="Email"
            placeholder="paciente@mail.com"
            type="email"
            icon={Mail}
            value={formData.email}
            onChange={handleField('email')}
          />
        </div>

        {/* Obra Social */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Obra Social"
            placeholder="Ej: OSDE, IOMA, Particular"
            icon={Shield}
            value={formData.obraSocial}
            onChange={handleField('obraSocial')}
          />
          <Input
            label="Nº de Afiliado"
            placeholder="Opcional"
            value={formData.affiliateNum}
            onChange={handleField('affiliateNum')}
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
