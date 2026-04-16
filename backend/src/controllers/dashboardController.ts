import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { startOfDay, endOfDay, addDays } from 'date-fns';

export const getStats = async (req: Request, res: Response) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const next7DaysEnd = endOfDay(addDays(new Date(), 7));

    const [patientCount, appointmentsToday, pendingAppointments, todayAppointments] = await prisma.$transaction([
      prisma.patient.count({ where: { isDeleted: false } }),
      prisma.appointment.count({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          isDeleted: false
        }
      }),
      prisma.appointment.count({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          status: 'PENDING',
          isDeleted: false
        }
      }),
      prisma.appointment.findMany({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          isDeleted: false
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        include: {
          patient: { select: { firstName: true, lastName: true } },
          professional: { select: { name: true, color: true } }
        }
      })
    ]);

    // Si no hay turnos hoy, buscar los próximos 7 días para el widget
    let upcomingAppointments = todayAppointments;
    if (todayAppointments.length === 0) {
      upcomingAppointments = await prisma.appointment.findMany({
        where: {
          date: { gt: todayEnd, lte: next7DaysEnd },
          isDeleted: false,
          status: { not: 'CANCELLED' }
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        take: 15,
        include: {
          patient: { select: { firstName: true, lastName: true } },
          professional: { select: { name: true, color: true } }
        }
      });
    }

    res.json({
      patientCount,
      appointmentsToday,
      pendingAppointments,
      upcomingAppointments,
      showingNextDays: todayAppointments.length === 0 && upcomingAppointments.length > 0
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

export const getDailyAlert = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const firstAppointment = await prisma.appointment.findFirst({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        isDeleted: false,
        status: { notIn: ['CANCELLED', 'ATTENDED'] }
      },
      orderBy: { startTime: 'asc' },
      select: { startTime: true }
    });

    if (!firstAppointment) {
      // Buscar próximo turno en los siguientes 7 días
      const nextApp = await prisma.appointment.findFirst({
        where: {
          date: { gt: todayEnd },
          isDeleted: false,
          status: { notIn: ['CANCELLED'] }
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        include: {
          patient: { select: { firstName: true, lastName: true } }
        }
      });

      if (!nextApp) {
        return res.json({ message: 'No hay turnos agendados próximamente.' });
      }

      const date = new Date(nextApp.date);
      const formatted = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      return res.json({ message: `Próximo turno: ${formatted} a las ${nextApp.startTime}hs — ${(nextApp as any).patient.lastName}` });
    }

    res.json({
      message: `¡Buen día! Tu primer turno de hoy comienza a las ${firstAppointment.startTime}hs`
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alerta diaria' });
  }
};
