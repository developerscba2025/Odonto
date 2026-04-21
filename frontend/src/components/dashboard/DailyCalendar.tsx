import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { Card } from '../ui/Card';
import { DashboardStats as Stats } from '../../types/dashboard';

interface Props {
  stats: Stats;
  onOpenSidebar: (patientId: string, appointmentId: string) => void;
}

export const DailyCalendar = ({ stats, onOpenSidebar }: Props) => {
  return (
    <>
      <Card padding="none" className="bg-bg-surface border-border-main h-[650px] overflow-hidden flex flex-col rounded-3xl">
        <div className="p-4 border-b border-border-main bg-bg-main/30 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.2em]">Timeline Diario</h3>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">En Tiempo Real</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            locale={esLocale}
            headerToolbar={false}
            dayHeaders={false}
            height="auto"
            expandRows={true}
            slotMinTime={`${stats.clinicSettings?.openTime || '08:00'}:00`}
            slotMaxTime={`${stats.clinicSettings?.closeTime || '20:00'}:00`}
            slotDuration="00:30:00"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: false,
              hour12: false
            }}
            slotLabelContent={(arg) => (
              <div className="text-[14px] font-medium text-text-main flex items-center gap-1">
                <span>{arg.text}</span>
                <span className="text-[9px] opacity-40 uppercase">hs</span>
              </div>
            )}
            allDaySlot={false}
            events={stats.upcomingAppointments.map(app => ({
              id: app.id,
              title: `${app.patient.lastName}, ${app.patient.firstName}`,
              start: `${app.date.split('T')[0]}T${app.startTime}:00`,
              end: `${app.date.split('T')[0]}T${app.endTime || '23:59'}:00`,
              backgroundColor: app.status === 'CANCELLED' ? 'transparent' : (app.professional.color || '#3b82f6'),
              borderColor: app.status === 'CANCELLED' ? '#ef4444' : 'transparent',
              classNames: app.status === 'CANCELLED' ? ['border-2', 'border-dashed', 'opacity-30'] : ['shadow-sm'],
              extendedProps: { patientId: app.patientId }
            }))}
            initialDate={stats.upcomingAppointments.length > 0 ? stats.upcomingAppointments[0].date.split('T')[0] : undefined}
            eventClick={(info) => onOpenSidebar(info.event.extendedProps.patientId, info.event.id)}
          />
        </div>
      </Card>

      <style>{`
        .fc {
          --fc-border-color: rgba(39, 53, 72, 0.3);
          --fc-page-bg-color: transparent;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border: 1px solid rgba(39, 53, 72, 0.2) !important;
          border-radius: 0 !important;
        }
        .fc-timegrid-slots td {
          border-bottom: none !important;
        }
        .fc-scrollgrid {
          border: none !important;
          background: transparent !important;
          border-radius: 0 !important;
        }
        .fc-scrollgrid-sync-inner {
          background: transparent !important;
        }
        .fc-col-header-cell-cushion {
          display: none !important;
        }
        .fc-timegrid-axis-frame, .fc-timegrid-axis-cushion {
          background: transparent !important;
          color: var(--color-text-main) !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          font-size: 14px !important;
          letter-spacing: 0.02em !important;
        }
        .fc-timegrid-slot-label, .fc-timegrid-axis {
          border: none !important;
        }
        .fc-timegrid-slot-label-frame {
          border: none !important;
          border-radius: 0 !important;
        }
        .fc-scroller {
          overflow: hidden !important;
          border-radius: 0 !important;
        }
        .fc-scroller-harness {
           background: transparent !important;
           border-radius: 0 !important;
        }
        .fc-scrollgrid-section-header, .fc-scrollgrid-section-footer {
          display: none !important;
        }
      `}</style>
    </>
  );
};
