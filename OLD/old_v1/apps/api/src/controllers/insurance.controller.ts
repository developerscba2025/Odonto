import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getInsurances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const insurances = await prisma.insuranceProvider.findMany({
      include: { plans: true },
      orderBy: { name: 'asc' },
    });
    res.json(insurances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener obras sociales' });
  }
};

export const createProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const provider = await prisma.insuranceProvider.create({
      data: { name },
    });
    res.status(201).json(provider);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear prestador' });
  }
};

export const createPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, providerId } = req.body;
    const plan = await prisma.insurancePlan.create({
      data: { name, providerId },
    });
    res.status(201).json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear plan' });
  }
};

export const deleteProvider = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.insuranceProvider.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al eliminar prestador' });
    }
};

export const deletePlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await prisma.insurancePlan.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al eliminar plan' });
    }
};
