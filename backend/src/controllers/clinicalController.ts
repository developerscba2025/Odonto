import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { createEvolutionSchema } from '../lib/validators';



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

export const createEvolution = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { patientId, description, odontogram, attachments, treatmentPlanId } = req.body;
    const professionalId = req.user!.id;



    const newEvolution = await prisma.clinicalHistory.create({
      data: {
        patientId,
        professionalId,
        description,
        treatmentPlanId,
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
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
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
    const { patientId, description, budget, status, tasks } = req.body;
    const newPlan = await prisma.treatmentPlan.create({
      data: {
        patientId,
        description,
        budget,
        status: status || 'PENDING',
        tasks: tasks || '[]'
      }
    });
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear plan de tratamiento' });
  }
};

export const updateTreatmentPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tasks } = req.body;
    const updated = await prisma.treatmentPlan.update({
      where: { id },
      data: { 
        status: status !== undefined ? status : undefined, 
        tasks: tasks !== undefined ? tasks : undefined 
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar plan de tratamiento' });
  }
};
