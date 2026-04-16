import React, { useState, useEffect } from 'react';
import { Plus, Palette, Users, X } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const TeamTab = () => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'DENTIST',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/auth/professionals');
      setProfessionals(response.data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/auth/professionals', newMember);
      setIsModalOpen(false);
      setNewMember({ name: '', email: '', role: 'DENTIST', color: '#3b82f6' });
      fetchProfessionals();
    } catch (error) {
      alert('Error al agregar miembro');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeColor = async (id: string) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    try {
      await api.patch(`/auth/professionals/${id}`, { color: randomColor });
      fetchProfessionals();
    } catch (error) {
      console.error('Error changing color');
    }
  };

  return (
    <div className="relative z-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nuevo Profesional"
        subtitle="Agrega un miembro al equipo médico"
      >
        <form onSubmit={handleAddMember} className="space-y-6">
           <Input 
            required
            label="Nombre Completo"
            placeholder="Dr/a. Nombre Apellido"
            value={newMember.name}
            onChange={e => setNewMember({...newMember, name: e.target.value})}
           />
           <Input 
            required
            label="Email"
            type="email"
            placeholder="correo@dentalflow.com"
            value={newMember.email}
            onChange={e => setNewMember({...newMember, email: e.target.value})}
           />
           <div className="space-y-2">
             <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">Color de Identidad</label>
             <div className="flex gap-3">
               {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                 <button 
                  key={c}
                  type="button"
                  onClick={() => setNewMember({...newMember, color: c})}
                  className={`w-10 h-10 rounded-2xl border-2 transition-all ${newMember.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                 />
               ))}
             </div>
           </div>
           <Button type="submit" size="lg" className="w-full" isLoading={isSaving}>Integrar al Equipo</Button>
        </form>
      </Modal>

      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">Equipo Médico</h2>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Gestión de Profesionales y Colores</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Agregar Miembro</Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professionals.map((prof) => (
          <Card key={prof.id} padding="none" className="p-6 bg-bg-main/30 border-border-main/50 flex items-center justify-between hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl transition-transform group-hover:scale-110 shadow-lg"
                style={{ backgroundColor: prof.color || '#3b82f6', boxShadow: `0 8px 24px ${prof.color}33` }}
              >
                {prof.name.charAt(0)}
              </div>
              <div>
                <p className="font-black text-text-main leading-tight">{prof.name}</p>
                <Badge size="xs" variant="slate" className="mt-1">{prof.role}</Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              icon={Palette} 
              onClick={() => handleChangeColor(prof.id)}
              className="opacity-0 group-hover:opacity-100 transition-all p-3"
            />
          </Card>
        ))}
        
        {isLoading && [1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-bg-main/20 rounded-[2rem] animate-pulse" />
        ))}

        {!isLoading && professionals.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <Users className="w-12 h-12 text-text-muted opacity-20 mx-auto" />
            <p className="text-sm font-bold text-text-muted">No hay profesionales registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
};
