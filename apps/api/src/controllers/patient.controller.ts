import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getAllPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, insurancePlanId } = req.query as {
      search?: string;
      insurancePlanId?: string;
    };

    const patients = await prisma.patient.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { lastName: { contains: search } },
                  { dni: { contains: search } },
                ],
              }
            : {},
          insurancePlanId
            ? { coverages: { some: { insurancePlanId } } }
            : {},
        ],
      },
      include: {
        coverages: {
          include: { insurancePlan: { include: { provider: true } } },
        },
        appointments: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { date: true, practiceType: true },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    res.json(patients);
  } catch {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        coverages: {
          include: { insurancePlan: { include: { provider: true } } },
        },
        appointments: {
          include: {
            professional: {
              select: { name: true, lastName: true, professionalProfile: true },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Paciente no encontrado' });
      return;
    }
    res.json(patient);
  } catch {
    res.status(500).json({ error: 'Error al obtener el paciente' });
  }
};

export const createPatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (data.dob) {
      data.dob = new Date(data.dob);
    }
    const patient = await prisma.patient.create({ data });
    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear paciente' });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.dob) {
      data.dob = new Date(data.dob);
    }
    const patient = await prisma.patient.update({ where: { id }, data });
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
};
