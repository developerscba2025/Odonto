import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getAllAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { start, end, professionalId } = req.query;

    const where: any = {};
    if (start && end) {
      where.date = {
        gte: new Date(start as string),
        lte: new Date(end as string),
      };
    }
    if (professionalId) {
      where.professionalId = professionalId as string;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: { name: true, lastName: true, phone: true },
        },
        professional: {
          select: { name: true, lastName: true, professionalProfile: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, duration, notes, practiceType, patientId, professionalId, status } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        duration: duration || 30,
        notes,
        practiceType,
        patientId,
        professionalId,
        status: status || 'PENDING',
      },
      include: {
        patient: true,
        professional: true,
      },
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el turno' });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, status, duration, notes, practiceType } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        status,
        duration,
        notes,
        practiceType,
      },
    });

    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el turno' });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Physical delete for now as per plan (or logical if preferred later)
    await prisma.appointment.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el turno' });
  }
};
