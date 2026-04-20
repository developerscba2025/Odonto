import React, { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import api from '../lib/api';
import { useAuth } from '../store/AuthContext';
import { Calendar as CalendarIcon, Check, Plus, Filter, Trash2, X, CheckCheck, MinusCircle, Loader2 } from 'lucide-react';
import '../styles/fullcalendar.css';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../store/ToastContext';
import { BookingModal } from '../components/clinical/BookingModal';

interface Professional {
  id: string;
  name: string;
  color: string | null;
}

interface EventMenuProps {
  event: any;
  position: { x: number; y: number };
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onChangeStatus: (eventId: string, newStatus: string) => void;
}

const EventContextMenu = ({ event, position, onEdit, onDelete, onClose, onChangeStatus }: EventMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const props = event.extendedProps;
  const color = event.backgroundColor || '#3b82f6';

  const handleStatus = (status: string) => {
    onChangeStatus(event.id, status);
  };

  return (
    <div
      ref={ref}
      className="fixed z-[999] w-72 bg-bg-surface border border-border-main rounded-2xl shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{ top: Math.min(position.y, window.innerHeight - 300), left: Math.min(position.x, window.innerWidth - 300) }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border-main" style={{ borderLeftWidth: 4, borderLeftColor: color, borderLeftStyle: 'solid' }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-black text-text-main text-sm leading-tight">{props.service || 'Consulta'}</p>
            <p className="text-[11px] font-bold text-text-muted mt-0.5">
              {props.patient?.firstName} {props.patient?.lastName}
            </p>
            <p className="text-[10px] text-text-muted opacity-60 mt-1">
              {event.startStr?.split('T')[1]?.substring(0, 5)} → {event.endStr?.split('T')[1]?.substring(0, 5)} hs
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-bg-main rounded-lg transition-all text-text-muted shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Status Toggles */}
      <div className="p-2 border-b border-border-main/50 grid grid-cols-2 gap-1">
        <button onClick={() => handleStatus('CONFIRMADA')} className="text-left px-2 py-1.5 rounded-lg text-[9px] font-black uppercase text-emerald-500 hover:bg-emerald-500/10 transition-all">
          🟢 Confirmar
        </button>
        <button onClick={() => handleStatus('PENDIENTE')} className="text-left px-2 py-1.5 rounded-lg text-[9px] font-black uppercase text-yellow-500 hover:bg-yellow-500/10 transition-all">
          🟡 Pendiente
        </button>
        <button onClick={() => handleStatus('AUSENTE')} className="text-left px-2 py-1.5 rounded-lg text-[9px] font-black uppercase text-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-all">
          ⚫ Ausente
        </button>
        <button onClick={() => handleStatus('CANCELADA')} className="text-left px-2 py-1.5 rounded-lg text-[9px] font-black uppercase text-red-500 hover:bg-red-500/10 transition-all">
          🔴 Cancelar
        </button>
      </div>

      {/* Actions */}
      <div className="p-2 space-y-1">
        <button
          onClick={onEdit}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-text-main hover:bg-blue-500/10 hover:text-blue-500 transition-all flex items-center gap-3"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          Editar turno
        </button>
        <button
          onClick={onDelete}
          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-3"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar turno
        </button>
      </div>
    </div>
  );
};

export default function Agenda() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfIds, setSelectedProfIds] = useState<string[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clinicHours, setClinicHours] = useState({ open: '08:00', close: '20:00' });

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    event: any;
    position: { x: number; y: number };
  } | null>(null);

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
      setIsLoading(true);
      const response = await api.get('/appointments');
      const getStatusColor = (status: string | undefined, defaultColor: string) => {
        if (!status) return defaultColor;
        switch (status.toUpperCase()) {
          case 'CONFIRMED':
          case 'CONFIRMADA':
            return '#10b981'; // Emerald 500 (Verde)
          case 'PENDING':
          case 'PENDIENTE':
            return '#eab308'; // Yellow 500 (Amarillo)
          case 'CANCELLED':
          case 'CANCELADA':
            return '#ef4444'; // Red 500 (Rojo)
          case 'ABSENT':
          case 'NO_SHOW':
          case 'AUSENTE':
            return '#171717'; // Neutral 900 (Negro)
          default:
            return defaultColor;
        }
      };

      const formattedEvents = (response.data.data || []).map((app: any) => {
        const eventColor = getStatusColor(app.status, app.professional?.color || '#3b82f6');
        return {
          id: app.id,
          title: `${app.service || 'Consulta'} · ${app.patient?.lastName || ''}`,
          start: `${app.date.split('T')[0]}T${app.startTime}:00`,
          end: `${app.date.split('T')[0]}T${app.endTime}:00`,
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: '#ffffff',
          professionalId: app.professionalId,
          extendedProps: { ...app }
        };
      });
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Error al cargar los turnos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const fetchAbsences = useCallback(async () => {
    try {
      const { data } = await api.get('/absences');
      const formattedAbsences = data.map((abs: any) => ({
        id: `abs_${abs.id}`,
        title: abs.reason || 'Licencia',
        start: abs.start.split('T')[0],
        end: abs.end.split('T')[0],
        display: 'background',
        backgroundColor: '#ef4444',
        professionalId: abs.userId
      }));
      setAbsences(formattedAbsences);
    } catch (error) {
      console.error('Error fetching absences:', error);
    }
  }, []);

  const fetchClinicSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/settings/clinic');
      if (data) {
        setClinicHours({
          open: data.openTime || '08:00',
          close: data.closeTime || '20:00'
        });
      }
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
    fetchEvents();
    fetchAbsences();
    fetchClinicSettings();
  }, [fetchProfessionals, fetchEvents, fetchAbsences, fetchClinicSettings]);

  const toggleProfessional = (id: string) => {
    setSelectedProfIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedProfIds(professionals.map(p => p.id));
  const selectNone = () => setSelectedProfIds([]);

  const filteredEvents = [
    ...events.filter(event => selectedProfIds.includes(event.professionalId)),
    ...absences.filter(abs => selectedProfIds.includes(abs.professionalId))
  ];

  // ---- Handlers ----

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      date: selectInfo.startStr.split('T')[0],
      startTime: selectInfo.startStr.split('T')[1]?.substring(0, 5) || '09:00',
      endTime: selectInfo.endStr.split('T')[1]?.substring(0, 5) || '09:30',
      professionalId: ''
    });
    setIsBookingModalOpen(true);
  };

  const handleNewAppointment = () => {
    setSelectedSlot(null);
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
        endTime: endStr ? endStr.split('T')[1].substring(0, 5) : startStr.split('T')[1].substring(0, 5)
      });
      showToast('Turno reprogramado', 'success');
    } catch (error) {
      changeInfo.revert();
      showToast('Error al reprogramar turno', 'error');
    }
  };

  const handleEventClick = (clickInfo: any) => {
    clickInfo.jsEvent.preventDefault();
    const event = clickInfo.event;
    setContextMenu({
      event,
      position: { x: clickInfo.jsEvent.clientX + 8, y: clickInfo.jsEvent.clientY + 8 }
    });
  };

  const handleEditFromMenu = () => {
    if (!contextMenu) return;
    const event = contextMenu.event;
    const props = event.extendedProps;
    setSelectedSlot({
      appointmentId: event.id,
      patient: props.patient,
      date: event.startStr.split('T')[0],
      startTime: event.startStr.split('T')[1]?.substring(0, 5),
      endTime: event.endStr ? event.endStr.split('T')[1]?.substring(0, 5) : '',
      professionalId: props.professionalId,
      service: props.service,
      notes: props.notes
    });
    setIsBookingModalOpen(true);
    setContextMenu(null);
  };

  const handleDeleteFromMenu = async () => {
    if (!contextMenu) return;
    const eventId = contextMenu.event.id;
    const patientName = `${contextMenu.event.extendedProps?.patient?.firstName || ''} ${contextMenu.event.extendedProps?.patient?.lastName || ''}`.trim();
    setContextMenu(null);
    try {
      await api.delete(`/appointments/${eventId}`);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      showToast(`Turno de ${patientName} eliminado`, 'info');
    } catch (error) {
      showToast('Error al eliminar el turno', 'error');
    }
  };

  const handleChangeStatusFromMenu = async (eventId: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${eventId}`, { status: newStatus });
      fetchEvents();
      showToast(`Estado cambiado a ${newStatus}`, 'success');
      setContextMenu(null);
    } catch (error) {
      showToast('Error al actualizar el estado del turno', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full mx-auto pb-12">
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedSlot(null);
        }}
        onSuccess={fetchEvents}
        initialData={selectedSlot}
      />

      {/* Context menu */}
      {contextMenu && (
        <EventContextMenu
          event={contextMenu.event}
          position={contextMenu.position}
          onEdit={handleEditFromMenu}
          onDelete={handleDeleteFromMenu}
          onClose={() => setContextMenu(null)}
          onChangeStatus={handleChangeStatusFromMenu}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-text-main tracking-tighter uppercase">Planificación Operativa</h1>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-50">
            {events.length} turno{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" icon={Plus} onClick={handleNewAppointment}>
          Crear Turno
        </Button>
      </div>

      <div className="space-y-6">
        <Card padding="none" className="overflow-hidden border-border-main shadow-2xl bg-bg-surface flex flex-col">
          {/* Internal Header: Filters */}
          <div className="bg-bg-main/30 border-b border-border-main px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-600/10 text-blue-500 rounded-xl">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-text-main uppercase tracking-widest leading-none">Visor de Turnos</h2>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-40 mt-1">
                  {isLoading ? 'Cargando...' : 'Sincronización en tiempo real'}
                </p>
              </div>
              {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-1" />}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Todos / Ninguno */}
              {professionals.length > 1 && (
                <div className="flex items-center gap-1 mr-2 border-r border-border-main pr-3">
                  <button
                    onClick={selectAll}
                    title="Seleccionar todos"
                    className="p-1.5 rounded-lg hover:bg-bg-main text-text-muted hover:text-emerald-500 transition-all"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={selectNone}
                    title="Deseleccionar todos"
                    className="p-1.5 rounded-lg hover:bg-bg-main text-text-muted hover:text-red-500 transition-all"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mr-1">
                <Filter className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Profs:</span>
              </div>

              {professionals.length === 0 && !isLoading && (
                <p className="text-[10px] text-text-muted opacity-50 italic">Sin profesionales registrados</p>
              )}

              {professionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => toggleProfessional(prof.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedProfIds.includes(prof.id)
                      ? 'bg-bg-surface border-blue-500/60 shadow-sm ring-1 ring-blue-500/20'
                      : 'opacity-30 hover:opacity-80 border-transparent hover:border-border-main/30'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 transition-all"
                    style={{ backgroundColor: prof.color || '#3b82f6' }}
                  >
                    {selectedProfIds.includes(prof.id) ? <Check className="w-2.5 h-2.5" strokeWidth={4} /> : prof.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-black text-text-main uppercase tracking-tight whitespace-nowrap">
                    {prof.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Body */}
          <div className="p-4 md:p-6">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                list: 'Lista'
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay,listWeek'
              }}
              locale={esLocale}
              editable={true}
              dayMaxEvents={true}
              allDaySlot={false}
              slotMinTime={`${clinicHours.open}:00`}
              slotMaxTime={`${clinicHours.close}:00`}
              slotDuration="00:30:00"
              snapDuration="00:15:00"
              events={filteredEvents}
              eventClick={handleEventClick}
              eventChange={handleEventChange}
              height="720px"
              expandRows={true}
              nowIndicator={true}
              eventContent={(info) => (
                <div className="px-2 py-1 overflow-hidden h-full flex flex-col justify-center">
                  <div className="font-black text-[11px] text-white leading-tight truncate">{info.event.title}</div>
                  <div className="text-[9px] text-white/70 font-bold mt-0.5">{info.timeText}</div>
                </div>
              )}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
