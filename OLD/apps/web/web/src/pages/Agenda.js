import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Loader2, X, Clock, User as UserIcon, Stethoscope, ChevronRight, Search, CheckCircle2, Calendar as CalendarIcon, Activity, Sparkles, ShieldPlus, AlertCircle, Camera, MoreHorizontal } from "lucide-react";
import api from "../lib/api";
import { PRACTICE_META, PRACTICE_TYPES, STATUS_META, APPOINTMENT_STATUSES } from "@dentalflow/shared";
import { format, parseISO, addMinutes } from "date-fns";
import { cn } from "../lib/utils";
import { useAuthStore } from "../stores/authStore";
const ICON_MAP = {
    Stethoscope,
    Activity,
    Sparkles,
    ShieldPlus,
    AlertCircle,
    Camera,
    MoreHorizontal
};
export default function Agenda() {
    const queryClient = useQueryClient();
    const calendarRef = useRef(null);
    const user = useAuthStore((s) => s.user);
    const [range, setRange] = useState({ start: new Date(), end: new Date() });
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [patientSearch, setPatientSearch] = useState("");
    // filtering state: set of IDs
    const [activeProfessionals, setActiveProfessionals] = useState(new Set());
    // --- Queries ---
    const { data: appointments, isLoading: loadingAppts } = useQuery({
        queryKey: ["appointments", range.start, range.end],
        queryFn: async () => {
            const res = await api.get("/appointments", {
                params: { start: range.start.toISOString(), end: range.end.toISOString() },
            });
            return res.data;
        },
    });
    const { data: patients } = useQuery({
        queryKey: ["patients"],
        queryFn: async () => {
            const res = await api.get("/patients");
            return res.data;
        },
    });
    const { data: professionals, isLoading: loadingProfs } = useQuery({
        queryKey: ["professionals"],
        queryFn: async () => {
            const res = await api.get("/auth/professionals");
            return res.data;
        },
    });
    const { data: absences } = useQuery({
        queryKey: ["absences"],
        queryFn: async () => {
            const res = await api.get("/absences");
            return res.data;
        },
    });
    useEffect(() => {
        if (user?.id && activeProfessionals.size === 0) {
            setActiveProfessionals(new Set([user.id]));
        }
    }, [user?.id]);
    // --- Mutations ---
    const createMutation = useMutation({
        mutationFn: (data) => api.post("/appointments", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            handleCloseModal();
        },
    });
    const updateMutation = useMutation({
        mutationFn: (data) => api.patch(`/appointments/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            handleCloseModal();
        },
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/appointments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            handleCloseModal();
        },
    });
    // --- Modal Handlers ---
    const handleOpenModal = (event = null) => {
        setSelectedEvent(event);
        if (event) {
            // If it's a new slot (just date/time), we reset form but keep those values
            // If it's an existing appt, we reset with appt values
            reset({
                patientId: event.patientId || "",
                practiceType: event.practiceType || "GENERAL_CONSULTATION",
                duration: event.duration?.toString() || "30",
                status: event.status || "PENDING",
                professionalId: event.professionalId || user?.id,
                date: event.date ? format(parseISO(event.date), "yyyy-MM-dd") : "",
                time: event.date ? format(parseISO(event.date), "HH:mm") : "",
                notes: event.notes || ""
            });
        }
        else {
            reset({
                patientId: "",
                practiceType: "GENERAL_CONSULTATION",
                duration: "30",
                status: "PENDING",
                professionalId: user?.id,
                date: format(new Date(), "yyyy-MM-dd"),
                time: "09:00",
                notes: ""
            });
        }
        setPatientSearch("");
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEvent(null);
        reset();
    };
    // --- Calendar Handlers ---
    const handleDatesSet = (dateInfo) => {
        setRange({ start: dateInfo.start, end: dateInfo.end });
    };
    const handleEventDrop = (info) => {
        const { id } = info.event;
        const newDate = info.event.start.toISOString();
        updateMutation.mutate({ id, date: newDate });
    };
    const handleDateClick = (info) => {
        handleOpenModal({ date: info.dateStr });
    };
    const handleEventClick = (info) => {
        handleOpenModal(info.event.extendedProps);
    };
    // --- Toggle Logic ---
    const toggleProfessional = (id) => {
        const next = new Set(activeProfessionals);
        if (next.has(id)) {
            if (next.size > 1)
                next.delete(id); // Keep at least one
        }
        else
            next.add(id);
        setActiveProfessionals(next);
    };
    // --- Form Logic ---
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const filteredPatients = useMemo(() => {
        if (!patients)
            return [];
        if (!patientSearch)
            return patients.slice(0, 50);
        const s = patientSearch.toLowerCase();
        return patients.filter((p) => p.name.toLowerCase().includes(s) ||
            p.lastName.toLowerCase().includes(s) ||
            p.dni.includes(s)).slice(0, 10);
    }, [patients, patientSearch]);
    const onSubmit = (data) => {
        const payload = {
            ...data,
            duration: parseInt(data.duration),
            date: new Date(data.date + "T" + data.time).toISOString(),
        };
        if (selectedEvent?.id) {
            updateMutation.mutate({ id: selectedEvent.id, ...payload });
        }
        else {
            createMutation.mutate(payload);
        }
    };
    // --- Absence Check ---
    const isProfessionalAbsent = (profId, date = new Date()) => {
        return absences?.some((abs) => {
            if (abs.userId !== profId)
                return false;
            const start = parseISO(abs.start);
            const end = parseISO(abs.end);
            return date >= start && date <= end;
        });
    };
    // --- Mapping Events ---
    const events = useMemo(() => {
        const apptEvents = appointments
            ?.filter((appt) => activeProfessionals.has(appt.professionalId))
            ?.map((appt) => {
            const profColor = appt.professional?.professionalProfile?.color || "#6366f1";
            const practice = PRACTICE_META[appt.practiceType] || PRACTICE_META.OTHER;
            const status = STATUS_META[appt.status] || STATUS_META.PENDING;
            return {
                id: appt.id,
                title: `${appt.patient.lastName}, ${appt.patient.name}`,
                start: appt.date,
                end: addMinutes(parseISO(appt.date), appt.duration),
                extendedProps: { ...appt, practice, status, profColor },
            };
        }) || [];
        // Add absence events to the calendar as background events
        const absenceEvents = absences
            ?.filter((abs) => activeProfessionals.has(abs.userId))
            ?.map((abs) => ({
            id: `abs-${abs.id}`,
            start: abs.start,
            end: abs.end,
            display: 'background',
            backgroundColor: 'rgba(245, 158, 11, 0.08)', // amber-500/08
            title: `AUSENTE: ${abs.reason || ''}`,
        })) || [];
        return [...apptEvents, ...absenceEvents];
    }, [appointments, activeProfessionals, absences]);
    return (_jsxs("div", { className: "h-[calc(100vh-120px)] flex flex-col space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between px-2", children: [_jsxs("div", { className: "flex items-center gap-5", children: [_jsx("div", { className: "w-14 h-14 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 group transition-transform hover:rotate-3", children: _jsx(CalendarIcon, { className: "w-7 h-7 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-display font-extrabold tracking-tighter text-slate-900 dark:text-white leading-none", children: "Agenda M\u00E9dica" }), _jsx("p", { className: "text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em] mt-2 italic", children: "Gesti\u00F3n de Turnos y Cronograma" })] })] }), _jsxs("button", { onClick: () => handleOpenModal(), className: "btn-primary flex items-center gap-2 group shadow-xl shadow-primary/20", children: [_jsx(Plus, { className: "w-5 h-5 transition-transform group-hover:rotate-90" }), "Agendar Cita"] })] }), _jsxs("div", { className: "flex-1 flex gap-8 overflow-hidden", children: [_jsxs("div", { className: "w-[300px] flex flex-col gap-8 shrink-0", children: [_jsxs("div", { className: "card-premium p-8 flex flex-col gap-6", children: [_jsxs("h3", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse" }), " Equipo M\u00E9dico"] }), _jsx("div", { className: "space-y-4", children: loadingProfs ? (_jsx("div", { className: "flex flex-col gap-4", children: [1, 2, 3].map(i => _jsx("div", { className: "h-16 bg-slate-50 dark:bg-white/5 animate-pulse rounded-2xl" }, i)) })) : (professionals?.map((prof) => (_jsxs("button", { onClick: () => toggleProfessional(prof.id), className: cn("w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-500 border-2 text-left group", activeProfessionals.has(prof.id)
                                                ? "bg-white dark:bg-slate-800 border-primary/20 shadow-xl shadow-slate-200/50 dark:shadow-none"
                                                : "bg-slate-50/50 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100"), children: [_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "w-11 h-11 rounded-[1.2rem] flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-transform", style: { backgroundColor: prof.professionalProfile?.color || '#ccc' }, children: [prof.name[0], prof.lastName[0]] }), activeProfessionals.has(prof.id) && (_jsx("div", { className: "absolute -top-1 -right-1 w-5 h-5 bg-primary border-[3px] border-white dark:border-slate-800 rounded-full flex items-center justify-center shadow-sm", children: _jsx(CheckCircle2, { className: "w-2.5 h-2.5 text-white" }) }))] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("p", { className: "text-sm font-black text-slate-800 dark:text-slate-200 truncate", children: ["Dr. ", prof.lastName] }) }), _jsx("p", { className: "text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-tighter mt-0.5", children: prof.professionalProfile?.specialty || 'General' })] })] }, prof.id)))) })] }), _jsxs("div", { className: "card-premium p-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 relative overflow-hidden group", children: [_jsx("div", { className: "absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-125 duration-500", children: _jsx(Sparkles, { className: "w-24 h-24 rotate-12" }) }), _jsx("p", { className: "text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 italic", children: "Tip de Gesti\u00F3n" }), _jsx("p", { className: "text-sm font-bold leading-relaxed relative z-10", children: "Arrastra los turnos para re-programar. Al confirmar, el sistema notifica autom\u00E1ticamente al paciente v\u00EDa WhatsApp." })] })] }), _jsxs("div", { className: "flex-1 card-premium p-8 bg-white dark:bg-slate-900 flex flex-col relative overflow-hidden shadow-2xl", children: [(loadingAppts || createMutation.isPending || updateMutation.isPending) && (_jsx("div", { className: "absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300", children: _jsxs("div", { className: "bg-white dark:bg-slate-900 px-8 py-5 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4", children: [_jsx(Loader2, { className: "w-6 h-6 text-primary animate-spin" }), _jsx("span", { className: "text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest", children: "Sincronizando..." })] }) })), _jsx("div", { className: "flex-1 fc-premium-theme", children: _jsx(FullCalendar, { ref: calendarRef, plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin], initialView: "timeGridWeek", headerToolbar: {
                                        left: "prev,next today",
                                        center: "title",
                                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }, locale: "es", slotMinTime: "08:00:00", slotMaxTime: "20:00:00", allDaySlot: false, editable: true, selectable: true, selectMirror: true, dayMaxEvents: true, events: events, datesSet: handleDatesSet, eventDrop: handleEventDrop, dateClick: handleDateClick, eventClick: handleEventClick, height: "100%", slotDuration: "00:15:00", buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }, eventContent: (eventInfo) => {
                                        const { profColor, practice, status } = eventInfo.event.extendedProps;
                                        const Icon = ICON_MAP[practice.icon] || MoreHorizontal;
                                        return (_jsxs("div", { className: "p-2 h-full overflow-hidden flex flex-col border-l-4 rounded-xl shadow-lg shadow-black/5", style: { borderLeftColor: profColor, backgroundColor: `var(--bg-card)` }, children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("div", { className: "p-1 px-1.5 rounded-lg", style: { backgroundColor: `${profColor}15` }, children: _jsx(Icon, { className: "w-3 h-3", style: { color: profColor } }) }), _jsx("div", { className: "text-[11px] font-black text-slate-800 dark:text-white truncate", children: eventInfo.event.title })] }), _jsxs("div", { className: "flex items-center gap-2 mt-auto", children: [_jsx("span", { className: "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shrink-0 shadow-sm", style: { backgroundColor: status.bg, color: status.color }, children: status.label }), _jsx("span", { className: "text-[9px] text-slate-400 dark:text-slate-500 font-bold truncate opacity-80 uppercase tracking-widest", children: practice.label })] })] }));
                                    } }) })] })] }), showModal && (_jsx("div", { className: "fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300", children: _jsxs("div", { className: "bg-white dark:bg-slate-900 w-full max-w-2xl p-0 rounded-[3rem] overflow-hidden animate-in zoom-in-95 duration-300 shadow-[0_32px_128px_rgba(0,0,0,0.5)] border border-white/10", children: [_jsxs("div", { className: "bg-slate-50/50 dark:bg-slate-950/20 px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-5", children: [_jsx("div", { className: cn("w-14 h-14 rounded-[2rem] flex items-center justify-center text-white shadow-2xl", selectedEvent?.id ? "bg-amber-500 shadow-amber-500/30" : "bg-primary shadow-primary/30"), children: selectedEvent?.id ? _jsx(Clock, { className: "w-7 h-7" }) : _jsx(Plus, { className: "w-7 h-7" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1 italic", children: "Operaci\u00F3n de Agenda" }), _jsx("h3", { className: "text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter", children: selectedEvent?.id ? "Gestionar Cita" : "Nueva Reserva" })] })] }), _jsx("button", { onClick: handleCloseModal, className: "w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-white/5", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "p-10 space-y-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-3 px-1", children: [_jsx(UserIcon, { className: "w-3.5 h-3.5" }), " Paciente Registrado"] }), _jsxs("div", { className: "relative group", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" }), _jsx("input", { type: "text", placeholder: "Buscar por DNI o Apellido...", value: patientSearch, onChange: (e) => setPatientSearch(e.target.value), className: "input-premium pl-12" })] }), patientSearch && filteredPatients.length > 0 && (_jsx("div", { className: "mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-[2rem] shadow-2xl overflow-hidden max-h-56 overflow-y-auto animate-in slide-in-from-top-4 duration-300", children: filteredPatients.map((p) => (_jsxs("button", { type: "button", onClick: () => {
                                                            setValue("patientId", p.id);
                                                            setPatientSearch(`${p.lastName}, ${p.name}`);
                                                        }, className: cn("w-full px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between group transition-all", watch("patientId") === p.id && "bg-primary/5 border-l-4 border-primary"), children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-black text-slate-800 dark:text-slate-200", children: [p.lastName, ", ", p.name] }), _jsxs("p", { className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5", children: ["DNI: ", p.dni] })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-200 dark:text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" })] }, p.id))) })), _jsx("input", { type: "hidden", ...register("patientId", { required: true }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-3 px-1", children: [_jsx(Stethoscope, { className: "w-3.5 h-3.5" }), " Tratamiento / Pr\u00E1ctica"] }), _jsx("select", { ...register("practiceType", { required: true }), className: "input-premium appearance-none", children: PRACTICE_TYPES.map(type => (_jsx("option", { value: type, children: PRACTICE_META[type].label }, type))) })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1", children: "Fecha" }), _jsx("input", { type: "date", ...register("date", { required: true }), className: "input-premium" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1", children: "Hora inicio" }), _jsx("input", { type: "time", ...register("time", { required: true }), className: "input-premium" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1", children: "Sesi\u00F3n" }), _jsxs("select", { ...register("duration"), className: "input-premium", children: [_jsx("option", { value: "15", children: "15 Minutos" }), _jsx("option", { value: "30", children: "30 Minutos" }), _jsx("option", { value: "45", children: "45 Minutos" }), _jsx("option", { value: "60", children: "1 Hora" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1", children: "Estado M\u00E9dico" }), _jsx("div", { className: "flex gap-2", children: APPOINTMENT_STATUSES.map(status => (_jsxs("label", { className: "flex-1 cursor-pointer", children: [_jsx("input", { type: "radio", value: status, ...register("status"), className: "peer hidden" }), _jsx("div", { className: "text-[9px] py-3 text-center border-2 border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 font-black uppercase tracking-widest peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white transition-all", children: STATUS_META[status].label })] }, status))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1", children: "Responsable M\u00E9dico" }), _jsx("select", { ...register("professionalId", { required: true }), className: "input-premium", children: professionals?.map((p) => (_jsxs("option", { value: p.id, children: ["Dr/a. ", p.lastName, ", ", p.name] }, p.id))) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1", children: "Notas Cl\u00EDnicas Privadas" }), _jsx("textarea", { ...register("notes"), className: "w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent rounded-[2rem] px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all h-24 resize-none", placeholder: "Detalles del diagn\u00F3stico o procedimiento..." })] }), _jsxs("div", { className: "pt-8 flex flex-col sm:flex-row justify-between gap-6 border-t border-slate-100 dark:border-white/5", children: [_jsx("div", { className: "flex flex-wrap gap-3", children: selectedEvent?.id && (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => { if (confirm("¿Eliminar este turno definitivamente?"))
                                                            deleteMutation.mutate(selectedEvent.id); }, className: "px-6 py-3 rounded-2xl text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all", children: "Anular Turno" }), selectedEvent.patient?.phone && (_jsx("a", { href: `https://wa.me/${selectedEvent.patient.phone.replace(/\D/g, '')}?text=Hola%20${selectedEvent.patient.name},%20confirmamos%20tu%20turno%20en%20OdontoMax%20para%20el%20día%20${format(parseISO(selectedEvent.date), 'dd/MM/yyyy')}%20a%20las%20${format(parseISO(selectedEvent.date), 'HH:mm')}.`, target: "_blank", rel: "noopener noreferrer", className: "px-6 py-3 rounded-2xl text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2", children: "Recordatorio WA" }))] })) }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { type: "button", onClick: handleCloseModal, className: "flex-1 sm:flex-none px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all", children: "Salir" }), _jsx("button", { type: "submit", className: "flex-1 sm:flex-none px-12 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all", children: selectedEvent?.id ? "Actualizar" : "Crear Turno" })] })] })] })] }) })), _jsx("style", { children: `
        .fc { 
          --fc-border-color: var(--border-color); 
          --fc-button-bg-color: transparent; 
          --fc-button-border-color: var(--border-color); 
          --fc-button-text-color: var(--text-secondary); 
          --fc-button-hover-bg-color: var(--bg-main); 
          --fc-button-active-bg-color: var(--bg-main); 
          --fc-today-bg-color: rgba(99, 102, 241, 0.05); 
          --fc-page-bg-color: var(--bg-card);
          --fc-neutral-bg-color: var(--bg-main);
          --fc-list-event-hover-bg-color: var(--bg-main);
        }
        .fc .fc-toolbar-title { font-size: 1.4rem; font-weight: 900; color: var(--text-primary); text-transform: capitalize; letter-spacing: -0.04em; }
        .fc .fc-button-primary:focus { box-shadow: none !important; }
        .fc .fc-col-header-cell { padding: 20px 0; background: var(--bg-card); font-weight: 900; font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 2px solid var(--border-color) !important; transition: background 0.3s; }
        .fc-v-event { border-radius: 16px; border: none; overflow: hidden; background: transparent; }
        .fc-timegrid-event { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .fc-timegrid-event:hover { transform: translateY(-2px) scale(1.01); z-index: 50 !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
        .fc-timegrid-slot { height: 4.5rem !important; border-bottom: 1px solid var(--border-color) !important; }
        .fc-timegrid-axis { font-size: 0.75rem; font-weight: 900; color: var(--text-secondary); opacity: 0.4; text-transform: uppercase; }
        .fc .fc-button-primary { border-radius: 16px; padding: 10px 20px; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; border: 2px solid var(--border-color); transition: all 0.3s; }
        .fc .fc-button-active { background: var(--text-primary) !important; color: var(--bg-card) !important; border-color: var(--text-primary) !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
        .fc .fc-scrollgrid { border-radius: 2rem; overflow: hidden; border-color: var(--border-color); }
        .fc-timegrid-now-indicator-line { border-color: #f43f5e; border-width: 2px; }
        .dark .fc-timegrid-col { background-image: linear-gradient(var(--border-color) 1px, transparent 1px); }
      ` })] }));
}
