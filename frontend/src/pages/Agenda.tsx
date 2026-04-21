import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../store/ToastContext';
import { BookingModal } from '../components/clinical/BookingModal';

import { Professional } from '../types/clinical';
import { AgendaFilters } from '../components/agenda/AgendaFilters';
import { AgendaCalendar } from '../components/agenda/AgendaCalendar';

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
            return '#10b981'; // Emerald 500
          case 'PENDING':
          case 'PENDIENTE':
            return '#eab308'; // Yellow 500
          case 'CANCELLED':
          case 'CANCELADA':
            return '#ef4444'; // Red 500
          case 'ABSENT':
          case 'NO_SHOW':
          case 'AUSENTE':
            return '#171717'; // Neutral 900
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
          <AgendaFilters 
            professionals={professionals}
            selectedProfIds={selectedProfIds}
            isLoading={isLoading}
            toggleProfessional={toggleProfessional}
            selectAll={selectAll}
            selectNone={selectNone}
          />
          
          <AgendaCalendar 
            filteredEvents={filteredEvents}
            clinicHours={clinicHours}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            handleDateSelect={handleDateSelect}
            handleEventChange={handleEventChange}
            handleEditFromMenu={handleEditFromMenu}
            handleDeleteFromMenu={handleDeleteFromMenu}
            handleChangeStatusFromMenu={handleChangeStatusFromMenu}
          />
        </Card>
      </div>
    </div>
  );
}
