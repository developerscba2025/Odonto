import React, { useState } from 'react';
import { User, Fingerprint, Phone, Shield, Check } from 'lucide-react';
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
}

export default function CreatePatientModal({ isOpen, onClose, onSuccess }: CreatePatientModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    obraSocial: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/patients', formData);
      showToast(`${formData.firstName} ${formData.lastName} ha sido registrado con éxito.`, 'success');
      onSuccess();
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        dni: '',
        phone: '',
        email: '',
        obraSocial: ''
      });
    } catch (error) {
      showToast('Error al crear el paciente. El DNI podría estar duplicado.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Crear Paciente" 
      subtitle="Nueva Ficha Clínica Integral"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            required
            label="Nombre"
            placeholder="Ej: Juan"
            icon={User}
            value={formData.firstName}
            onChange={e => setFormData({...formData, firstName: e.target.value})}
          />
          <Input 
            required
            label="Apellido"
            placeholder="Ej: Pérez"
            icon={User}
            value={formData.lastName}
            onChange={e => setFormData({...formData, lastName: e.target.value})}
          />
        </div>

        <Input 
          required
          label="DNI / Identificación"
          placeholder="Número de documento"
          icon={Fingerprint}
          value={formData.dni}
          onChange={e => setFormData({...formData, dni: e.target.value})}
        />

        <Input 
          label="Teléfono"
          placeholder="Ej: 11 1234 5678"
          icon={Phone}
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />

        <Input 
          label="Obra Social / Cobertura"
          placeholder="Ej: OSDE, Particular"
          icon={Shield}
          value={formData.obraSocial}
          onChange={e => setFormData({...formData, obraSocial: e.target.value})}
        />

        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            size="lg" 
            onClick={onClose} 
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            size="lg" 
            isLoading={isSubmitting}
            icon={Check}
            className="flex-1"
          >
            Crear Paciente
          </Button>
        </div>
      </form>
    </Modal>
  );
}
