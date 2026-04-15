import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, CalendarPlus, Search } from 'lucide-react';
import { AppointmentSchema, PRACTICE_TYPES, PRACTICE_META } from '@dentalflow/shared';
import api from '../lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
export default function NewAppointmentModal({ isOpen, onClose, initialDate }) {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);
    const [patientSearch, setPatientSearch] = useState('');
    const { data: patients, isLoading: isLoadingPatients } = useQuery({
        queryKey: ['patients-search', patientSearch],
        queryFn: async () => {
            const res = await api.get(`/patients?search=${patientSearch}`);
            return res.data;
        },
        enabled: isOpen,
    });
    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(AppointmentSchema),
        defaultValues: {
            date: initialDate || new Date().toISOString().slice(0, 16),
            duration: 30,
            professionalId: user?.id,
            practiceType: 'GENERAL_CONSULTATION',
        },
    });
    const selectedPatientId = watch('patientId');
    const onSubmit = async (data) => {
        try {
            const finalData = {
                ...data,
                date: new Date(data.date).toISOString(),
            };
            await api.post('/appointments', finalData);
            await queryClient.invalidateQueries({ queryKey: ['appointments'] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            reset();
            onClose();
        }
        catch (error) {
            console.error('Error creating appointment', error);
            alert('Error al agendar el turno. Verifique los datos.');
        }
    };
    return (_jsx(AnimatePresence, { children: isOpen && (_jsxs("div", { className: "fixed inset-0 z-[150] flex items-center justify-center p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "absolute inset-0 bg-slate-950/80 backdrop-blur-xl" }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 20 }, className: "bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 border border-white/10", children: [_jsxs("div", { className: "px-8 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20", children: [_jsxs("div", { className: "flex items-center gap-5", children: [_jsx("div", { className: "w-14 h-14 bg-primary rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-primary/30", children: _jsx(CalendarPlus, { className: "w-7 h-7 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-display font-extrabold text-slate-900 dark:text-white leading-none tracking-tighter", children: "Agendar Turno" }), _jsx("p", { className: "text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-2", children: "Detalles de la reserva cl\u00EDnica" })] })] }), _jsx("button", { onClick: onClose, className: "w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-white/5", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "p-10 space-y-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-3 px-1", children: [_jsx(Search, { className: "w-3.5 h-3.5" }), " Selecci\u00F3n de Paciente"] }), _jsxs("div", { className: "relative group", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" }), _jsx("input", { type: "text", placeholder: "Buscar por DNI o Nombre...", value: patientSearch, onChange: (e) => setPatientSearch(e.target.value), className: "w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-[1.8rem] pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100" })] }), _jsx("div", { className: "max-h-48 overflow-y-auto mt-2 border border-slate-100 dark:border-white/5 rounded-[2rem] divide-y divide-slate-50 dark:divide-white/5 bg-white dark:bg-zinc-800 shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-300", children: isLoadingPatients ? (_jsx("div", { className: "p-4 flex justify-center", children: _jsx(Loader2, { className: "w-5 h-5 animate-spin text-primary" }) })) : patients?.length === 0 ? (_jsx("div", { className: "p-6 text-center text-xs text-slate-400 font-bold uppercase tracking-widest italic", children: "No se encontraron resultados" })) : (patients?.map((p) => (_jsxs("button", { type: "button", onClick: () => {
                                                    setValue('patientId', p.id);
                                                    setPatientSearch(`${p.lastName}, ${p.name}`);
                                                }, className: `w-full text-left px-6 py-4 transition-all flex items-center justify-between group ${selectedPatientId === p.id ? 'bg-primary/5 text-primary border-l-4 border-primary' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`, children: [_jsxs("div", { children: [_jsxs("span", { className: "text-sm font-black text-slate-800 dark:text-slate-200", children: [p.lastName, ", ", p.name] }), _jsxs("span", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3 opacity-60", children: ["DNI: ", p.dni] })] }), selectedPatientId === p.id && _jsx("div", { className: "w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/40" })] }, p.id)))) }), errors.patientId && _jsx("p", { className: "text-[10px] text-rose-500 font-black mt-1 ml-2 uppercase tracking-widest", children: "Debe seleccionar un paciente" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1", children: "Fecha y Hora" }), _jsx("input", { type: "datetime-local", ...register('date'), className: "w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100" }), errors.date && _jsx("p", { className: "text-[10px] text-rose-500 font-black mt-1 ml-2 uppercase tracking-widest", children: errors.date.message })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1", children: "Duraci\u00F3n cl\u00EDnica" }), _jsxs("select", { ...register('duration', { valueAsNumber: true }), className: "w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold appearance-none outline-none focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100", children: [_jsx("option", { value: 15, children: "15 MINUTOS" }), _jsx("option", { value: 30, children: "30 MINUTOS" }), _jsx("option", { value: 45, children: "45 MINUTOS" }), _jsx("option", { value: 60, children: "1 HORA" }), _jsx("option", { value: 90, children: "1.5 HORAS" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest px-1", children: "Especialidad / Pr\u00E1ctica" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: PRACTICE_TYPES.map((type) => (_jsx("button", { type: "button", onClick: () => setValue('practiceType', type), className: `px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${watch('practiceType') === type ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/10'}`, children: PRACTICE_META[type].label }, type))) })] }), _jsxs("div", { className: "pt-8 flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-white/5", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: isSubmitting || !selectedPatientId, className: "flex-[2] bg-primary hover:bg-primary-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50", children: isSubmitting ? _jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : _jsx(_Fragment, { children: "Confirmar Reserva Cl\u00EDnica" }) })] })] })] })] })) }));
}
