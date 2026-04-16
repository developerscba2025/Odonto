import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getClinicSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.clinicSettings.findUnique({
      where: { id: 'singleton' }
    });

    if (!settings) {
      settings = await prisma.clinicSettings.create({
        data: {
          id: 'singleton',
          name: 'DentalFlow Centro Clínico',
          phone: '',
          address: '',
          logoUrl: ''
        }
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la configuración de la clínica' });
  }
};

export const updateClinicSettings = async (req: Request, res: Response) => {
  try {
    const { name, phone, address, logoUrl } = req.body;
    
    const settings = await prisma.clinicSettings.upsert({
      where: { id: 'singleton' },
      update: { name, phone, address, logoUrl },
      create: { id: 'singleton', name, phone, address, logoUrl }
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la configuración de la clínica' });
  }
};
