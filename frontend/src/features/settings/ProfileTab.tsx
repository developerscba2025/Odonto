import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../store/ToastContext';

export const ProfileTab = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/auth/profile', profileData);
      showToast('Perfil actualizado con éxito', 'success');
    } catch (error) {
      showToast('Error al actualizar perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const [absences, setAbsences] = useState<any[]>([]);
  const [newAbsence, setNewAbsence] = useState({ start: '', end: '', reason: '' });

  const fetchAbsences = async () => {
    try {
      const { data } = await api.get('/absences');
      setAbsences(data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  const handleAddAbsence = async () => {
    if (!newAbsence.start || !newAbsence.end) return showToast('Completa las fechas', 'warning');
    try {
      await api.post('/absences', newAbsence);
      setNewAbsence({ start: '', end: '', reason: '' });
      fetchAbsences();
      showToast('Ausencia registrada', 'success');
    } catch (error) {
      showToast('Error al registrar ausencia', 'error');
    }
  };

  const handleDelAbsence = async (id: string) => {
    try {
      await api.delete(`/absences/${id}`);
      fetchAbsences();
    } catch (e) {}
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <form onSubmit={handleUpdateProfile} className="relative z-10 space-y-8">
        <header>
          <h2 className="text-2xl font-black text-text-main tracking-tight">Mi Perfil</h2>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Datos Personales y Seguridad</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/20">
                {user?.name?.charAt(0)}
              </div>
              <Button type="button" variant="ghost" size="sm" className="uppercase tracking-widest text-[10px]">Cambiar Foto</Button>
            </div>
            
            <Input 
              label="Nombre Completo"
              value={profileData.name}
              onChange={e => setProfileData({...profileData, name: e.target.value})}
            />

            <Input 
              label="Correo Electrónico"
              type="email"
              value={profileData.email}
              onChange={e => setProfileData({...profileData, email: e.target.value})}
            />

            <div className="pt-4">
              <Button type="submit" size="lg" isLoading={isSaving} className="w-full sm:w-auto">
                Guardar Cambios
              </Button>
            </div>
          </div>

          <Card variant="inset" padding="md" className="space-y-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-text-main">
                <Shield className="w-6 h-6 text-purple-500" />
                <span className="font-black text-lg">Seguridad</span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed font-medium">
                Te recomendamos usar contraseñas fuertes de al menos 8 caracteres mezclando letras y números.
              </p>
              <Button type="button" variant="secondary" className="w-full text-xs">
                Cambiar Contraseña
              </Button>
          </Card>
        </div>
      </form>

      {/* Absences section */}
      <div className="pt-8 border-t border-border-main">
        <h3 className="text-xl font-black text-text-main mb-4">Mis Licencias y Vacaciones</h3>
        <Card variant="inset" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
             <Input label="Desde" type="date" value={newAbsence.start} onChange={e => setNewAbsence({ ...newAbsence, start: e.target.value })} />
             <Input label="Hasta" type="date" value={newAbsence.end} onChange={e => setNewAbsence({ ...newAbsence, end: e.target.value })} />
             <Input label="Motivo (opcional)" value={newAbsence.reason} onChange={e => setNewAbsence({ ...newAbsence, reason: e.target.value })} />
             <Button type="button" onClick={handleAddAbsence} className="mb-1">Registrar</Button>
          </div>
          <div className="space-y-2 mt-4">
            {absences.map(a => (
               <div key={a.id} className="flex justify-between items-center bg-bg-surface p-3 rounded-xl border border-border-main text-sm text-text-main">
                  <div>
                    <span className="font-bold text-blue-500">{new Date(a.start).toLocaleDateString('es-ES')} - {new Date(a.end).toLocaleDateString('es-ES')}</span>
                    {a.reason && <p className="text-xs text-text-muted mt-1">{a.reason}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleDelAbsence(a.id)}>Borrar</Button>
               </div>
            ))}
            {absences.length === 0 && <p className="text-xs text-text-muted">No tienes ausencias programadas.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
