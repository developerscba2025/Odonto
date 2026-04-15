import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getAbsences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const absences = await prisma.professionalAbsence.findMany({
      include: { user: { select: { name: true, lastName: true } } },
      orderBy: { start: 'asc' },
    });
    res.json(absences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ausencias' });
  }
};

export const createAbsence = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, start, end, reason } = req.body;
    const absence = await prisma.professionalAbsence.create({
      data: {
        userId,
        start: new Date(start),
        end: new Date(end),
        reason,
      },
    });
    res.status(201).json(absence);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar ausencia' });
  }
};

export const deleteAbsence = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.professionalAbsence.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar ausencia' });
  }
};
