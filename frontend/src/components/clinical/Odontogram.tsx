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
  labelPos?: 'top' | 'bottom';
}

const getFaceColor = (s?: string) => {
  if (s?.endsWith('_RED')) return '#ef4444';
  if (s?.endsWith('_BLUE')) return '#3b82f6';
  switch (s) {
    case 'CARIES': return '#ef4444'; // Red
    case 'REPAIR': return '#3b82f6'; // Blue
    case 'EXTRACTION': return '#475569'; // Slate
    case 'SEALANT': return '#10b981'; // Green
    default: return 'transparent';
  }
};

const Tooth = ({ number, state, onFaceClick, labelPos = 'top' }: ToothProps) => {
  const isExtracted = state.W?.startsWith('EXTRACTION');

  // Defines the top sector of the circular tooth.
  // We rotate this sector 90, 180, and 270 degrees to create the other sides.
  const FACE_PATH = "M -9.9 -9.9 A 14 14 0 0 1 9.9 -9.9 L 3.5 -3.5 A 5 5 0 0 0 -3.5 -3.5 Z";

  return (
    <div className={`relative flex flex-col items-center group p-1 w-10 ${isExtracted ? 'opacity-50' : 'hover:drop-shadow-lg transition-all'}`}>
      
      {labelPos === 'top' && (
        <span className="text-[11px] font-black text-text-muted select-none group-hover:text-blue-500 mb-1">
          {number}
        </span>
      )}
      
      <svg width="34" height="34" viewBox="0 0 34 34" className="cursor-pointer drop-shadow-sm group-hover:scale-105 transition-transform overflow-visible">
        <g transform="translate(17, 17)">
          {/* Top (T) */}
          <path d={FACE_PATH} fill={getFaceColor(state.T)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'T')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors" />
          
          {/* Right (R) - rotate 90 */}
          <g transform="rotate(90)">
             <path d={FACE_PATH} fill={getFaceColor(state.R)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'R')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors" />
          </g>

          {/* Bottom (B) - rotate 180 */}
          <g transform="rotate(180)">
             <path d={FACE_PATH} fill={getFaceColor(state.B)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'B')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors" />
          </g>

          {/* Left (L) - rotate 270 */}
          <g transform="rotate(270)">
             <path d={FACE_PATH} fill={getFaceColor(state.L)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'L')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors" />
          </g>

          {/* Center (C) */}
          <circle r="5" fill={getFaceColor(state.C)} stroke="#1e293b" strokeWidth="1" onClick={() => onFaceClick(number, 'C')} className="hover:fill-blue-500/30 hover:stroke-blue-500 transition-colors" />

          {/* Extras */}
          {state.W?.startsWith('EXTRACTION') && (
            <g className={`pointer-events-none ${state.W.includes('BLUE') ? 'stroke-blue-500' : 'stroke-red-500'}`} strokeWidth="3">
              <line x1="-15" y1="-15" x2="15" y2="15" />
              <line x1="15" y1="-15" x2="-15" y2="15" />
            </g>
          )}
          
          {state.W?.startsWith('CROWN') && (
            <circle r="15" fill="transparent" stroke={state.W.includes('BLUE') ? '#3b82f6' : '#ef4444'} strokeWidth="3" className="pointer-events-none" />
          )}

          {state.W?.startsWith('TC') && (
            <text x="0" y="5" textAnchor="middle" fill={state.W.includes('BLUE') ? '#3b82f6' : '#ef4444'} fontSize="14" fontWeight="bold" className="pointer-events-none">TC</text>
          )}

          {state.W?.startsWith('EQUAL') && (
            <g className={`pointer-events-none ${state.W.includes('BLUE') ? 'stroke-blue-500' : 'stroke-red-500'}`} strokeWidth="2.5">
              <line x1="-12" y1="-4" x2="12" y2="-4" />
              <line x1="-12" y1="4" x2="12" y2="4" />
            </g>
          )}

          {state.W?.startsWith('BRIDGE_TOP') && (
            <path d="M -16 -10 L -16 -20 L 16 -20 L 16 -10" fill="none" stroke={state.W.includes('BLUE') ? '#3b82f6' : '#ef4444'} strokeWidth="2.5" className="pointer-events-none" />
          )}

          {state.W?.startsWith('BRIDGE_BOTTOM') && (
            <path d="M -16 10 L -16 20 L 16 20 L 16 10" fill="none" stroke={state.W.includes('BLUE') ? '#3b82f6' : '#ef4444'} strokeWidth="2.5" className="pointer-events-none" />
          )}
        </g>
      </svg>
      
      {labelPos === 'bottom' && (
        <span className="text-[11px] font-black text-text-muted select-none group-hover:text-blue-500 mt-1">
          {number}
        </span>
      )}

      {/* Action button */}
      <button 
        onClick={() => onFaceClick(number, 'W')}
        className={`absolute ${labelPos === 'top' ? '-bottom-3' : '-top-3'} opacity-0 group-hover:opacity-100 text-[8px] font-black uppercase text-blue-400 hover:text-white px-2 py-0.5 rounded bg-bg-surface border border-blue-500/30 transition-opacity z-20 shadow-lg`}
      >
        Opc
      </button>
    </div>
  );
};

interface OdontogramProps {
  data: Record<number, string>;
  onFaceClick: (number: number, face: ToothFace) => void;
}

export default function Odontogram({ data, onFaceClick }: OdontogramProps) {
  const renderTooth = (num: number, labelPos: 'top' | 'bottom') => {
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
        labelPos={labelPos}
      />
    );
  };

  return (
    <div className="w-full bg-bg-surface/30 border border-border-main/50 rounded-3xl p-8 flex flex-col items-center gap-12 overflow-x-auto shadow-inner relative">
      <div className="flex flex-col gap-6 items-center min-w-max relative z-10">
        
        {/* Superior Arch */}
        <div className="flex flex-col gap-8 items-center">
          {/* Adult Top */}
          <div className="flex justify-center gap-8 md:gap-12">
            <div className="flex gap-2 w-[376px] justify-end">
              {[18, 17, 16, 15, 14, 13, 12, 11].map(n => renderTooth(n, 'top'))}
            </div>
            <div className="flex gap-2 w-[376px] justify-start">
              {[21, 22, 23, 24, 25, 26, 27, 28].map(n => renderTooth(n, 'top'))}
            </div>
          </div>
          
          {/* Child Top */}
          <div className="flex justify-center gap-8 md:gap-12">
            <div className="flex gap-2 w-[376px] justify-end">
              {[55, 54, 53, 52, 51].map(n => renderTooth(n, 'top'))}
            </div>
            <div className="flex gap-2 w-[376px] justify-start">
              {[61, 62, 63, 64, 65].map(n => renderTooth(n, 'top'))}
            </div>
          </div>
        </div>

        {/* Central Divider */}
        <div className="w-full h-px bg-border-main/30 flex items-center justify-center my-4">
            <span className="bg-bg-surface px-4 py-1 text-[9px] uppercase tracking-[0.3em] font-black text-text-muted rounded-full border border-border-main/50 shadow-sm">
                Odontograma
            </span>
        </div>

        {/* Inferior Arch */}
        <div className="flex flex-col gap-8 items-center">
          {/* Child Bottom */}
          <div className="flex justify-center gap-8 md:gap-12">
            <div className="flex gap-2 w-[376px] justify-end">
              {[85, 84, 83, 82, 81].map(n => renderTooth(n, 'bottom'))}
            </div>
            <div className="flex gap-2 w-[376px] justify-start">
              {[71, 72, 73, 74, 75].map(n => renderTooth(n, 'bottom'))}
            </div>
          </div>

          {/* Adult Bottom */}
          <div className="flex justify-center gap-8 md:gap-12">
            <div className="flex gap-2 w-[376px] justify-end">
              {[48, 47, 46, 45, 44, 43, 42, 41].map(n => renderTooth(n, 'bottom'))}
            </div>
            <div className="flex gap-2 w-[376px] justify-start">
              {[31, 32, 33, 34, 35, 36, 37, 38].map(n => renderTooth(n, 'bottom'))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


