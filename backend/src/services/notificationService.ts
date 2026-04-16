import cron from 'node-cron';
import prisma from '../lib/prisma';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { whatsappService } from './whatsappService';

/**
 * Servicio de Notificaciones
 * Usa whatsappService para envíos reales vía WhatsApp Web.js
 */
class NotificationService {
  /**
   * Envía una confirmación de turno agendado
   */
  async sendAppointmentConfirmation(appointment: any) {
    try {
      const fullApp = await prisma.appointment.findUnique({
        where: { id: appointment.id },
        include: { 
          patient: true,
          professional: true
        }
      });

      if (!fullApp || !fullApp.patient.phone) {
        console.log('[NOTIF] Paciente sin teléfono, se omite confirmación.');
        return;
      }

      const message = `🦷 *DentalFlow - Turno Agendado* ✅\n\nHola ${fullApp.patient.firstName}, tu turno ha sido agendado con éxito:\n\n📅 *Fecha:* ${format(new Date(fullApp.date), "EEEE d 'de' MMMM", { locale: es })}\n⏰ *Hora:* ${fullApp.startTime} hs\n👨‍⚕️ *Profesional:* ${fullApp.professional.name}\n📍 *Nexus Clínica Dental*\n\n¡Te esperamos! 😊`;

      await whatsappService.sendMessage(fullApp.patient.phone, message);
    } catch (error) {
      console.error('[NOTIF] Error en sendAppointmentConfirmation:', error);
    }
  }

  /**
   * Envía recordatorios diarios de los turnos del día
   */
  async sendDailyReminders() {
    try {
      const today = new Date();

      const appointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: startOfDay(today),
            lte: endOfDay(today)
          },
          status: { not: 'CANCELLED' },
          isDeleted: false
        },
        include: {
          patient: true,
          professional: true
        }
      });

      console.log(`[CRON] Procesando ${appointments.length} recordatorios para hoy...`);

      for (const app of appointments) {
        if (app.patient.phone) {
          const message = `🔔 *DentalFlow - Recordatorio de Turno*\n\nHola ${app.patient.firstName}, te recordamos que hoy tenés un turno agendado:\n\n⏰ *Hora:* ${app.startTime} hs\n👨‍⚕️ *Profesional:* ${app.professional.name}\n📍 *Nexus Clínica Dental*\n\nPor favor respondé con *OK* para confirmar tu asistencia. 🙏`;
          await whatsappService.sendMessage(app.patient.phone, message);
        }
      }
    } catch (error) {
      console.error('[NOTIF] Error en sendDailyReminders:', error);
    }
  }

  /**
   * Inicializa las tareas programadas (Crones)
   */
  initScheduledTasks() {
    // Se ejecuta todos los días a las 08:00 AM hora Argentina
    cron.schedule('0 8 * * *', () => {
      console.log('[CRON] Iniciando envío de recordatorios diarios (08:00 AM)');
      this.sendDailyReminders();
    }, {
      timezone: "America/Argentina/Buenos_Aires"
    });
    
    console.log('[NOTIFICATION_SERVICE] ✅ Tareas programadas inicializadas.');
  }
}

export const notificationService = new NotificationService();
