import React, { useState, useEffect } from 'react';
import { Building2, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../store/ToastContext';
import api from '../../lib/api';

export const ClinicTab = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Nexus Clínica Dental',
    phone: '',
    address: '',
    openTime: '08:00',
    closeTime: '20:00'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/settings/clinic');
        if (data) {
          setFormData({ 
            name: data.name || '', 
            phone: data.phone || '', 
            address: data.address || '',
            openTime: data.openTime || '08:00',
            closeTime: data.closeTime || '20:00'
          });
        }
      } catch (e) {
        showToast('Error al cargar ajustes de la clínica', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/settings/clinic', formData);
      showToast('Configuración de clínica guardada', 'success');
      setTimeout(() => window.location.reload(), 1000); // Reload to reflect UI changes if any
    } catch (e) {
      showToast('Error al guardar la configuración', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <form onSubmit={handleSave} className="relative z-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-2xl font-black text-text-main tracking-tight">Datos de la Clínica</h2>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Información Pública y Branding</p>
      </header>
      
      <div className="space-y-8">
        <Card variant="inset" padding="none" className="p-12 flex flex-col items-center justify-center gap-6 border-dashed border-2 border-border-main/50">
          <div className="w-24 h-24 bg-bg-surface rounded-3xl flex items-center justify-center border border-border-main shadow-inner">
            <Building2 className="w-10 h-10 text-text-muted opacity-20" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Identidad Visual</p>
            <p className="text-xs font-bold text-text-muted opacity-60">Sube el logo de tu clínica (PNG/JPG máx 2MB)</p>
          </div>
          <Button variant="secondary" icon={Upload} size="sm">Seleccionar Imagen</Button>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Hora de Apertura"
            type="time"
            value={formData.openTime}
            onChange={(e) => setFormData({...formData, openTime: e.target.value})}
          />
          <Input 
            label="Hora de Cierre"
            type="time"
            value={formData.closeTime}
            onChange={(e) => setFormData({...formData, closeTime: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Nombre Comercial"
            placeholder="Ej: DentalFlow Centro de Estética"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Teléfono de Contacto"
            placeholder="+54 11 1234 5678"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Dirección Física</label>
          <textarea 
            placeholder="Ej: Av. Santa Fe 1234, CABA"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full bg-bg-surface border border-border-main rounded-2xl px-6 py-4 text-sm text-text-main placeholder:text-text-muted/30 focus:border-blue-500/50 outline-none transition-all min-h-[120px] shadow-inner"
          />
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <Button type="submit" size="lg" isLoading={isSaving}>Guardar Configuración</Button>
      </div>
    </form>
  );
};
