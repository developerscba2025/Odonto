import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { startOfDay, endOfDay } from 'date-fns';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // 1. Appointments of the day
    const appointmentsToday = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        patient: {
          select: { name: true, lastName: true },
        },
        professional: {
          select: { name: true, lastName: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    // 2. Metrics
    const turnsToday = appointmentsToday.length;
    const pendingTurns = appointmentsToday.filter(a => a.status === 'PENDING').length;
    const cancelledTurns = appointmentsToday.filter(a => a.status === 'CANCELLED').length;
    
    // We'll count "patients attended" as those with status COMPLETED or CONFIRMED (demo logic)
    const attendedPatients = appointmentsToday.filter(a => ['CONFIRMED', 'COMPLETED'].includes(a.status)).length;

    res.json({
      metrics: {
        turnsToday: turnsToday.toString(),
        attendedPatients: attendedPatients.toString(),
        pendingTurns: pendingTurns.toString(),
        cancelledTurns: cancelledTurns.toString(),
      },
      agenda: appointmentsToday.map(appt => ({
        id: appt.id,
        time: appt.date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
        patient: `${appt.patient.name} ${appt.patient.lastName}`,
        practice: appt.practiceType,
        professional: `${appt.professional.name} ${appt.professional.lastName}`,
        status: appt.status.toLowerCase(),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
};
