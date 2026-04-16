import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Fingerprint, Phone, Edit2, Archive, Plus } from 'lucide-react';
import api from '../lib/api';
import CreatePatientModal from '../components/CreatePatientModal';

// UI Atoms
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

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

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    p.dni.includes(search)
  );

  const archivePatient = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas archivar a este paciente? Podrás recuperarlo luego desde configuración.')) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (error) {
        alert('Error al archivar paciente');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-text-main tracking-tighter">Pacientes</h1>
          <p className="text-sm text-text-muted font-medium">Gestión integral de la base de datos clínica.</p>
        </div>
        <Button 
          size="lg"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Crear Paciente
        </Button>
      </div>

      <CreatePatientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPatients} 
      />

      <Card padding="none" className="min-h-[600px] flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-border-main/50 bg-bg-main/20 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="w-full md:w-96">
            <Input 
              icon={SearchIcon}
              placeholder="Buscar por nombre, apellido o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-bg-surface border-border-main"
            />
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="slate">{filteredPatients.length} pacientes</Badge>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
               <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
               <p className="text-xs font-black text-text-muted uppercase tracking-widest">Sincronizando datos...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-text-muted space-y-4">
               <div className="w-20 h-20 bg-bg-main rounded-[2rem] flex items-center justify-center border border-border-main opacity-40">
                 <SearchIcon className="w-8 h-8" />
               </div>
               <p className="text-sm font-bold opacity-60">No se encontraron pacientes registrados.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main/30 text-text-muted text-[10px] uppercase tracking-[0.2em] font-black border-b border-border-main/50">
                  <th className="px-8 py-5">Identidad</th>
                  <th className="px-8 py-5">DNI</th>
                  <th className="px-8 py-5">Contacto</th>
                  <th className="px-8 py-5">Cobertura</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-blue-600/5 transition-all group border-b border-transparent">
                    <td className="px-8 py-5">
                      <Link to={`/pacientes/${patient.id}`} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/10 flex items-center justify-center text-blue-600 font-black text-sm shadow-sm transition-transform group-hover:scale-105 group-hover:shadow-blue-500/10">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-black text-text-main text-sm group-hover:text-blue-600 transition-colors">
                            {patient.lastName}, {patient.firstName}
                          </p>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter opacity-60">Ficha: #{patient.id.slice(0, 8)}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                         <Fingerprint className="w-4 h-4 text-blue-500 opacity-40" />
                         <span className="text-sm font-bold text-text-main">{patient.dni}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {patient.phone ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {patient.phone}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-text-muted opacity-30 italic">Sin teléfono</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={patient.obraSocial ? 'blue' : 'slate'}>
                        {patient.obraSocial || 'Particular'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <Button variant="ghost" size="sm" icon={Edit2} className="px-2" />
                        <Button 
                          variant="danger" 
                          size="sm" 
                          icon={Archive} 
                          className="px-2"
                          onClick={() => archivePatient(patient.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
