import React from 'react';
import { Badge } from '../ui/Badge';

interface ToothProps {
  number: number;
  status: string;
  onClick: (number: number) => void;
}

const Tooth = ({ number, status, onClick }: ToothProps) => {
  const getStatusStyles = (s: string) => {
    switch (s) {
      case 'CARIES': 
        return {
          fill: 'url(#gradient-red)',
          stroke: '#ef4444',
          shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
          glow: 'bg-red-500/10'
        };
      case 'REPAIR': 
        return {
          fill: 'url(#gradient-blue)',
          stroke: '#3b82f6',
          shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
          glow: 'bg-blue-500/10'
        };
      case 'EXTRACTION': 
        return {
          fill: 'rgba(71, 85, 105, 0.1)',
          stroke: '#475569',
          shadow: 'opacity-20 grayscale',
          glow: 'bg-slate-500/5'
        };
      case 'HEALTHY': 
        return {
          fill: 'url(#gradient-white)',
          stroke: '#10b981',
          shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.1)]',
          glow: 'bg-emerald-500/5'
        };
      default: 
        return {
          fill: 'rgba(255,255,255,0.05)',
          stroke: '#334155',
          shadow: '',
          glow: ''
        };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <div 
      onClick={() => onClick(number)}
      className={`flex flex-col items-center cursor-pointer group transition-all duration-300 relative p-1 rounded-xl ${styles.glow} hover:scale-110`}
    >
      <span className="text-[9px] font-black text-text-muted group-hover:text-blue-500 transition-colors uppercase tracking-widest">{number}</span>
      
      <svg width="34" height="44" viewBox="0 0 34 44" className={`mt-1 transition-all duration-500 ${styles.shadow}`}>
        <defs>
          <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="gradient-white" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
        <path 
          d="M6 12 Q17 2 28 12 L28 32 Q17 42 6 32 Z" 
          fill={styles.fill}
          stroke={styles.stroke}
          strokeWidth="2"
          className="transition-all duration-500"
        />
        {status === 'CARIES' && (
           <circle cx="17" cy="22" r="5" fill="black" opacity="0.2" className="animate-pulse" />
        )}
      </svg>
      
      {/* Suggestion Tooltip (Simplified for now) */}
      {status === 'CARIES' && (
        <div className="absolute -top-6 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          SUGERENCIA: RESINA
        </div>
      )}
    </div>
  );
};

interface OdontogramProps {
  data: Record<number, string>;
  onToothClick: (number: number) => void;
}

export default function Odontogram({ data, onToothClick }: OdontogramProps) {
  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];

  return (
    <div className="bg-bg-main/30 p-10 rounded-[2.5rem] border border-border-main/50 shadow-inner overflow-x-auto relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="min-w-[700px] flex flex-col gap-10 relative">
        {/* Upper Arch */}
        <div className="flex justify-center gap-6">
          <div className="flex gap-2.5">
            {upperRight.map(n => <Tooth key={n} number={n} status={data[n] || 'HEALTHY'} onClick={onToothClick} />)}
          </div>
          <div className="w-[1px] bg-border-main/50 mx-2 self-stretch"></div>
          <div className="flex gap-2.5">
            {upperLeft.map(n => <Tooth key={n} number={n} status={data[n] || 'HEALTHY'} onClick={onToothClick} />)}
          </div>
        </div>

        {/* Mid Divider */}
        <div className="h-[1px] bg-border-main/30 w-full relative">
           <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-surface px-6 py-1 border border-border-main/50 rounded-full text-[9px] font-black text-text-muted uppercase tracking-[0.3em] backdrop-blur-xl">
              Plano de Oclusión
           </div>
        </div>

        {/* Lower Arch */}
        <div className="flex justify-center gap-6">
          <div className="flex gap-2.5">
            {lowerRight.reverse().map(n => <Tooth key={n} number={n} status={data[n] || 'HEALTHY'} onClick={onToothClick} />)}
          </div>
          <div className="w-[1px] bg-border-main/50 mx-2 self-stretch"></div>
          <div className="flex gap-2.5">
            {lowerLeft.map(n => <Tooth key={n} number={n} status={data[n] || 'HEALTHY'} onClick={onToothClick} />)}
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4 border-t border-border-main/30 pt-8">
        <Badge variant="emerald">Sano</Badge>
        <Badge variant="red">Caries / Infección</Badge>
        <Badge variant="blue">Restauración / Perno</Badge>
        <Badge variant="slate">Ausente / Extraído</Badge>
      </div>
    </div>
  );
}
