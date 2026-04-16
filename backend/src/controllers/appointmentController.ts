import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start ? new Date(String(start)) : undefined,
          lte: end ? new Date(String(end)) : undefined
        }
      },
      include: {
        patient: {
          select: { firstName: true, lastName: true, dni: true }
        },
        professional: {
          select: { name: true, color: true }
        }
      }
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error in getAllAppointments:', error);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const data = req.body;
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
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear turno' });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
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

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    res.json({ message: 'Turno eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar turno' });
  }
};
