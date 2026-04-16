import React from 'react';

interface MiniOdontogramProps {
  entries: { toothNumber: number; status: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  HEALTHY: 'bg-transparent border border-border-main/50',
  CARIES: 'bg-red-500 shadow-md shadow-red-500/20 border-red-500',
  REPAIR: 'bg-blue-500 shadow-md shadow-blue-500/20 border-blue-500',
  EXTRACTION: 'bg-zinc-800 shadow-md shadow-zinc-800/20 border-zinc-700',
};

const getStatusColor = (number: number, entries: { toothNumber: number; status: string }[]) => {
  const entry = entries.find(e => e.toothNumber === number);
  if (!entry) return STATUS_COLORS.HEALTHY;
  return STATUS_COLORS[entry.status] || STATUS_COLORS.HEALTHY;
};

// Generates an array from start to end (inclusive)
const range = (start: number, end: number) => {
  const result = [];
  if (start < end) {
    for (let i = start; i <= end; i++) result.push(i);
  } else {
    for (let i = start; i >= end; i--) result.push(i);
  }
  return result;
};

const ToothRow = ({ rowTeeth, entries }: { rowTeeth: number[], entries: { toothNumber: number; status: string }[] }) => (
  <div className="flex gap-1">
    {rowTeeth.map(num => (
      <div 
        key={num} 
        data-number={num}
        title={`Pieza ${num}`}
        className={`w-4 h-5 rounded-sm flex items-center justify-center text-[7px] font-bold ${getStatusColor(num, entries)} transition-all`}
      >
        <span className="opacity-0 hover:opacity-100 text-white drop-shadow-md">{num}</span>
      </div>
    ))}
  </div>
);

export const MiniOdontogram: React.FC<MiniOdontogramProps> = ({ entries }) => {
  const topRight = range(18, 11);
  const topLeft = range(21, 28);
  const bottomRight = range(48, 41);
  const bottomLeft = range(31, 38);

  return (
    <div className="bg-bg-surface/30 p-4 rounded-3xl border border-border-main/50 flex flex-col gap-6 items-center w-full shadow-inner">
      <div className="w-full flex-col flex items-center gap-2">
        <div className="flex gap-2 relative">
          <ToothRow rowTeeth={topRight} entries={entries} />
          <ToothRow rowTeeth={topLeft} entries={entries} />
          {/* Central Divisor */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-border-main/30 -translate-x-1/2 h-full z-0" />
        </div>
        <div className="flex gap-2 relative">
          <ToothRow rowTeeth={bottomRight} entries={entries} />
          <ToothRow rowTeeth={bottomLeft} entries={entries} />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-border-main/30 -translate-x-1/2 h-full z-0" />
        </div>
      </div>
      
      {/* Leyenda minimalista */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-text-muted mt-2">
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border border-border-main/50"></div> Sana</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Caries</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Reparada</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-zinc-800"></div> Ausente</div>
      </div>
    </div>
  );
};
