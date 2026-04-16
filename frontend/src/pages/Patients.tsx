import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Phone, Edit2, Archive, Plus, Users, ClipboardList } from 'lucide-react';
import api from '../lib/api';
import CreatePatientModal from '../components/CreatePatientModal';

// UI Atoms
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string | null;
  email: string | null;
  obraSocial: string | null;
  isDeleted: boolean;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Patient | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'PARTICULAR' | 'OBRA_SOCIAL'>('ALL');

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPatients(search);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchPatients = async (query = '') => {
    try {
      setIsLoading(true);
      const response = await api.get('/patients', { params: { search: query } });
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!confirmArchive) return;
    try {
      await api.delete(`/patients/${confirmArchive.id}`);
      fetchPatients(search);
    } catch (error) {
      console.error('Error archiving patient:', error);
    } finally {
      setConfirmArchive(null);
    }
  };

  const filteredPatients = patients.filter(p => {
    if (filterType === 'ALL') return true;
    if (filterType === 'PARTICULAR') return !p.obraSocial;
    if (filterType === 'OBRA_SOCIAL') return !!p.obraSocial;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-text-main tracking-tighter uppercase">Base de Datos de Pacientes</h1>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-50">Gestión de Registros Clínicos</p>
        </div>
        <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Nuevo Registro
        </Button>
      </div>

      <CreatePatientModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPatient(null); }}
        onSuccess={() => fetchPatients(search)}
        initialData={editingPatient}
      />

      <ConfirmDialog
        isOpen={!!confirmArchive}
        title="Archivar registro"
        message={`¿Estás seguro de archivar a ${confirmArchive?.firstName} ${confirmArchive?.lastName}? El registro se moverá al archivo histórico.`}
        confirmLabel="Confirmar Archivo"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setConfirmArchive(null)}
        variant="warning"
      />

      <Card padding="none" className="overflow-hidden border-border-main shadow-2xl rounded-3xl">
        {/* Container Header & Search Combined */}
        <div className="bg-bg-main/30 border-b border-border-main/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl">
                 <Users className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-sm font-black text-text-main uppercase tracking-widest">Listado de Pacientes</h2>
                 <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-40">{patients.length} registros activos</p>
              </div>
           </div>

           <div className="flex flex-col gap-4 w-full md:max-w-md">
              <Input
                 icon={SearchIcon}
                 placeholder="Buscar por DNI, Nombre o Apellido..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="bg-bg-surface/50 border-border-main/50"
              />
              <div className="flex gap-1 bg-bg-main p-1 rounded-xl w-fit">
                {(['ALL', 'PARTICULAR', 'OBRA_SOCIAL'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-tight rounded-lg transition-all ${
                      filterType === type 
                        ? 'bg-bg-surface text-blue-500 shadow-sm border border-border-main/50' 
                        : 'text-text-muted hover:text-text-main hover:bg-bg-surface/50'
                    }`}
                  >
                    {type === 'ALL' ? 'Todos' : type === 'PARTICULAR' ? 'Particular' : 'Obra Social'}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-border-main/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
              <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sincronizando Pacientes...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 text-text-muted space-y-4">
              <div className="w-16 h-16 bg-bg-main rounded-2xl flex items-center justify-center border border-border-main opacity-20">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest opacity-40">No se encontraron pacientes</p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between px-8 py-5 hover:bg-bg-main/30 transition-all group">
                {/* Avatar + Identity */}
                <Link to={`/pacientes/${patient.id}`} className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-bg-main border border-border-main/50 flex items-center justify-center text-blue-500 font-extrabold text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-text-main text-sm group-hover:text-blue-500 transition-colors uppercase tracking-tight">
                      {patient.lastName}, {patient.firstName}
                    </p>
                    <p className="text-[10px] font-black text-text-muted opacity-40 uppercase tracking-widest mt-0.5">DNI {patient.dni}</p>
                  </div>
                </Link>

                {/* Info Pills */}
                <div className="hidden md:flex items-center gap-10">
                   <div className="w-40 shrink-0">
                      {patient.phone ? (
                        <div className="flex items-center gap-2">
                           <Phone className="w-3 h-3 text-text-muted opacity-40" />
                           <span className="text-[11px] font-bold text-text-muted">{patient.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-text-muted opacity-30 italic">Sin teléfono</span>
                      )}
                   </div>
                   
                   <div className="w-32 shrink-0">
                     <Badge variant={patient.obraSocial ? 'blue' : 'slate'} size="xs" className="uppercase tracking-widest text-[8px]">
                       {patient.obraSocial || 'Particular'}
                     </Badge>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-8 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    className="p-2 h-9 w-9 rounded-xl hover:bg-blue-600/10 hover:text-blue-500"
                    onClick={(e) => { e.preventDefault(); setEditingPatient(patient); setIsModalOpen(true); }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Archive}
                    className="p-2 h-9 w-9 rounded-xl hover:bg-red-600/10 hover:text-red-500"
                    onClick={(e) => { e.preventDefault(); setConfirmArchive(patient); }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
