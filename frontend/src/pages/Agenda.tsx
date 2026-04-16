import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import api from '../lib/api';
import { useAuth } from '../store/AuthContext';
import { Users, Calendar as CalendarIcon, Check, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

// UI Atoms
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../store/ToastContext';
import { BookingModal } from '../components/clinical/BookingModal';

interface Professional {
  id: string;
  name: string;
  color: string | null;
}

export default function Agenda() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfIds, setSelectedProfIds] = useState<string[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  const { user } = useAuth();

  const fetchProfessionals = useCallback(async () => {
    try {
      const response = await api.get('/auth/professionals');
      setProfessionals(response.data);
      setSelectedProfIds(response.data.map((p: any) => p.id));
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get('/appointments');
      const formattedEvents = response.data.map((app: any) => ({
        id: app.id,
        title: `${app.service || 'Consulta'} - ${app.patient.lastName}`,
        start: `${app.date.split('T')[0]}T${app.startTime}:00`,
        end: `${app.date.split('T')[0]}T${app.endTime}:00`,
        backgroundColor: app.professional.color || '#3b82f6',
        borderColor: app.professional.color || '#3b82f6',
        professionalId: app.professionalId,
        extendedProps: { ...app }
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
    fetchEvents();
  }, [fetchProfessionals, fetchEvents]);

  const toggleProfessional = (id: string) => {
    setSelectedProfIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const filteredEvents = events.filter(event => 
    selectedProfIds.includes(event.professionalId)
  );

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
        date: selectInfo.startStr.split('T')[0],
        startTime: selectInfo.startStr.split('T')[1].substring(0, 5),
        endTime: selectInfo.endStr.split('T')[1].substring(0, 5),
        professionalId: user?.id
    });
    setIsBookingModalOpen(true);
  };

  const handleEventChange = async (changeInfo: any) => {
    try {
      const { event } = changeInfo;
      const startStr = event.startStr;
      const endStr = event.endStr;
      
      await api.put(`/appointments/${event.id}`, {
        date: startStr.split('T')[0],
        startTime: startStr.split('T')[1].substring(0, 5),
        endTime: endStr.split('T')[1].substring(0, 5)
      });
      showToast('Turno reprogramado', 'success');
    } catch (error) {
      changeInfo.revert();
      showToast('Error al reprogramar turno', 'error');
    }
  };

  const handleEventClick = async (clickInfo: any) => {
    if (confirm(`¿Eliminar el turno '${clickInfo.event.title}'?`)) {
      try {
        await api.delete(`/appointments/${clickInfo.event.id}`);
        clickInfo.event.remove();
        showToast('Turno eliminado', 'info');
      } catch (error) {
        showToast('Error al eliminar', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700 space-y-8">
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={fetchEvents}
        initialData={selectedSlot}
      />

      <header className="px-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tighter">Agenda Médica</h1>
          <p className="text-sm text-text-muted font-bold opacity-60 uppercase tracking-widest mt-1">Gestión Nexus Advanced</p>
        </div>
        <div className="flex bg-bg-surface p-1.5 rounded-[1.8rem] border border-border-main/50 shadow-2xl backdrop-blur-xl">
           <Button icon={Plus} size="lg" onClick={() => setIsBookingModalOpen(true)}>Agendar Turno</Button>
        </div>
      </header>

      {/* Filter Bar Nexus */}
      <Card variant="surface" padding="none" className="p-3 bg-bg-main/20 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-3 px-4 border-r border-border-main/50 mr-2">
            <Filter className="w-5 h-5 text-text-muted" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Filtrar por Especialista:</span>
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          {professionals.map((prof) => (
            <button
              key={prof.id}
              onClick={() => toggleProfessional(prof.id)}
              className={`flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full border transition-all duration-300 relative ${selectedProfIds.includes(prof.id)
                  ? 'bg-bg-surface border-blue-500/50 shadow-xl scale-105'
                  : 'bg-transparent border-transparent opacity-30 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                style={{ backgroundColor: prof.color || '#3b82f6', boxShadow: `0 4px 12px ${prof.color}44` }}
              >
                {selectedProfIds.includes(prof.id) ? <Check className="w-4 h-4" /> : prof.name.charAt(0)}
              </div>
              <span className="text-xs font-black text-text-main whitespace-nowrap">
                {prof.name}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 pr-4">
             <Button variant="ghost" size="sm" onClick={() => setSelectedProfIds(professionals.map(p => p.id))} className="text-[9px]">Todos</Button>
             <Button variant="ghost" size="sm" onClick={() => setSelectedProfIds([])} className="text-[9px]">Ninguno</Button>
        </div>
      </Card>

      {/* Main Calendar Area - Maximized Edge-to-Edge */}
      <div className="flex-1 bg-bg-surface/30 rounded-[3rem] border border-border-main/50 p-2 md:p-6 shadow-2xl relative overflow-hidden mb-12">
        <style>
          {`
            .fc { font-family: inherit; border: none !important; }
            .fc .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 900 !important; color: var(--text-main) !important; letter-spacing: -0.05em; }
            
            .fc .fc-button { 
              background: rgba(255,255,255,0.03) !important; 
              border: 1px solid rgba(255,255,255,0.05) !important; 
              color: var(--text-muted) !important; 
              font-weight: 800 !important; 
              padding: 0.8rem 1.5rem !important; 
              border-radius: 1.2rem !important; 
              font-size: 0.75rem !important; 
              text-transform: uppercase !important;
              letter-spacing: 0.1em !important;
              transition: all 0.3s ease;
            }
            .fc .fc-button:hover { background: var(--bg-surface) !important; color: var(--text-main) !important; border-color: rgba(255,255,255,0.1) !important; }
            .fc .fc-button-primary:not(:disabled).fc-button-active { 
               background: var(--blue-600) !important; 
               color: white !important; 
               border-color: var(--blue-600) !important; 
               box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2) !important;
            }
            
            .fc .fc-col-header-cell { 
               padding: 20px 0 !important; 
               background: rgba(0,0,0,0.2) !important; 
               border-bottom: 2px solid rgba(255,255,255,0.05) !important; 
            }
            .fc .fc-col-header-cell-cushion { 
               color: var(--text-main) !important; 
               font-weight: 900 !important; 
               font-size: 0.8rem !important; 
               text-transform: uppercase !important;
               letter-spacing: 0.1em;
            }
            
            .fc .fc-timegrid-axis-cushion,
            .fc .fc-timegrid-slot-label-cushion { 
               color: var(--text-muted) !important; 
               font-weight: 800 !important; 
               font-size: 0.65rem !important; 
               opacity: 0.5;
            }
            
            .fc td, .fc th { border: 1px solid rgba(255, 255, 255, 0.03) !important; }
            .fc-theme-standard .fc-scrollgrid { 
               border: none !important; 
               border-radius: 2rem !important; 
               overflow: hidden !important; 
            }
            
            .fc-event { 
               border: none !important; 
               border-radius: 1rem !important; 
               background: rgba(255, 255, 255, 0.03) !important;
               backdrop-filter: blur(8px) !important;
               border-left: 6px solid var(--fc-event-bg-color) !important;
               box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5) !important;
               transition: all 0.3s ease;
               margin: 1px !important;
            }
            .fc-event:hover { transform: scale(1.02) !important; z-index: 50 !important; background: rgba(255, 255, 255, 0.08) !important; }
            .fc-event-main { padding: 8px 12px !important; }
            
            .fc-header-toolbar { margin-bottom: 3rem !important; padding: 0 1rem !important; }
            .fc-scroller::-webkit-scrollbar { width: 4px !important; }
            .fc-scroller::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05) !important; border-radius: 10px !important; }
            
            .fc .fc-day-today { background: rgba(37, 99, 235, 0.02) !important; }
            .fc-timegrid-cols table { border-collapse: separate !important; border-spacing: 4px !important; }
          `}
        </style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          locale={esLocale}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          events={filteredEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          height="800px"
        />
      </div>
    </div>
  );
}
