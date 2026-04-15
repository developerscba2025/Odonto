import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../../lib/utils";
// Standard FDI adult tooth numbering
// Top right to left: 18..11, 21..28
// Bottom right to left: 48..41, 31..38
const TOP_TEETH = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28
];
const BOTTOM_TEETH = [
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];
export const CONDITIONS = [
    { id: 'HEALTHY', label: 'Sano', color: 'bg-white border-slate-300' },
    { id: 'CARIES', label: 'Caries', color: 'bg-rose-500 border-rose-600' },
    { id: 'FILLED', label: 'Restaurado', color: 'bg-blue-500 border-blue-600' },
    { id: 'EXTRACTED', label: 'Extraído', color: 'bg-slate-800 border-black' },
    { id: 'CROWN', label: 'Corona', color: 'bg-amber-400 border-amber-500' },
    { id: 'ROOT_CANAL', label: 'Endodoncia', color: 'bg-purple-500 border-purple-600' },
];
export default function Odontogram({ conditions, onToothClick, readOnly = false }) {
    const getToothStyle = (toothNumber) => {
        const conditionId = conditions[toothNumber] || 'HEALTHY';
        const condition = CONDITIONS.find(c => c.id === conditionId);
        return condition?.color || 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700';
    };
    const TOOTH_COORDS = {
        // Maxilar Superior
        18: { x: 40, y: 240, rot: -75 },
        17: { x: 45, y: 190, rot: -60 },
        16: { x: 60, y: 140, rot: -45 },
        15: { x: 80, y: 95, rot: -35 },
        14: { x: 105, y: 60, rot: -25 },
        13: { x: 140, y: 35, rot: -15 },
        12: { x: 180, y: 20, rot: -5 },
        11: { x: 220, y: 15, rot: 0 },
        21: { x: 260, y: 15, rot: 0 },
        22: { x: 300, y: 20, rot: 5 },
        23: { x: 340, y: 35, rot: 15 },
        24: { x: 375, y: 60, rot: 25 },
        25: { x: 400, y: 95, rot: 35 },
        26: { x: 420, y: 140, rot: 45 },
        27: { x: 435, y: 190, rot: 60 },
        28: { x: 440, y: 240, rot: 75 },
        // Mandíbula
        48: { x: 40, y: 20, rot: -105 },
        47: { x: 45, y: 70, rot: -120 },
        46: { x: 60, y: 120, rot: -135 },
        45: { x: 80, y: 165, rot: -145 },
        44: { x: 105, y: 200, rot: -155 },
        43: { x: 140, y: 225, rot: -165 },
        42: { x: 180, y: 240, rot: -175 },
        41: { x: 220, y: 245, rot: 180 },
        31: { x: 260, y: 245, rot: -180 },
        32: { x: 300, y: 240, rot: 175 },
        33: { x: 340, y: 225, rot: 165 },
        34: { x: 375, y: 200, rot: 155 },
        35: { x: 400, y: 165, rot: 145 },
        36: { x: 420, y: 120, rot: 135 },
        37: { x: 435, y: 70, rot: 120 },
        38: { x: 440, y: 20, rot: 105 },
    };
    const renderToothInfo = (num, isTop) => {
        const coords = TOOTH_COORDS[num];
        if (!coords)
            return null;
        return (_jsxs("button", { type: "button", disabled: readOnly, onClick: () => onToothClick(num), style: {
                left: coords.x,
                top: coords.y,
                transform: `rotate(${coords.rot}deg)`
            }, className: cn("absolute flex flex-col items-center justify-center w-8 h-10 group z-10", !readOnly && "hover:drop-shadow-lg dark:hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all"), children: [_jsx("div", { className: "absolute -top-7 flex items-center justify-center", children: _jsx("span", { style: { transform: `rotate(${-coords.rot}deg)` }, className: "text-[10px] font-black text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors block px-1", children: num }) }), _jsx("div", { className: cn("w-7 h-9 border-2 shadow-sm transition-all duration-300", "rounded-t-sm rounded-b-md", getToothStyle(num)) })] }, num));
    };
    return (_jsxs("div", { className: "flex flex-col items-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-white/5 overflow-hidden relative transition-colors duration-300", children: [_jsx("div", { className: "absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-200/50 dark:bg-white/5 -translate-x-1/2" }), _jsx("div", { className: "absolute left-0 right-0 top-1/2 h-[1px] bg-slate-200/50 dark:bg-white/5 -translate-y-1/2" }), _jsxs("div", { className: "relative w-[500px] h-[300px] z-10", children: [TOP_TEETH.map(num => renderToothInfo(num, true)), _jsx("span", { className: "absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em] bg-slate-50 dark:bg-slate-900 px-6 py-1 rounded-full border border-slate-100 dark:border-white/5 transition-colors", children: "Maxilar Superior" })] }), _jsxs("div", { className: "relative w-[500px] h-[300px] mt-12 z-10", children: [BOTTOM_TEETH.map(num => renderToothInfo(num, false)), _jsx("span", { className: "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em] bg-slate-50 dark:bg-slate-900 px-6 py-1 rounded-full border border-slate-100 dark:border-white/5 transition-colors", children: "Mand\u00EDbula Inferior" })] })] }));
}
