import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, Bell } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "react-router-dom";
const routeTitles = {
    "/": "Dashboard",
    "/pacientes": "Pacientes",
    "/agenda": "Agenda",
    "/obras-sociales": "Obras Sociales",
    "/configuracion": "Configuración",
};
export default function Topbar() {
    const location = useLocation();
    const title = routeTitles[location.pathname] ?? "Detalle";
    const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
    return (_jsx("header", { className: "h-[80px] flex items-center justify-between px-8 sticky top-0 z-[60] transition-colors duration-500", children: _jsxs("div", { className: "flex-1 glass-light rounded-3xl h-16 flex items-center justify-between px-8 shadow-glass border border-white/20 dark:border-white/5", children: [_jsx("h1", { className: "text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tighter", children: title }), _jsxs("div", { className: "flex items-center gap-8", children: [_jsxs("div", { className: "relative group hidden md:block", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" }), _jsx("input", { type: "text", placeholder: "Buscar por DNI o nombre...", className: "w-80 bg-slate-100/50 dark:bg-white/5 border-none rounded-2xl pl-11 pr-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400" })] }), _jsxs("div", { className: "flex items-center gap-6 pl-6 border-l border-slate-200 dark:border-white/10", children: [_jsxs("div", { className: "text-right hidden sm:block", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest", children: today }), _jsx("p", { className: "text-[11px] font-black text-primary uppercase tracking-tighter", children: "Sincronizado" })] }), _jsxs("button", { className: "relative p-3 bg-slate-950 dark:bg-white hover:scale-105 rounded-2xl transition-all group shadow-xl", children: [_jsx(Bell, { className: "w-5 h-5 text-white dark:text-slate-950" }), _jsx("span", { className: "absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950 dark:border-white animate-pulse" })] })] })] })] }) }));
}
