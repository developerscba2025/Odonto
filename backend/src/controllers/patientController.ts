import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createPatientSchema } from '../lib/validators';
import { AuthRequest } from '../middleware/auth';


export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const { includeDeleted, search } = req.query;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const whereObj = {
        AND: [
          includeDeleted === 'true' ? {} : { isDeleted: false },
          search ? {
            OR: [
              { firstName: { contains: String(search) } },
              { lastName: { contains: String(search) } },
              { dni: { contains: String(search) } }
            ]
          } : {}
        ]
    };

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereObj,
        orderBy: { lastName: 'asc' },
        skip,
        take: limit
      }),
      prisma.patient.count({ where: whereObj })
    ]);
    
    res.json({
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

export const getPatientById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: true,
        clinicalHist: {
          include: {
            odontogramEntries: true
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalle del paciente' });
  }
};

export const createPatient = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const data = createPatientSchema.parse(req.body);
    const userId = req.user!.id;

    const newPatient = await prisma.patient.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null
      }
    });

    res.status(201).json(newPatient);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.code === 'P2002') {

      return res.status(400).json({ error: 'Ya existe un paciente con ese DNI' });
    }
    res.status(500).json({ error: 'Error al crear paciente' });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user!.id;

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
};

export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Implementación de Borrado Lógico (Archivar)
    await prisma.patient.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.json({ message: 'Paciente archivado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al archivar paciente' });
  }
};
