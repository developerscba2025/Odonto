import React from 'react';
import { cn } from '../../lib/utils'; // Make sure this path applies or remove it if unused, wait we can just use template literals.

export type ToothFace = 'T' | 'B' | 'L' | 'R' | 'C' | 'W';

export interface ToothState {
  T?: string; 
  B?: string; 
  L?: string; 
  R?: string; 
  C?: string; 
  W?: string; 
}

interface ToothProps {
  number: number;
  state: ToothState;
  onFaceClick: (number: number, face: ToothFace) => void;
  style?: React.CSSProperties;
}

const getFaceColor = (s?: string) => {
  switch (s) {
    case 'CARIES': return '#ef4444'; // Red
    case 'REPAIR': return '#3b82f6'; // Blue
    case 'EXTRACTION': return '#475569'; // Slate
    case 'SEALANT': return '#10b981'; // Green
    default: return 'transparent';
  }
};

const Tooth = ({ number, state, onFaceClick, style }: ToothProps) => {
  const isExtracted = state.W === 'EXTRACTION';

  return (
    <div 
      className={`absolute flex flex-col items-center group z-10 p-0.5 rounded transition-all ${isExtracted ? 'opacity-30 grayscale' : 'hover:drop-shadow-lg'}`}
      style={style}
    >
      <div className="absolute -top-[1.4rem] flex justify-center w-full">
         <span className="text-[10px] font-black text-text-muted select-none group-hover:text-blue-500 transition-colors">
            {number}
         </span>
      </div>
      
      {/* 5-faces SVG */}
      <svg width="34" height="34" viewBox="0 0 34 34" className="cursor-pointer drop-shadow-sm border border-transparent rounded group-hover:border-blue-500/20">
        <defs>
          <radialGradient id={`grad-c-${number}`} cx="50%" cy="50%" r="50%">
             <stop offset="70%" stopColor={getFaceColor(state.C)} stopOpacity={state.C ? 1 : 0} />
             <stop offset="100%" stopColor="#273548" stopOpacity={0.2} />
          </radialGradient>
        </defs>

        <g>
          <polygon points="0,0 10,10 10,24 0,34" fill={getFaceColor(state.L)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'L')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"/>
          <polygon points="34,0 24,10 24,24 34,34" fill={getFaceColor(state.R)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'R')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"/>
          <polygon points="0,0 34,0 24,10 10,10" fill={getFaceColor(state.T)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'T')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"/>
          <polygon points="0,34 34,34 24,24 10,24" fill={getFaceColor(state.B)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'B')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"/>
          <polygon points="10,10 24,10 24,24 10,24" fill={state.C ? getFaceColor(state.C) : `url(#grad-c-${number})`} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'C')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"/>
        </g>

        {isExtracted && (
          <g className="pointer-events-none stroke-slate-500" strokeWidth="3">
            <line x1="0" y1="0" x2="34" y2="34" />
            <line x1="34" y1="0" x2="0" y2="34" />
          </g>
        )}
        
        {state.W === 'CROWN' && (
          <circle cx="17" cy="17" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="3" className="pointer-events-none" />
        )}
      </svg>
      
      {/* Botón para acción total (Extracción/Corona) */}
      <button 
        onClick={() => onFaceClick(number, 'W')}
        className="mt-0.5 text-[7px] font-black uppercase text-text-muted hover:text-white px-1 py-0.5 rounded bg-bg-surface border border-border-main"
      >
        Opc.
      </button>
    </div>
  );
};

interface OdontogramProps {
  data: Record<number, string>;
  onFaceClick: (number: number, face: ToothFace) => void;
}

const TOOTH_COORDS: Record<number, { x: number; y: number; rot: number }> = {
  // Maxilar Superior
  18: { x: 40,  y: 240, rot: -75 },
  17: { x: 45,  y: 190,  rot: -60 },
  16: { x: 60,  y: 140,  rot: -45 },
  15: { x: 80,  y: 95,   rot: -35 },
  14: { x: 105, y: 60,   rot: -25 },
  13: { x: 140, y: 35,   rot: -15 },
  12: { x: 180, y: 20,   rot: -5 },
  11: { x: 220, y: 15,   rot: 0 },

  21: { x: 260, y: 15,   rot: 0 },
  22: { x: 300, y: 20,   rot: 5 },
  23: { x: 340, y: 35,   rot: 15 },
  24: { x: 375, y: 60,   rot: 25 },
  25: { x: 400, y: 95,   rot: 35 },
  26: { x: 420, y: 140,  rot: 45 },
  27: { x: 435, y: 190,  rot: 60 },
  28: { x: 440, y: 240,  rot: 75 },

  // Mandíbula
  48: { x: 40,  y: 20,   rot: -105 },
  47: { x: 45,  y: 70,   rot: -120 },
  46: { x: 60,  y: 120,  rot: -135 },
  45: { x: 80,  y: 165,  rot: -145 },
  44: { x: 105, y: 200,  rot: -155 },
  43: { x: 140, y: 225,  rot: -165 },
  42: { x: 180, y: 240,  rot: -175 },
  41: { x: 220, y: 245,  rot: 180 },

  31: { x: 260, y: 245,  rot: -180 },
  32: { x: 300, y: 240,  rot: 175 },
  33: { x: 340, y: 225,  rot: 165 },
  34: { x: 375, y: 200,  rot: 155 },
  35: { x: 400, y: 165,  rot: 145 },
  36: { x: 420, y: 120,  rot: 135 },
  37: { x: 435, y: 70,   rot: 120 },
  38: { x: 440, y: 20,   rot: 105 },
};

export default function Odontogram({ data, onFaceClick }: OdontogramProps) {
  const TOP_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const BOTTOM_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const renderCurrentTooth = (num: number) => {
    const coords = TOOTH_COORDS[num];
    if (!coords) return null;

    let state: ToothState = {};
    if (data[num]) {
      try {
        if (data[num].startsWith('{')) state = JSON.parse(data[num]);
        else state = { W: data[num] };
      } catch(e) {}
    }

    return (
      <Tooth 
        key={num} 
        number={num} 
        state={state} 
        onFaceClick={onFaceClick} 
        style={{
          left: coords.x, 
          top: coords.y, 
          // Reverse rotation of label text by doing it in the span itself
          transform: `rotate(${coords.rot}deg)` 
        }} 
      />
    );
  };

  return (
    <div className="w-full bg-bg-main/30 border border-border-main/50 rounded-[2rem] py-8 sm:py-12 flex flex-col items-center gap-4 overflow-x-auto shadow-inner relative transition-colors duration-300">
      
      {/* Background structural lines */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-border-main/80 -translate-x-1/2 pointer-events-none" />
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-border-main/80 -translate-y-1/2 pointer-events-none" />

      {/* Top Arch */}
      <div className="relative w-[500px] h-[300px] z-10 shrink-0 mx-auto mt-6">
        <div className="absolute -top-12 w-full text-center">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] bg-bg-surface px-6 py-1.5 rounded-full border border-border-main/50 shadow-sm">Maxilar Superior</span>
        </div>
        {TOP_TEETH.map(num => renderCurrentTooth(num))}
      </div>

      {/* Bottom Arch */}
      <div className="relative w-[500px] h-[300px] mt-16 mb-8 z-10 shrink-0 mx-auto">
         <div className="absolute -bottom-10 w-full text-center">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] bg-bg-surface px-6 py-1.5 rounded-full border border-border-main/50 shadow-sm">Mandíbula Inferior</span>
        </div>
        {BOTTOM_TEETH.map(num => renderCurrentTooth(num))}
      </div>

    </div>
  );
}

