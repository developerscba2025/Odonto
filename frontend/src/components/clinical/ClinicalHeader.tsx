import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Patient, Evolution } from '../../types/clinical';

interface Props {
  patient: Patient;
  history: Evolution[];
  onNewPlan: () => void;
}

export const ClinicalHeader = ({ patient, history, onNewPlan }: Props) => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pacientes')}
          className="p-2.5 rounded-xl bg-bg-surface border border-border-main text-text-muted hover:text-text-main hover:border-blue-500/40 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 rounded-2xl flex items-center justify-center text-lg font-black text-blue-500">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-main tracking-tight">
            {patient.lastName}, {patient.firstName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="blue" size="xs">DNI {patient.dni}</Badge>
            {patient.obraSocial && <Badge variant="slate" size="xs">{patient.obraSocial}</Badge>}
            
            {/* Analytics: Días desde la última visita */}
            {history.length > 0 && (
               <Badge variant="orange" size="xs" className="opacity-80">
                 Última visita: {Math.floor((Date.now() - new Date(history[0].date).getTime()) / (1000 * 60 * 60 * 24))} días
               </Badge>
            )}
          </div>
        </div>
      </div>
      <Button icon={Plus} onClick={onNewPlan} variant="secondary" size="sm">
        Nuevo Plan
      </Button>
    </header>
  );
};
