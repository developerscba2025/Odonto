import React from 'react';
import { Building2, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export const ClinicTab = () => {
  return (
    <div className="relative z-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
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
            label="Nombre Comercial"
            placeholder="Ej: DentalFlow Centro de Estética"
          />
          <Input 
            label="Teléfono de Contacto"
            placeholder="+54 11 1234 5678"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Dirección Física</label>
          <textarea 
            placeholder="Ej: Av. Santa Fe 1234, CABA"
            className="w-full bg-black/20 border border-[#1e293b] rounded-[2rem] px-6 py-4 text-sm text-text-main placeholder:text-text-muted/30 focus:border-blue-500/50 outline-none transition-all min-h-[120px]"
          />
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <Button size="lg">Guardar Configuración</Button>
      </div>
    </div>
  );
};
