import React, { useState, useRef, useEffect } from 'react';
import { Save, Clock, FileText, Image as ImageIcon, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TreatmentPlan } from '../../types/clinical';
import api from '../../lib/api';
import { useToast } from '../../store/ToastContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const CLINICAL_PRESETS = [
  { label: 'Limpieza', text: 'Se realiza detartraje supra y subgingival con ultrasonido. Pulido coronario con pasta abrasiva.' },
  { label: 'Restauración', text: 'Se realiza apertura de cavidad, eliminación de tejido cariado y restauración con resina compuesta fotopolimerizable.' },
  { label: 'Exodoncia', text: 'Bajo anestesia local, se realiza la extracción de la pieza dental indicada. Hemostasia lograda. Indicaciones post-quirúrgicas.' },
  { label: 'Urgencia', text: 'Atención por dolor agudo. Apertura cameral, toilette y medicación intraconducto pautada.' },
];

interface Props {
  plans: TreatmentPlan[];
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  onSave: (description: string, files: any[]) => Promise<void>;
  isSaving: boolean;
}

export const EvolutionForm = ({ plans, selectedPlanId, setSelectedPlanId, onSave, isSaving }: Props) => {
  const { showToast } = useToast();
  const [newEvolution, setNewEvolution] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{url: string, type: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyPreset = (text: string) => {
    setNewEvolution(prev => prev ? `${prev}\n\n${text}` : text);
    showToast('Plantilla aplicada', 'info');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedFiles(prev => [...prev, { url: res.data.url, type: 'PHOTO' }]);
      showToast('Imagen subida correctamente', 'success');
    } catch (error) {
      showToast('Error al subir la imagen', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!newEvolution.trim() && uploadedFiles.length === 0) {
      return showToast('Por favor, escribe una descripción o sube una imagen.', 'warning');
    }
    await onSave(newEvolution, uploadedFiles);
    setNewEvolution('');
    setUploadedFiles([]);
  };

  return (
    <Card padding="none" className="p-6 md:p-8 space-y-8 bg-bg-surface border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem]">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-text-main tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <FileText className="w-6 h-6" />
            </div>
            Nueva Evolución
          </h3>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-[3.25rem]">Registro Clínico Oficial</p>
        </div>
        
        {/* Link a tratamiento */}
        <div className="flex items-center gap-3 bg-bg-main px-4 py-2 rounded-xl border border-border-main">
          <span className="text-[9px] uppercase font-black text-text-muted tracking-widest">Asignar a Plan:</span>
          <select 
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(e.target.value)}
            className="bg-transparent border-none text-xs font-bold p-0 pr-4 text-text-main focus:outline-none focus:ring-0 cursor-pointer"
          >
            <option value="">(Registro suelto)</option>
            {plans.filter(p => p.status === 'IN_PROGRESS').map(p => (
              <option key={p.id} value={p.id}>{p.description.substring(0, 30)}...</option>
            ))}
          </select>
        </div>
      </header>

      {/* Nexus Design Presets Section */}
      <div className="space-y-4">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-4 h-[1px] bg-border-main" /> Textos predefinidos
        </p>
        <div className="flex flex-wrap gap-2">
          {CLINICAL_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p.text)}
              className="px-5 py-2.5 bg-bg-main border border-border-main/50 hover:border-blue-500/50 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-wider shadow-sm hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 active:translate-y-0 duration-200"
            >
              + {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
        <textarea 
          value={newEvolution}
          onChange={(e) => setNewEvolution(e.target.value)}
          placeholder="Escribe el diagnóstico detallado, observaciones y/o el procedimiento realizado en esta sesión..."
          className="relative w-full h-56 p-8 bg-bg-surface border border-border-main/80 rounded-[1.8rem] text-sm text-text-main focus:border-blue-500 focus:bg-bg-main outline-none transition-all resize-none shadow-inner leading-relaxed"
        />
      </div>

      {/* Uploaded Files Previews */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-4 px-2">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden border border-border-main shadow-lg">
              <img 
                src={`${API_BASE}${file.url}`} 
                alt="preview" 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept="image/*"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={isUploading ? Clock : ImageIcon} 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Anexar Placa'}
          </Button>
        </div>
        <Button 
          onClick={handleSubmit} 
          isLoading={isSaving}
          icon={Save}
          size="lg"
          className="px-10"
        >
          Registrar Atención
        </Button>
      </div>
    </Card>
  );
};
