import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getHistoryByPatient = async (req: Request, res: Response): Promise<any> => {
  try {
    const { patientId } = req.params;
    const history = await prisma.clinicalHistory.findMany({
      where: { patientId },
      include: {
        professional: { select: { name: true } },
        odontogramEntries: true
      },
      orderBy: { date: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historia clínica' });
  }
};

export const createEvolution = async (req: any, res: Response) => {
  try {
    const { patientId, description, odontogram, attachments } = req.body;
    const professionalId = req.user.id;

    const newEvolution = await prisma.clinicalHistory.create({
      data: {
        patientId,
        professionalId,
        description,
        attachments: {
          create: attachments?.map((att: any) => ({
            type: att.type || 'PHOTO',
            url: att.url,
            description: att.description
          }))
        },
        odontogramEntries: {
          create: odontogram?.map((item: any) => ({
            patientId,
            toothNumber: item.toothNumber,
            status: item.status,
            notes: item.notes
          }))
        }
      },
      include: {
        odontogramEntries: true,
        attachments: true
      }
    });

    res.status(201).json(newEvolution);
  } catch (error) {
    console.error('Error creating evolution:', error);
    res.status(500).json({ error: 'Error al registrar evolución médica' });
  }
};

export const getTreatmentPlans = async (req: Request, res: Response): Promise<any> => {
  try {
    const { patientId } = req.params;
    const plans = await prisma.treatmentPlan.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener planes de tratamiento' });
  }
};

export const createTreatmentPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const { patientId, description, budget, status } = req.body;
    const newPlan = await prisma.treatmentPlan.create({
      data: {
        patientId,
        description,
        budget,
        status: status || 'PENDING'
      }
    });
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear plan de tratamiento' });
  }
};
