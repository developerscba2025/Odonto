import { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { 
  Plus, 
  Loader2, 
  X, 
  Clock, 
  User as UserIcon,
  Stethoscope,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  Calendar as CalendarIcon,
  Activity,
  Sparkles,
  ShieldPlus,
  AlertCircle,
  Camera,
  MoreHorizontal
} from "lucide-react";
import api from "../lib/api";
import { PRACTICE_META, PRACTICE_TYPES, STATUS_META, APPOINTMENT_STATUSES } from "@dentalflow/shared";
import { format, parseISO, startOfDay, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP: Record<string, any> = {
  Stethoscope,
  Activity,
  Sparkles,
  ShieldPlus,
  AlertCircle,
  Camera,
  MoreHorizontal
};

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: '10px', fontSize: '0.875rem',
  outline: 'none', fontFamily: '"Inter", sans-serif',
  color: 'var(--text-primary)', background: 'var(--bg-subtle)',
  transition: 'all 0.15s', boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600 as const,
  color: 'var(--text-secondary)', marginBottom: '7px',
};

export default function Agenda() {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);
  const user = useAuthStore((s) => s.user);
  
  const [range, setRange] = useState({ start: new Date(), end: new Date() });
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState("");
  
  // filtering state: set of IDs
  const [activeProfessionals, setActiveProfessionals] = useState<Set<string>>(new Set());

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
    mutationFn: (data: any) => api.post("/appointments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      handleCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; [key: string]: any }) => 
      api.patch(`/appointments/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      handleCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      handleCloseModal();
    },
  });

  // --- Modal Handlers ---
  const handleOpenModal = (event: any = null) => {
    setSelectedEvent(event);
    if (event) {
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
    } else {
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
  
  const handleDatesSet = (dateInfo: any) => {
    setRange({ start: dateInfo.start, end: dateInfo.end });
  };

  const handleEventDrop = (info: any) => {
    const { id } = info.event;
    const newDate = info.event.start.toISOString();
    updateMutation.mutate({ id, date: newDate });
  };

  const handleDateClick = (info: any) => {
    handleOpenModal({ date: info.dateStr });
  };

  const handleEventClick = (info: any) => {
    handleOpenModal(info.event.extendedProps);
  };

  // --- Toggle Logic ---
  const toggleProfessional = (id: string) => {
    const next = new Set(activeProfessionals);
    if (next.has(id)) {
        if (next.size > 1) next.delete(id); // Keep at least one
    }
    else next.add(id);
    setActiveProfessionals(next);
  };

  // --- Form Logic ---
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  
  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    if (!patientSearch) return patients.slice(0, 50);
    const s = patientSearch.toLowerCase();
    return patients.filter((p: any) => 
      p.name.toLowerCase().includes(s) || 
      p.lastName.toLowerCase().includes(s) || 
      p.dni.includes(s)
    ).slice(0, 10);
  }, [patients, patientSearch]);

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      duration: parseInt(data.duration),
      date: new Date(data.date + "T" + data.time).toISOString(),
    };
    
    if (selectedEvent?.id) {
      updateMutation.mutate({ id: selectedEvent.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // --- Mapping Events ---
  const events = useMemo(() => {
    const apptEvents = appointments
      ?.filter((appt: any) => activeProfessionals.has(appt.professionalId))
      ?.map((appt: any) => {
        const profColor = appt.professional?.professionalProfile?.color || "#10b981";
        const practice = PRACTICE_META[appt.practiceType as keyof typeof PRACTICE_META] || PRACTICE_META.OTHER;
        const status = STATUS_META[appt.status.toUpperCase() as keyof typeof STATUS_META] || STATUS_META.PENDING;
        
        return {
          id: appt.id,
          title: `${appt.patient.lastName}, ${appt.patient.name}`,
          start: appt.date,
          end: addMinutes(parseISO(appt.date), appt.duration),
          extendedProps: { ...appt, practice, status, profColor },
        };
      }) || [];

    const absenceEvents = absences
      ?.filter((abs: any) => activeProfessionals.has(abs.userId))
      ?.map((abs: any) => ({
        id: `abs-${abs.id}`,
        start: abs.start,
        end: abs.end,
        display: 'background',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        title: `AUSENTE: ${abs.reason || ''}`,
      })) || [];

    return [...apptEvents, ...absenceEvents];
  }, [appointments, activeProfessionals, absences]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Agenda Médica</h1>
          <p className="page-subtitle">Gestión centralizada de turnos y profesionales</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} />
          Agendar cita
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", gap: "24px", minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card glass" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-tertiary)", marginBottom: "16px" }}>
              Equipo Médico
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {loadingProfs ? (
                <Loader2 className="animate-spin mx-auto text-primary" size={24} />
              ) : (
                professionals?.map((prof: any) => (
                  <button 
                    key={prof.id} 
                    onClick={() => toggleProfessional(prof.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px", borderRadius: "12px",
                      background: activeProfessionals.has(prof.id) ? "var(--bg-subtle)" : "transparent",
                      border: "1.5px solid",
                      borderColor: activeProfessionals.has(prof.id) ? "var(--border)" : "transparent",
                      transition: "all 0.15s", cursor: "pointer", textAlign: "left"
                    }}
                  >
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      background: prof.professionalProfile?.color || '#ccc',
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0
                    }}>
                      {prof.name[0]}{prof.lastName[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Dr. {prof.lastName}
                      </p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 500 }}>
                        {prof.professionalProfile?.specialty || 'General'}
                      </p>
                    </div>
                    <div style={{
                      width: "16px", height: "16px", borderRadius: "4px",
                      border: "1.5px solid var(--border)",
                      background: activeProfessionals.has(prof.id) ? "#10b981" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {activeProfessionals.has(prof.id) && <CheckCircle2 size={10} color="white" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="card glass" style={{ padding: "16px", background: "#0f172a", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Sparkles size={16} color="#10b981" />
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Tip de flujo</p>
            </div>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
              Arrastra citas para reprogramarlas instantáneamente. Los pacientes recibirán un WhatsApp automático.
            </p>
          </div>
        </div>

        {/* Global FullCalendar Area */}
        <div className="card glass" style={{ flex: 1, padding: "24px", position: "relative" }}>
           {loadingAppts && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.5)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
           )}
           
           <div className="fc-redesign" style={{ height: "100%" }}>
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                locale="es"
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                events={events}
                datesSet={handleDatesSet}
                eventDrop={handleEventDrop}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="100%"
                slotDuration="00:15:00"
                buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
                eventContent={(eventInfo) => {
                  const { profColor, practice, status } = eventInfo.event.extendedProps;
                  const Icon = ICON_MAP[practice.icon] || MoreHorizontal;
                  
                  return (
                    <div style={{
                      padding: "4px 8px", height: "100%", overflow: "hidden",
                      borderLeft: `3px solid ${profColor}`,
                      background: "var(--bg-elevated)", color: "var(--text-primary)",
                      borderRadius: "6px", boxShadow: "var(--shadow-sm)",
                      display: "flex", flexDirection: "column", gap: "4px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon size={12} style={{ color: profColor }} />
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {eventInfo.event.title}
                        </span>
                      </div>
                      <span className={cn("badge", status.color)} style={{ alignSelf: "flex-start", fontSize: "0.6rem", padding: "1px 6px" }}>
                        {status.label}
                      </span>
                    </div>
                  );
                }}
              />
           </div>
        </div>
      </div>

      {/* Modal Integration */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              style={{
                position: "relative", zIndex: 1, background: "var(--bg-elevated)", borderRadius: "16px",
                width: "100%", maxWidth: "560px", boxShadow: "var(--shadow-xl)", overflow: "hidden",
                border: "1px solid var(--border)"
              }}
            >
               {/* Modal Content */}
               <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                    {selectedEvent?.id ? "Detalles del turno" : "Agendar nuevo turno"}
                  </h2>
                  <button onClick={handleCloseModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}>
                    <X size={20} />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Paciente</label>
                      <select {...register("patientId")} style={inputStyle}>
                        <option value="">Seleccionar...</option>
                        {patients?.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.lastName}, {p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Tratamiento</label>
                      <select {...register("practiceType")} style={inputStyle}>
                        {PRACTICE_TYPES.map(type => (
                          <option key={type} value={type}>{PRACTICE_META[type].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Fecha</label>
                      <input type="date" {...register("date")} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Hora inicio</label>
                      <input type="time" {...register("time")} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Duración</label>
                      <select {...register("duration")} style={inputStyle}>
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">60 min</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Profesional</label>
                      <select {...register("professionalId")} style={inputStyle}>
                        {professionals?.map((p: any) => (
                          <option key={p.id} value={p.id}>Dr. {p.lastName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Estado</label>
                      <select {...register("status")} style={inputStyle}>
                         {APPOINTMENT_STATUSES.map(status => (
                            <option key={status} value={status}>{STATUS_META[status].label}</option>
                         ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Notas</label>
                    <textarea {...register("notes")} style={{ ...inputStyle, height: "80px", resize: "none" }} />
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    {selectedEvent?.id && (
                       <button 
                        type="button" 
                        onClick={() => deleteMutation.mutate(selectedEvent.id)}
                        className="btn-secondary" style={{ flex: 1, borderColor: "rgba(239,68,68,0.2)", color: "#ef4444" }}
                       >
                         Eliminar
                       </button>
                    )}
                    <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                      {selectedEvent?.id ? "Guardar cambios" : "Confirmar turno"}
                    </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .fc { 
          --fc-border-color: var(--border); 
          --fc-button-bg-color: var(--bg-subtle); 
          --fc-button-border-color: var(--border); 
          --fc-button-text-color: var(--text-secondary); 
          --fc-button-hover-bg-color: var(--bg-elevated); 
          --fc-button-active-bg-color: var(--bg-elevated); 
          --fc-today-bg-color: rgba(16, 185, 129, 0.05); 
          font-family: var(--font-sans);
        }
        .fc .fc-toolbar-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
        .fc .fc-button { font-size: 0.75rem; font-weight: 600; text-transform: capitalize; border-radius: 8px; padding: 6px 12px; }
        .fc .fc-col-header-cell { padding: 12px 0; background: var(--bg-subtle); font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
        .fc-timegrid-slot { height: 3.5rem !important; }
        .fc-event { border-radius: 8px !important; border: none !important; }
        .fc .fc-button-primary:not(:disabled).fc-button-active { background: #10b981 !important; color: white !important; border-color: #10b981 !important; }
      `}</style>
    </div>
  );
}
