import { Loader2, Calendar as CalendarIcon, CheckCheck, MinusCircle, Filter, Check } from 'lucide-react';
import { Professional } from '../../types/clinical';

interface Props {
  professionals: Professional[];
  selectedProfIds: string[];
  isLoading: boolean;
  toggleProfessional: (id: string) => void;
  selectAll: () => void;
  selectNone: () => void;
}

export const AgendaFilters = ({ professionals, selectedProfIds, isLoading, toggleProfessional, selectAll, selectNone }: Props) => {
  return (
    <div className="bg-bg-main/30 border-b border-border-main px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-blue-600/10 text-blue-500 rounded-xl">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-[11px] font-black text-text-main uppercase tracking-widest leading-none">Visor de Turnos</h2>
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-40 mt-1">
            {isLoading ? 'Cargando...' : 'Sincronización en tiempo real'}
          </p>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-1" />}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Todos / Ninguno */}
        {professionals.length > 1 && (
          <div className="flex items-center gap-1 mr-2 border-r border-border-main pr-3">
            <button
              onClick={selectAll}
              title="Seleccionar todos"
              className="p-1.5 rounded-lg hover:bg-bg-main text-text-muted hover:text-emerald-500 transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={selectNone}
              title="Deseleccionar todos"
              className="p-1.5 rounded-lg hover:bg-bg-main text-text-muted hover:text-red-500 transition-all"
            >
              <MinusCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mr-1">
          <Filter className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Profs:</span>
        </div>

        {professionals.length === 0 && !isLoading && (
          <p className="text-[10px] text-text-muted opacity-50 italic">Sin profesionales registrados</p>
        )}

        {professionals.map((prof) => (
          <button
            key={prof.id}
            onClick={() => toggleProfessional(prof.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
              selectedProfIds.includes(prof.id)
                ? 'bg-bg-surface border-blue-500/60 shadow-sm ring-1 ring-blue-500/20'
                : 'opacity-30 hover:opacity-80 border-transparent hover:border-border-main/30'
            }`}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 transition-all"
              style={{ backgroundColor: prof.color || '#3b82f6' }}
            >
              {selectedProfIds.includes(prof.id) ? <Check className="w-2.5 h-2.5" strokeWidth={4} /> : prof.name.charAt(0)}
            </div>
            <span className="text-[10px] font-black text-text-main uppercase tracking-tight whitespace-nowrap">
              {prof.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
