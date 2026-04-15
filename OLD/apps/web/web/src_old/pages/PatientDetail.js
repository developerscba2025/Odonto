import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Phone, Mail, User as UserIcon, CreditCard, Clock, FileText, Plus, Loader2, Activity, Image as ImageIcon } from "lucide-react";
import api from "../lib/api";
import { format, differenceInYears } from "date-fns";
import { es } from "date-fns/locale";
import { PRACTICE_META, STATUS_META } from "@dentalflow/shared";
import { cn } from "../lib/utils";
import Odontogram from "../components/clinical/Odontogram";
import AttachmentsGallery from "../components/clinical/AttachmentsGallery";
export default function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("history");
    // Modals state
    const [selectedTooth, setSelectedTooth] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ phone: '', email: '' });
    const { data: patient, isLoading, error } = useQuery({
        queryKey: ["patient", id],
        queryFn: async () => {
            const res = await api.get(`/patients/${id}`);
            return res.data;
        },
    });
    const updatePatientMutation = useMutation({
        mutationFn: (data) => api.put(`/patients/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["patient", id] });
            setIsEditModalOpen(false);
        },
    });
    const { data: toothConditionsResponse } = useQuery({
        queryKey: ["odontogram", id],
        queryFn: async () => {
            const res = await api.get(`/clinical/patients/${id}/odontogram`);
            return res.data;
        },
        enabled: activeTab === 'odontogram',
    });
    const upsertToothMutation = useMutation({
        mutationFn: (data) => api.post(`/clinical/patients/${id}/odontogram`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["odontogram", id] });
        },
    });
    if (isLoading) {
        return (_jsx("div", { className: "h-[60vh] flex items-center justify-center", children: _jsx(Loader2, { className: "w-8 h-8 text-primary animate-spin" }) }));
    }
    if (error || !patient) {
        return (_jsxs("div", { className: "card p-12 text-center", children: [_jsx("h2", { className: "text-xl font-bold text-status-error", children: "Error al cargar el paciente" }), _jsx("button", { onClick: () => navigate("/pacientes"), className: "mt-4 text-primary font-semibold", children: "Volver al listado" })] }));
    }
    const age = differenceInYears(new Date(), new Date(patient.dob));
    const initials = `${patient.name[0]}${patient.lastName[0]}`.toUpperCase();
    // Convert array of tooth conditions to record mapping { toothNumber: conditionStr }
    const conditionsMap = {};
    if (toothConditionsResponse) {
        toothConditionsResponse.forEach((tc) => {
            conditionsMap[tc.toothNumber] = tc.condition;
        });
    }
    const handleToothClick = (toothNum) => {
        setSelectedTooth(toothNum);
    };
    const handleSetCondition = (condition) => {
        if (selectedTooth) {
            upsertToothMutation.mutate({
                toothNumber: selectedTooth,
                condition: condition
            });
            setSelectedTooth(null);
        }
    };
    return (_jsxs("div", { className: "space-y-6 max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6", children: [_jsxs("div", { className: "flex items-center gap-5", children: [_jsx("button", { onClick: () => navigate("/pacientes"), className: "w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm", children: _jsx(ArrowLeft, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex items-center gap-5", children: [_jsx("div", { className: "w-16 h-16 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl transition-transform hover:scale-105", style: { backgroundColor: patient.professionalProfile?.color || '#6366f1' }, children: initials }), _jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-black text-slate-900 dark:text-white tracking-tighter", children: [patient.lastName, ", ", _jsx("span", { className: "text-primary", children: patient.name })] }), _jsxs("div", { className: "flex items-center gap-3 mt-1.5", children: [_jsxs("span", { className: "px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5", children: [_jsx(CreditCard, { className: "w-3 h-3" }), " ", patient.dni] }), _jsx("span", { className: "w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" }), _jsxs("span", { className: "text-xs font-bold text-slate-500 dark:text-slate-400", children: [age, " a\u00F1os"] })] })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: () => {
                                    setEditForm({ phone: patient.phone || '', email: patient.email || '' });
                                    setIsEditModalOpen(true);
                                }, className: "px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center gap-2 transition-all shadow-sm", children: [_jsx(FileText, { className: "w-4 h-4" }), " Editar Datos"] }), _jsxs("button", { onClick: () => navigate('/agenda'), className: "btn-primary group flex items-center gap-2", children: [_jsx(Plus, { className: "w-5 h-5 group-hover:rotate-90 transition-transform" }), "Nuevo Turno"] })] })] }), _jsxs("div", { className: "flex flex-col lg:flex-row gap-8 items-start", children: [_jsxs("div", { className: "w-full lg:w-80 shrink-0 space-y-6", children: [_jsxs("div", { className: "card-premium p-8 space-y-8", children: [_jsxs("h3", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-primary" }), " Ficha Personal"] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "group", children: [_jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2", children: "Tel\u00E9fono M\u00F3vil" }), _jsxs("p", { className: "text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:text-primary transition-colors", children: _jsx(Phone, { className: "w-4 h-4" }) }), patient.phone] })] }), _jsxs("div", { className: "group", children: [_jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2", children: "Correo Electr\u00F3nico" }), _jsxs("p", { className: "text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:text-primary transition-colors", children: _jsx(Mail, { className: "w-4 h-4" }) }), _jsx("span", { className: "truncate", children: patient.email || 'No registrado' })] })] }), _jsxs("div", { className: "group", children: [_jsx("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2", children: "Nacimiento" }), _jsxs("p", { className: "text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:text-primary transition-colors", children: _jsx(Calendar, { className: "w-4 h-4" }) }), format(new Date(patient.dob), "d 'de' MMMM, yyyy", { locale: es })] })] })] })] }), _jsxs("div", { className: "card-premium p-8 space-y-6", children: [_jsxs("h3", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500" }), " Cobertura"] }), patient.coverages?.length > 0 ? (_jsx("div", { className: "space-y-4", children: patient.coverages.map((c) => (_jsxs("div", { className: "p-5 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100/50 dark:border-emerald-500/10 transition-all hover:scale-[1.02]", children: [_jsx("p", { className: "text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase mb-1.5 tracking-tighter", children: c.insurancePlan.provider.name }), _jsx("p", { className: "text-sm font-black text-slate-800 dark:text-slate-200", children: c.insurancePlan.name }), _jsxs("div", { className: "flex items-center gap-2 mt-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-500/10", children: [_jsx("span", { className: "text-[9px] font-bold text-slate-400 uppercase", children: "Cred:" }), _jsx("span", { className: "text-xs font-black text-slate-700 dark:text-slate-300", children: c.affiliateNumber || 'N/A' })] })] }, c.id))) })) : (_jsx("div", { className: "p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800", children: _jsxs("p", { className: "text-xs text-slate-500 font-bold text-center leading-relaxed", children: ["Sin cobertura.", _jsx("br", {}), _jsx("span", { className: "text-primary italic", children: "Atenci\u00F3n Particular." })] }) }))] })] }), _jsxs("div", { className: "flex-1 card-premium p-0 overflow-hidden shadow-2xl", children: [_jsx("div", { className: "flex border-b border-slate-100 dark:border-slate-800 px-4 bg-slate-50/50 dark:bg-slate-950/20", children: [
                                    { id: 'history', label: 'Historial', icon: FileText },
                                    { id: 'odontogram', label: 'Odontograma', icon: Activity },
                                    { id: 'attachments', label: 'Estudios', icon: ImageIcon },
                                ].map(tab => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: cn("flex items-center gap-2.5 px-8 py-5 text-sm font-black transition-all border-b-2", activeTab === tab.id
                                        ? "border-primary text-primary bg-white dark:bg-slate-900 shadow-[0_4px_12px_rgba(99,102,241,0.1)]"
                                        : "border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"), children: [_jsx(tab.icon, { className: "w-4 h-4" }), tab.label] }, tab.id))) }), _jsxs("div", { className: "p-8 relative min-h-[600px] transition-all duration-500", children: [activeTab === 'history' && (_jsxs("div", { className: "space-y-10 relative animate-in fade-in slide-in-from-bottom-4", children: [_jsx("div", { className: "absolute left-[39px] top-8 bottom-8 w-[2px] bg-slate-100 dark:bg-slate-800 hidden sm:block" }), patient.appointments?.length === 0 ? (_jsx("div", { className: "py-32 text-center text-slate-400 font-black uppercase tracking-widest text-xs italic", children: "No hay registros cl\u00EDnicos." })) : (patient.appointments.map((appt) => {
                                                const practice = PRACTICE_META[appt.practiceType] || PRACTICE_META.OTHER;
                                                const status = STATUS_META[appt.status.toUpperCase()] || STATUS_META.PENDING;
                                                return (_jsxs("div", { className: "flex gap-8 items-start relative group", children: [_jsx("div", { className: "w-4 h-4 rounded-full mt-2.5 shrink-0 z-10 border-4 border-white dark:border-slate-900 ring-4 ring-slate-100 dark:ring-slate-800 shadow-sm transition-all group-hover:scale-125", style: { backgroundColor: status.dot } }), _jsxs("div", { className: "flex-1 pb-10 border-b border-slate-50 dark:border-slate-800/50 group-last:border-none", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start gap-4 mb-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("span", { className: "text-base font-black text-slate-800 dark:text-slate-200", children: format(new Date(appt.date), "dd 'de' MMMM, yyyy", { locale: es }) }), _jsx("span", { className: "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter", style: { backgroundColor: practice.bg, color: practice.color }, children: practice.label })] }), _jsx("span", { className: "text-[10px] font-black uppercase px-3 py-1 rounded-xl shadow-sm", style: { color: status.color, backgroundColor: status.bg }, children: status.label })] }), _jsxs("div", { className: "flex items-center gap-8 mt-4", children: [_jsxs("span", { className: "flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500", children: [_jsx(Clock, { className: "w-4 h-4" }), format(new Date(appt.date), "HH:mm"), " ", _jsxs("span", { className: "text-[10px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md ml-1", children: [appt.duration, " min"] })] }), _jsxs("span", { className: "flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500", children: [_jsx(UserIcon, { className: "w-4 h-4" }), "Dr/a. ", _jsx("span", { className: "text-slate-600 dark:text-slate-300", children: appt.professional.lastName })] })] }), appt.notes && (_jsxs("div", { className: "mt-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-white/5 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic", children: ["\"", appt.notes, "\""] }))] })] }, appt.id));
                                            }))] })), activeTab === 'odontogram' && (_jsxs("div", { className: "animate-in fade-in zoom-in-95 duration-500", children: [_jsxs("div", { className: "mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-black text-slate-800 dark:text-white tracking-tight", children: "Estado Dental Actual" }), _jsx("p", { className: "text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider italic", children: "Control Cl\u00EDnico de entrada" })] }), _jsx("div", { className: "flex flex-wrap gap-3 p-3 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5", children: CONDITIONS_LEGEND.map(c => (_jsxs("span", { className: "flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 dark:text-slate-400", children: [_jsx("div", { className: cn("w-2.5 h-2.5 rounded-full", c.color) }), " ", c.label] }, c.label))) })] }), _jsx("div", { className: "p-4 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5", children: _jsx(Odontogram, { conditions: conditionsMap, onToothClick: handleToothClick }) })] })), activeTab === 'attachments' && (_jsx("div", { className: "animate-in fade-in slide-in-from-right-8 duration-500", children: _jsx(AttachmentsGallery, { patientId: patient.id }) }))] })] })] }), isEditModalOpen && (_jsx("div", { className: "fixed inset-0 bg-slate-950/80 z-[120] flex flex-col items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300", children: _jsxs("div", { className: "bg-white dark:bg-slate-900 max-w-sm w-full rounded-[3rem] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-300", children: [_jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter text-center", children: "Datos de Contacto" }), _jsxs("form", { onSubmit: (e) => {
                                e.preventDefault();
                                updatePatientMutation.mutate(editForm);
                            }, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1", children: "N\u00FAmero de Tel\u00E9fono" }), _jsx("input", { type: "text", required: true, value: editForm.phone, onChange: e => setEditForm({ ...editForm, phone: e.target.value }), className: "input-premium" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1", children: "Email Profesional" }), _jsx("input", { type: "email", value: editForm.email, onChange: e => setEditForm({ ...editForm, email: e.target.value }), className: "input-premium" })] }), _jsxs("div", { className: "pt-6 flex gap-4", children: [_jsx("button", { type: "button", onClick: () => setIsEditModalOpen(false), className: "flex-1 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", children: "Cerrar" }), _jsx("button", { type: "submit", disabled: updatePatientMutation.isPending, className: "flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all flex justify-center items-center gap-2", children: updatePatientMutation.isPending ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : 'Guardar' })] })] })] }) })), selectedTooth && (_jsx("div", { className: "fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300", children: _jsxs("div", { className: "bg-white dark:bg-slate-900 w-full max-w-md p-10 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-300", children: [_jsxs("div", { className: "text-center mb-10", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2", children: "Registro de Pieza" }), _jsxs("h3", { className: "text-4xl font-black text-slate-900 dark:text-white", children: ["Nero ", _jsx("span", { className: "text-primary", children: selectedTooth })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-4 mb-10", children: [
                                { id: 'HEALTHY', label: 'Pieza Sana', color: 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
                                { id: 'CARIES', label: 'Caries Detect.', color: 'border-rose-100 bg-rose-50 text-rose-600' },
                                { id: 'FILLED', label: 'Restauración', color: 'border-blue-100 bg-blue-50 text-blue-600' },
                                { id: 'EXTRACTED', label: 'Extraído', color: 'border-slate-300 bg-slate-200 text-slate-800' },
                                { id: 'CROWN', label: 'Corona / Prótes.', color: 'border-amber-100 bg-amber-50 text-amber-600' },
                                { id: 'ROOT_CANAL', label: 'Endodoncia', color: 'border-purple-100 bg-purple-50 text-purple-600' },
                            ].map(c => (_jsx("button", { onClick: () => handleSetCondition(c.id), className: cn("p-5 border-2 rounded-[1.5rem] text-[10px] font-black uppercase tracking-tighter transition-all hover:scale-[1.05] active:scale-95", c.color), children: c.label }, c.id))) }), _jsx("button", { onClick: () => setSelectedTooth(null), className: "w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl transition-all", children: "Descartar" })] }) }))] }));
}
const CONDITIONS_LEGEND = [
    { label: 'Caries', color: 'bg-rose-500' },
    { label: 'Rest.', color: 'bg-blue-500' },
    { label: 'Ext.', color: 'bg-slate-800 dark:bg-slate-100' },
    { label: 'Corona', color: 'bg-amber-400' },
];
