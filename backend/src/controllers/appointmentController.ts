import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { createAppointmentSchema } from '../lib/validators';
import { notificationService } from '../services/notificationService';


export const getAllAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { start, end, page, limit } = req.query;
    const userRole = req.user!.role;
    const userId = req.user!.id;
    
    // Pagination params
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 100; // Limit higher for calendar view default
    const skip = (pageNum - 1) * limitNum;

    // Base query conditions
    const whereObj: any = {
      date: {
        gte: start ? new Date(String(start)) : undefined,
        lte: end ? new Date(String(end)) : undefined
      },
      isDeleted: false
    };

    // RBAC Security: if not ADMIN, only see your own appointments
    if (userRole !== 'ADMIN') {
      whereObj.professionalId = userId;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: whereObj,
        include: {
          patient: {
            select: { firstName: true, lastName: true, dni: true }
          },
          professional: {
            select: { name: true, color: true }
          }
        },
        orderBy: { date: 'asc' },
        skip,
        take: limitNum
      }),
      prisma.appointment.count({ where: whereObj })
    ]);
    
    res.json({
      data: appointments,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {

    console.error('Error in getAllAppointments:', error);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const data = createAppointmentSchema.parse(req.body);
    const userRole = req.user!.role;
    const userId = req.user!.id;

    if (userRole !== 'ADMIN' && data.professionalId !== userId) {
       return res.status(403).json({ error: 'No puedes agendar turnos para otros profesionales' });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        ...data,
        date: new Date(data.date)
      },
      include: {
        patient: true,
        professional: true
      }
    });
    
    // Notificar por WhatsApp
    notificationService.sendAppointmentConfirmation(newAppointment);

    res.status(201).json(newAppointment);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Error al crear turno' });
  }
};


export const updateAppointment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const userRole = req.user!.role;
    const userId = req.user!.id;

    if (userRole !== 'ADMIN') {
       const existing = await prisma.appointment.findUnique({ where: { id } });
       if (!existing || existing.professionalId !== userId) {
         return res.status(403).json({ error: 'Acceso denegado a este turno' });
       }
       if (data.professionalId && data.professionalId !== userId) {
         return res.status(403).json({ error: 'No puedes transferir el turno' });
       }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar turno' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userRole = req.user!.role;
    const userId = req.user!.id;

    if (userRole !== 'ADMIN') {
       const existing = await prisma.appointment.findUnique({ where: { id } });
       if (!existing || existing.professionalId !== userId) {
         return res.status(403).json({ error: 'Acceso denegado a este turno' });
       }
    }

    await prisma.appointment.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.json({ message: 'Turno eliminado lógicamente' });
  } catch (error) {

    res.status(500).json({ error: 'Error al eliminar turno' });
  }
};
