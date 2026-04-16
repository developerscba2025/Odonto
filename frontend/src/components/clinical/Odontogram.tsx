import React from 'react';

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

const Tooth = ({ number, state, onFaceClick }: ToothProps) => {
  // If whole tooth is extracted, grayscale it
  const isExtracted = state.W === 'EXTRACTION';

  return (
    <div className={`flex flex-col items-center group transition-all relative p-0.5 rounded ${isExtracted ? 'opacity-30 grayscale' : 'hover:scale-105'}`}>
      <span className="text-[9px] font-black text-text-muted mb-0.5 select-none">{number}</span>
      
      {/* 5-faces SVG: T: top, B: bottom, L: left, R: right, C: center */}
      <svg width="34" height="34" viewBox="0 0 34 34" className="cursor-pointer">
        <defs>
          <radialGradient id="grad-c" cx="50%" cy="50%" r="50%">
             <stop offset="70%" stopColor={getFaceColor(state.C)} stopOpacity={state.C ? 1 : 0} />
             <stop offset="100%" stopColor="#273548" stopOpacity={0.2} />
          </radialGradient>
        </defs>

        {/* Global wrapper for extraction cross */}
        <g>
          {/* L: Left Face */}
          <polygon 
            points="0,0 10,10 10,24 0,34" 
            fill={getFaceColor(state.L)}
            stroke="#1e293b" strokeWidth="1"
            className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"
            onClick={() => onFaceClick(number, 'L')}
          />
          {/* R: Right Face */}
          <polygon 
            points="34,0 24,10 24,24 34,34" 
            fill={getFaceColor(state.R)}
            stroke="#1e293b" strokeWidth="1"
            className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"
            onClick={() => onFaceClick(number, 'R')}
          />
          {/* T: Top Face */}
          <polygon 
            points="0,0 34,0 24,10 10,10" 
            fill={getFaceColor(state.T)}
            stroke="#1e293b" strokeWidth="1"
            className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"
            onClick={() => onFaceClick(number, 'T')}
          />
          {/* B: Bottom Face */}
          <polygon 
            points="0,34 34,34 24,24 10,24" 
            fill={getFaceColor(state.B)}
            stroke="#1e293b" strokeWidth="1"
            className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"
            onClick={() => onFaceClick(number, 'B')}
          />
          {/* C: Center Face */}
          <polygon 
            points="10,10 24,10 24,24 10,24" 
            fill={state.C ? getFaceColor(state.C) : 'url(#grad-c)'}
            stroke="#1e293b" strokeWidth="1"
            className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors"
            onClick={() => onFaceClick(number, 'C')}
          />
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
        className="mt-1 text-[7px] font-black uppercase text-text-muted hover:text-white px-1.5 py-0.5 rounded bg-bg-surface border border-border-main"
      >
        Diente
      </button>
    </div>
  );
};

interface OdontogramProps {
  data: Record<number, string>; // The string is JSON.stringify(ToothState)
  onFaceClick: (number: number, face: ToothFace) => void;
}

export default function Odontogram({ data, onFaceClick }: OdontogramProps) {
  // Adult teeth
  const topAdultLeft = [18, 17, 16, 15, 14, 13, 12, 11];
  const topAdultRight = [21, 22, 23, 24, 25, 26, 27, 28];
  const bottomAdultLeft = [48, 47, 46, 45, 44, 43, 42, 41];
  const bottomAdultRight = [31, 32, 33, 34, 35, 36, 37, 38];

  // Kids teeth
  const topKidLeft = [55, 54, 53, 52, 51];
  const topKidRight = [61, 62, 63, 64, 65];
  const bottomKidLeft = [85, 84, 83, 82, 81];
  const bottomKidRight = [71, 72, 73, 74, 75];

  const renderQuadrant = (teeth: number[]) => (
    <div className="flex gap-1 sm:gap-2">
      {teeth.map(num => {
        let state: ToothState = {};
        if (data[num]) {
          try {
            // Check if string is legacy vs JSON
            if (data[num].startsWith('{')) {
              state = JSON.parse(data[num]);
            } else {
              state = { W: data[num] };
            }
          } catch(e) {}
        }
        return <Tooth key={num} number={num} state={state} onFaceClick={onFaceClick} />;
      })}
    </div>
  );

  return (
    <div className="w-full bg-bg-main/30 border border-border-main/50 rounded-[2rem] p-4 sm:p-8 flex flex-col items-center gap-8 overflow-x-auto shadow-inner">
      {/* Selector de Herramienta Global? En esta versión los clics ciclan por estados en el contenedor padre */}
      
      {/* Top Adult */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-center justify-center border-b-2 border-border-main/30 pb-4">
        {renderQuadrant(topAdultLeft)}
        {renderQuadrant(topAdultRight)}
      </div>
      
      {/* Top Kids */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center opacity-80 scale-90 -my-4">
        {renderQuadrant(topKidLeft)}
        {renderQuadrant(topKidRight)}
      </div>
      
      {/* Bottom Kids */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center opacity-80 scale-90 -my-4">
        {renderQuadrant(bottomKidLeft)}
        {renderQuadrant(bottomKidRight)}
      </div>

      {/* Bottom Adult */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-center justify-center border-t-2 border-border-main/30 pt-4">
        {renderQuadrant(bottomAdultLeft)}
        {renderQuadrant(bottomAdultRight)}
      </div>
    </div>
  );
}
