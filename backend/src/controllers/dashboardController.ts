import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export const getStats = async (req: Request, res: Response) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const [patientCount, appointmentsToday, upcomingAppointments] = await prisma.$transaction([
      prisma.patient.count({ where: { isDeleted: false } }),
      prisma.appointment.count({
        where: {
          date: {
            gte: todayStart,
            lte: todayEnd
          }
        }
      }),
      prisma.appointment.findMany({
        where: {
          date: {
            gte: todayStart,
          },
          status: {
            notIn: ['CANCELLED', 'ATTENDED']
          }
        },
        take: 5,
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' }
        ],
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          professional: {
            select: {
              name: true,
              color: true
            }
          }
        }
      })
    ]);

    res.json({
      patientCount,
      appointmentsToday,
      upcomingAppointments
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

export const getDailyAlert = async (req: any, res: Response): Promise<any> => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const firstAppointment = await prisma.appointment.findFirst({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      orderBy: { startTime: 'asc' },
      select: { startTime: true }
    });

    if (!firstAppointment) {
      return res.json({ message: 'No tienes turnos para hoy.' });
    }

    res.json({ 
      message: `¡Buen día! Tu primer turno de hoy comienza a las ${firstAppointment.startTime}hs` 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alerta diaria' });
  }
};
