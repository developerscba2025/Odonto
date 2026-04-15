import { useState, useRef, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Loader2, 
  Clock, 
  CheckCircle2,
  Sparkles,
  Search,
  ChevronRight,
  Filter
} from "lucide-react";
import api from "../lib/api";
import { PRACTICE_META, STATUS_META } from "@dentalflow/shared";
import { format, parseISO, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../lib/utils";
import { useAuthStore } from "../stores/authStore";
import AppointmentModal from "../components/AppointmentModal";

export default function Agenda() {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);
  const user = useAuthStore((s) => s.user);
  
  const [range, setRange] = useState({ start: new Date(), end: new Date() });
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [initialDate, setInitialDate] = useState<string | undefined>(undefined);
  
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

  // Default filter to current user
  useEffect(() => {
    if (user?.id && activeProfessionals.size === 0) {
      setActiveProfessionals(new Set([user.id]));
    }
  }, [user?.id]);

  // --- Mutations ---
  
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; [key: string]: any }) => 
      api.patch(`/appointments/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  // --- Modal Handlers ---
  const handleOpenModal = (appointment: any = null, date: string | undefined = undefined) => {
    setSelectedAppointment(appointment);
    setInitialDate(date);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setInitialDate(undefined);
  };

  // --- Calendar Handlers ---
  
  const handleDatesSet = (dateInfo: any) => {
    setRange({ start: dateInfo.start, end: dateInfo.end });
  };

  const handleEventDrop = (info: any) => {
    const { id, extendedProps } = info.event;
    // Don't move absences or anything that isn't an appointment via drag-drop
    if (id.startsWith('abs-')) {
        info.revert();
        return;
    }
    const newDate = info.event.start.toISOString();
    updateMutation.mutate({ id, date: newDate });
  };

  const handleDateClick = (info: any) => {
    handleOpenModal(null, info.dateStr);
  };

  const handleEventClick = (info: any) => {
    const appt = info.event.extendedProps;
    if (info.event.id.startsWith('abs-')) return;
    handleOpenModal(appt);
  };

  // --- Toggle Logic ---
  const toggleProfessional = (id: string) => {
    const next = new Set(activeProfessionals);
    if (next.has(id)) {
        if (next.size > 1) next.delete(id); // Keep at least one
    } else {
        next.add(id);
    }
    setActiveProfessionals(next);
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
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        title: `AUSENTE: ${abs.reason || ''}`,
      })) || [];

    return [...apptEvents, ...absenceEvents];
  }, [appointments, activeProfessionals, absences]);

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-130px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Agenda Médica</h1>
          <p className="page-subtitle">Gestión centralizada de turnos y profesionales</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} />
          Agendar cita
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Sidebar */}
        <div className="w-full lg:w-[280px] flex flex-col gap-4 shrink-0">
          <div className="card glass p-5">
            <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-text-tertiary mb-4">
              Equipo Médico
            </h3>
            
            <div className="flex flex-col gap-2">
              {loadingProfs ? (
                <Loader2 className="animate-spin mx-auto text-primary py-4" size={24} />
              ) : (
                professionals?.map((prof: any) => {
                  const isActive = activeProfessionals.has(prof.id);
                  const initials = `${prof.name?.[0] || '?'}${prof.lastName?.[0] || '?'}`.toUpperCase();
                  
                  return (
                    <button 
                      key={prof.id} 
                      onClick={() => toggleProfessional(prof.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl border-1.5 transition-all duration-200 text-left cursor-pointer",
                        isActive 
                          ? "bg-bg-subtle border-border shadow-sm" 
                          : "bg-transparent border-transparent hover:bg-bg-subtle/50"
                      )}
                    >
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-[0.72rem] shrink-0"
                        style={{ background: prof.professionalProfile?.color || '#cbd5e1' }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.875rem] font-bold text-text-primary truncate">
                          Dr. {prof.lastName}
                        </p>
                        <p className="text-[0.68rem] text-text-tertiary font-medium">
                          {prof.professionalProfile?.specialty || 'General'}
                        </p>
                      </div>
                      <div className={cn(
                        "w-4 h-4 rounded-md border-1.5 flex items-center justify-center transition-colors",
                        isActive ? "bg-emerald-500 border-emerald-500" : "bg-transparent border-border"
                      )}>
                        {isActive && <CheckCircle2 size={10} color="white" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="card bg-primary/5 dark:bg-primary/10 border-primary/10 p-5 hidden lg:block">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-primary" />
              <p className="text-[0.75rem] font-bold text-text-primary">Tip de eficiencia</p>
            </div>
            <p className="text-[0.7rem] text-text-secondary leading-relaxed">
              Arrastrá citas para reprogramarlas instantáneamente. Los pacientes recibirán un WhatsApp automático de confirmación.
            </p>
          </div>
        </div>

        {/* Global FullCalendar Area */}
        <div className="card glass flex-1 p-6 relative min-h-[500px]">
           {loadingAppts && (
              <div className="absolute inset-0 bg-bg-elevated/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
           )}
           
           <div className="fc-redesign h-full">
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
                nowIndicator={true}
                buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
                eventContent={(eventInfo) => {
                  const { profColor, status } = eventInfo.event.extendedProps;
                  
                  return (
                    <div className="flex flex-col gap-1 h-full px-2 py-1.5 overflow-hidden rounded-md shadow-sm border-l-[3px] bg-bg-elevated text-text-primary" style={{ borderLeftColor: profColor }}>
                      <span className="text-[0.72rem] font-bold leading-tight truncate">
                        {eventInfo.event.title}
                      </span>
                      <div className="flex items-center gap-1 mt-auto">
                        <span className={cn("text-[0.62rem] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide", status.color)}>
                            {status.label}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
           </div>
        </div>
      </div>

      <AppointmentModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        appointment={selectedAppointment}
        initialDate={initialDate}
      />

      <style>{`
        .fc { 
          --fc-border-color: var(--border); 
          --fc-button-bg-color: var(--bg-subtle); 
          --fc-button-border-color: var(--border); 
          --fc-button-text-color: var(--text-secondary); 
          --fc-button-hover-bg-color: var(--bg-elevated); 
          --fc-button-active-bg-color: var(--bg-elevated); 
          --fc-today-bg-color: rgba(16, 185, 129, 0.03); 
          font-family: var(--font-sans);
          border: none;
        }
        .fc .fc-toolbar-title { font-size: 1rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-display); }
        .fc .fc-button { font-size: 0.75rem; font-weight: 700; border-radius: 8px; padding: 6px 12px; transition: all 0.2s; box-shadow: none !important; }
        .fc .fc-button-primary:not(:disabled).fc-button-active, .fc .fc-button-primary:not(:disabled):active { 
            background: #10b981 !important; color: white !important; border-color: #10b981 !important; 
        }
        .fc .fc-col-header-cell { padding: 10px 0; background: var(--bg-subtle); font-size: 0.65rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.08em; border-color: var(--border); }
        .fc-timegrid-slot { height: 3rem !important; border-color: var(--border-subtle); }
        .fc-event { border-radius: 6px !important; border: none !important; margin: 1px !important; }
        .fc-timegrid-now-indicator-line { border-color: #ef4444; border-width: 1.5px; }
        .fc-timegrid-now-indicator-arrow { border-color: #ef4444; background: #ef4444; }
      `}</style>
    </div>
  );
}
