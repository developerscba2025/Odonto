import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Calendar as CalendarIcon, X, Trash2 } from 'lucide-react';
import '../../styles/fullcalendar.css';

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

interface AgendaCalendarProps {
  filteredEvents: any[];
  clinicHours: { open: string; close: string };
  contextMenu: { event: any; position: { x: number; y: number } } | null;
  setContextMenu: (menu: any) => void;
  handleDateSelect: (info: any) => void;
  handleEventChange: (changeInfo: any) => void;
  handleEditFromMenu: () => void;
  handleDeleteFromMenu: () => void;
  handleChangeStatusFromMenu: (eventId: string, newStatus: string) => void;
}

export const AgendaCalendar = ({
  filteredEvents,
  clinicHours,
  contextMenu,
  setContextMenu,
  handleDateSelect,
  handleEventChange,
  handleEditFromMenu,
  handleDeleteFromMenu,
  handleChangeStatusFromMenu
}: AgendaCalendarProps) => {

  const handleEventClick = (clickInfo: any) => {
    clickInfo.jsEvent.preventDefault();
    const event = clickInfo.event;
    setContextMenu({
      event,
      position: { x: clickInfo.jsEvent.clientX + 8, y: clickInfo.jsEvent.clientY + 8 }
    });
  };

  return (
    <>
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
          selectable={true}
          select={handleDateSelect}
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
    </>
  );
};
