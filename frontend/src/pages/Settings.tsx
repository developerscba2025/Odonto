import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Settings as SettingsIcon, 
  Building2, 
  ChevronRight
} from 'lucide-react';

// UI Atoms
import { Card } from '../components/ui/Card';

// Extracted Feature Modules
import { ProfileTab } from '../features/settings/ProfileTab';
import { TeamTab } from '../features/settings/TeamTab';
import { ClinicTab } from '../features/settings/ClinicTab';
import { SystemTab } from '../features/settings/SystemTab';
import { AuditTab } from '../features/settings/AuditTab';
import { useAuth } from '../store/AuthContext';

type TabType = 'perfil' | 'equipo' | 'clinica' | 'sistema' | 'auditoria';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('perfil');

  const tabs = [
    { id: 'perfil', label: 'Mi Perfil', icon: User, color: 'text-blue-500', adminOnly: false },
    { id: 'equipo', label: 'Equipo Médico', icon: Users, color: 'text-emerald-500', adminOnly: true },
    { id: 'clinica', label: 'Clínica', icon: Building2, color: 'text-orange-500', adminOnly: true },
    { id: 'sistema', label: 'Sistema', icon: SettingsIcon, color: 'text-purple-500', adminOnly: true },
    { id: 'auditoria', label: 'Auditoría', icon: SettingsIcon, color: 'text-red-500', adminOnly: true },
  ].filter(tab => !tab.adminOnly || user?.role === 'ADMIN');

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700 space-y-8">
      <header className="px-2">
        <h1 className="text-4xl font-black text-text-main tracking-tighter">Configuración</h1>
        <p className="text-sm text-text-muted font-medium mt-1">Personaliza tu entorno de trabajo y gestiona tu equipo.</p>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="lg:w-80 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id 
                ? 'bg-bg-surface border border-border-main shadow-lg border-l-2 border-l-blue-500' 
                : 'hover:bg-bg-main text-text-muted hover:text-text-main border border-transparent'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`p-3 rounded-2xl transition-all duration-500 ${
                  activeTab === tab.id ? 'bg-bg-main shadow-inner scale-110' : 'bg-transparent opacity-40'
                }`}>
                  <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? tab.color : ''}`} />
                </div>
                <span className={`font-black text-sm tracking-tight ${activeTab === tab.id ? 'text-text-main' : ''}`}>
                  {tab.label}
                </span>
              </div>
              {activeTab === tab.id && (
                <div className="p-1 px-2 bg-blue-500/10 rounded-lg">
                  <ChevronRight className="w-3 h-3 text-blue-500" />
                </div>
              )}
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl">
          <Card padding="lg" className="min-h-[700px] border-border-main/50 relative">
             {/* Background Decorative Glow */}
             <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden rounded-[3rem]">
                <div className="absolute -top-48 -right-48 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
             </div>

             {activeTab === 'perfil' && <ProfileTab />}
             {activeTab === 'equipo' && <TeamTab />}
             {activeTab === 'clinica' && <ClinicTab />}
             {activeTab === 'sistema' && <SystemTab />}
             {activeTab === 'auditoria' && <AuditTab />}
          </Card>
        </main>
      </div>
    </div>
  );
}
