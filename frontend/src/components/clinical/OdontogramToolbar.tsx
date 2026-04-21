import { Eraser } from 'lucide-react';

interface Props {
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  activeColor: 'RED' | 'BLUE';
  setActiveColor: (color: 'RED' | 'BLUE') => void;
}

export const OdontogramToolbar = ({ activeTool, setActiveTool, activeColor, setActiveColor }: Props) => {
  return (
    <div className="flex flex-row items-center justify-center gap-3 p-3 bg-bg-surface/80 backdrop-blur-xl rounded-[1.5rem] border border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] w-full overflow-x-auto">
      
      {/* Selector de Color */}
      <div className="flex bg-bg-main rounded-xl p-1 border border-border-main/50">
        <button
          onClick={() => setActiveColor('RED')}
          title="Rojo (Plan / Caries)"
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            activeColor === 'RED' ? 'bg-red-500 shadow-md scale-105' : 'bg-transparent hover:bg-red-500/20'
          }`}
        >
          <div className={`w-4 h-4 rounded-full ${activeColor === 'RED' ? 'bg-white' : 'bg-red-500'}`} />
        </button>
        <button
          onClick={() => setActiveColor('BLUE')}
          title="Azul (Realizado / Restauración)"
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            activeColor === 'BLUE' ? 'bg-blue-500 shadow-md scale-105' : 'bg-transparent hover:bg-blue-500/20'
          }`}
        >
          <div className={`w-4 h-4 rounded-full ${activeColor === 'BLUE' ? 'bg-white' : 'bg-blue-500'}`} />
        </button>
      </div>

      <div className="w-px h-10 bg-border-main mx-2 flex-shrink-0" />

      {/* Corona */}
      <button 
        onClick={() => setActiveTool(activeTool === 'CROWN' ? null : 'CROWN')}
        title="Corona"
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-xl font-black uppercase rounded-2xl border transition-all duration-300 ${
          activeTool === 'CROWN' ? (activeColor === 'RED' ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] scale-110' : 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-110') : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/5 hover:text-text-main'
        }`}
      >
        O
      </button>
      
      {/* Extracción */}
      <button 
        onClick={() => setActiveTool(activeTool === 'EXTRACTION' ? null : 'EXTRACTION')}
        title="Extracción"
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-xl font-black uppercase rounded-2xl border transition-all duration-300 ${
          activeTool === 'EXTRACTION' ? (activeColor === 'RED' ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] scale-110' : 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-110') : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/5 hover:text-text-main'
        }`}
      >
        X
      </button>
      
      {/* TC */}
      <button 
        onClick={() => setActiveTool(activeTool === 'TC' ? null : 'TC')}
        title="Tratamiento de Conducto"
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-lg font-black uppercase rounded-2xl border transition-all duration-300 ${
          activeTool === 'TC' ? (activeColor === 'RED' ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] scale-110' : 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-110') : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/5 hover:text-text-main'
        }`}
      >
        TC
      </button>
      
      {/* EQUAL */}
      <button 
        onClick={() => setActiveTool(activeTool === 'EQUAL' ? null : 'EQUAL')}
        title="Diastema / Sellador"
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl font-black rounded-2xl border transition-all duration-300 ${
          activeTool === 'EQUAL' ? (activeColor === 'RED' ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] scale-110' : 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-110') : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/5 hover:text-text-main'
        }`}
      >
        =
      </button>
      
      {/* P. Top */}
      <button 
        onClick={() => setActiveTool(activeTool === 'BRIDGE_TOP' ? null : 'BRIDGE_TOP')}
        title="Prótesis Superior"
        style={{ fontFamily: 'monospace' }}
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-xl font-bold tracking-tighter rounded-2xl border transition-all duration-300 ${
          activeTool === 'BRIDGE_TOP' ? (activeColor === 'RED' ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] scale-110' : 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-110') : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/5 hover:text-text-main'
        }`}
      >
        ┌┐
      </button>
      
      {/* P. Bottom */}
      <button 
        onClick={() => setActiveTool(activeTool === 'BRIDGE_BOTTOM' ? null : 'BRIDGE_BOTTOM')}
        title="Prótesis Inferior"
        style={{ fontFamily: 'monospace' }}
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center text-xl font-bold tracking-tighter rounded-2xl border transition-all duration-300 ${
          activeTool === 'BRIDGE_BOTTOM' ? (activeColor === 'RED' ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] scale-110' : 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-110') : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/5 hover:text-text-main'
        }`}
      >
        └┘
      </button>

      <div className="w-px h-10 bg-border-main mx-2 flex-shrink-0" />

      {/* PINTAR */}
      <button 
        onClick={() => setActiveTool(activeTool === 'PAINT' ? null : 'PAINT')}
        title="Pintar Caras"
        className={`flex-shrink-0 px-5 h-12 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider rounded-2xl border transition-all duration-300 ${
          activeTool === 'PAINT' ? (activeColor === 'RED' ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] scale-105' : 'bg-blue-500 text-white border-blue-500 shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-105') : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/5 hover:text-text-main'
        }`}
      >
        <div className={`w-3 h-3 rounded-full border-2 ${activeTool === 'PAINT' ? 'border-white/50 bg-white' : 'border-current bg-transparent'}`} />
        Pintar
      </button>

      <div className="w-px h-10 bg-border-main mx-2 flex-shrink-0" />

      {/* ERASER */}
      <button 
        onClick={() => setActiveTool(activeTool === 'ERASE' ? null : 'ERASE')}
        title="Borrador"
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-300 ${
          activeTool === 'ERASE' ? 'bg-text-main text-bg-main border-text-main shadow-[0_4px_15px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.2)] scale-110' : 'bg-transparent border-border-main/50 text-text-muted hover:bg-text-main/10 hover:text-text-main hover:border-text-main/30'
        }`}
      >
        <Eraser className="w-5 h-5" />
      </button>

    </div>
  );
};
