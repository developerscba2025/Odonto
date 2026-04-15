import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, CalendarCheck, CalendarClock, CalendarX, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { PRACTICE_META, STATUS_META } from "@dentalflow/shared";
import { cn } from "../lib/utils";
import NewAppointmentModal from "../components/NewAppointmentModal";
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
        },
    },
};
export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const res = await api.get("/dashboard/stats");
            return res.data;
        },
    });
    const metrics = [
        { icon: CalendarCheck, label: "Turnos hoy", value: data?.metrics.turnsToday ?? "0", color: "text-emerald-600", bg: "bg-emerald-500/10" },
        { icon: Users, label: "Pacientes atendidos", value: data?.metrics.attendedPatients ?? "0", color: "text-violet-600", bg: "bg-violet-500/10" },
        { icon: CalendarClock, label: "Turnos pendientes", value: data?.metrics.pendingTurns ?? "0", color: "text-amber-600", bg: "bg-amber-500/10" },
        { icon: CalendarX, label: "Cancelaciones", value: data?.metrics.cancelledTurns ?? "0", color: "text-rose-600", bg: "bg-rose-500/10" },
    ];
    return (_jsxs(motion.div, { initial: "hidden", animate: "visible", variants: containerVariants, className: "max-w-[1400px] mx-auto space-y-8 pb-12", children: [_jsxs(motion.div, { variants: itemVariants, className: "flex flex-col md:flex-row md:items-end justify-between gap-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-4xl md:text-6xl font-display font-extrabold text-slate-950 dark:text-white tracking-tighter leading-none", children: ["Vista ", _jsx("span", { className: "text-primary italic", children: "General" })] }), _jsx("p", { className: "text-slate-500 dark:text-zinc-500 font-bold mt-4 uppercase tracking-[0.2em] text-xs", children: "Panel de control profesional" })] }), _jsxs("button", { onClick: () => setIsModalOpen(true), className: "btn-primary group", children: [_jsx("div", { className: "w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform", children: _jsx(Plus, { className: "w-4 h-4" }) }), "NUEVA CITA"] })] }), _jsxs("div", { className: "grid grid-cols-12 gap-6", children: [metrics.map((m, i) => (_jsx(motion.div, { variants: itemVariants, className: "col-span-12 md:col-span-6 lg:col-span-3 card-premium p-8 group overflow-hidden", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: cn("p-4 rounded-[1.5rem] transition-all duration-500 group-hover:scale-110", m.bg), children: _jsx(m.icon, { className: cn("w-6 h-6", m.color) }) }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1", children: m.label }), _jsx("h3", { className: "text-4xl font-display font-extrabold text-slate-950 dark:text-white", children: m.value })] })] }) }, i))), _jsxs(motion.div, { variants: itemVariants, className: "col-span-12 lg:col-span-8 card-premium flex flex-col min-h-[500px]", children: [_jsxs("div", { className: "p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight", children: "Agenda del d\u00EDa" }), _jsx("div", { className: "flex gap-2", children: _jsx("span", { className: "px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full", children: "En curso" }) })] }), _jsx("div", { className: "flex-1 overflow-x-auto", children: _jsxs("table", { className: "w-full text-left", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-slate-50/50 dark:bg-white/5", children: [_jsx("th", { className: "px-8 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest", children: "Hora" }), _jsx("th", { className: "px-8 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest", children: "Paciente" }), _jsx("th", { className: "px-8 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest", children: "Pr\u00E1ctica" }), _jsx("th", { className: "px-8 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest", children: "Estado" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-white/5", children: isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "px-8 py-12 text-center", children: _jsx(Loader2, { className: "w-10 h-10 text-primary animate-spin mx-auto" }) }) })) : data?.agenda.length === 0 ? (_jsx("tr", { children: _jsxs("td", { colSpan: 4, className: "px-8 py-24 text-center", children: [_jsx(CalendarClock, { className: "w-16 h-16 text-slate-100 dark:text-zinc-800 mx-auto mb-6" }), _jsx("p", { className: "text-lg font-display font-bold text-slate-400", children: "Sin pacientes agendados" })] }) })) : (data?.agenda.map((appt) => {
                                                const practice = PRACTICE_META[appt.practice] || PRACTICE_META.OTHER;
                                                const status = STATUS_META[appt.status.toUpperCase()] || STATUS_META.PENDING;
                                                return (_jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group", children: [_jsx("td", { className: "px-8 py-6 font-display font-extrabold text-xl text-slate-950 dark:text-white", children: appt.time }), _jsxs("td", { className: "px-8 py-6", children: [_jsx("p", { className: "text-base font-extrabold text-slate-900 dark:text-white", children: appt.patient }), _jsxs("p", { className: "text-xs font-bold text-slate-400 dark:text-zinc-500", children: ["Dr. ", appt.professional] })] }), _jsx("td", { className: "px-8 py-6", children: _jsx("span", { className: cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", practice.bg, practice.color), children: practice.label }) }), _jsx("td", { className: "px-8 py-6", children: _jsxs("span", { className: cn("flex items-center gap-2 text-xs font-black uppercase tracking-tighter", status.color), children: [_jsx("div", { className: cn("w-2 h-2 rounded-full", status.dot) }), status.label] }) })] }, appt.id));
                                            })) })] }) })] }), _jsxs("div", { className: "col-span-12 lg:col-span-4 space-y-6", children: [_jsxs(motion.div, { variants: itemVariants, className: "card-premium p-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 overflow-hidden group", children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" }), _jsx("h3", { className: "text-xl font-display font-extrabold mb-6 relative z-10", children: "Pr\u00F3ximos Turnos" }), _jsx("div", { className: "space-y-4 relative z-10", children: _jsxs("div", { className: "p-4 bg-white/10 dark:bg-slate-100 rounded-2xl", children: [_jsx("p", { className: "text-[10px] font-black uppercase tracking-widest opacity-60", children: "En preparaci\u00F3n" }), _jsx("p", { className: "text-sm font-bold mt-1", children: "El m\u00F3dulo de an\u00E1lisis predictivo estar\u00E1 disponible pronto." })] }) })] }), _jsxs(motion.div, { variants: itemVariants, className: "card-premium p-8 border-amber-500/20 bg-amber-50/20 dark:bg-amber-500/5", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("div", { className: "w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20", children: _jsx(CalendarClock, { className: "w-5 h-5 text-white" }) }), _jsx("h3", { className: "text-xl font-display font-extrabold text-slate-900 dark:text-white", children: "Alertas" })] }), _jsxs("div", { className: "p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-amber-500/10 shadow-xl shadow-amber-500/5", children: [_jsx("div", { className: "w-2 h-2 bg-amber-500 rounded-full animate-ping mb-4" }), _jsx("p", { className: "text-sm font-extrabold text-slate-900 dark:text-white", children: "Automatizaci\u00F3n Activa" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-zinc-500 mt-2 leading-relaxed", children: "Las notificaciones de WhatsApp se enviar\u00E1n autom\u00E1ticamente 24hs antes de cada cita." })] })] })] })] }), _jsx(NewAppointmentModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false) })] }));
}
