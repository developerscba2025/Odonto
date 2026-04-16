import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const { includeDeleted, search } = req.query;
    
    const patients = await prisma.patient.findMany({
      where: {
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
      },
      orderBy: { lastName: 'asc' }
    });
    
    res.json(patients);
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

export const createPatient = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newPatient = await prisma.patient.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null
      }
    });
    res.status(201).json(newPatient);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un paciente con ese DNI' });
    }
    res.status(500).json({ error: 'Error al crear paciente' });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
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

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
