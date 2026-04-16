import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const ProfileTab = () => {
  const { user } = useAuth();
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
      alert('Perfil actualizado con éxito');
    } catch (error) {
      alert('Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleUpdateProfile} className="relative z-10 space-y-8 animate-in slide-in-from-right-4 duration-500">
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
            <Button variant="ghost" size="sm" className="uppercase tracking-widest text-[10px]">Cambiar Foto</Button>
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
            <Button variant="secondary" className="w-full text-xs">
              Cambiar Contraseña
            </Button>
        </Card>
      </div>
    </form>
  );
};
