import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const createPatientSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().min(6, 'El DNI debe tener al menos 6 caracteres'),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  obraSocial: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable()
});

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  date: z.string(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de inicio inválida'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de fin inválida'),
  status: z.string().default('PENDING'),
  reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  service: z.string().optional().nullable()
});

export const createEvolutionSchema = z.object({
  patientId: z.string().uuid(),
  description: z.string().optional(),
  odontogram: z.array(z.object({
    toothNumber: z.number().int().min(11).max(85),
    status: z.string(),
    notes: z.string().optional()
  })).optional(),
  attachments: z.array(z.object({
    url: z.string(),
    type: z.string().optional(),
    description: z.string().optional()
  })).optional()
}).refine(data => data.description || (data.attachments && data.attachments.length > 0), {
  message: 'Debe proveer una descripción o al menos una imagen',
  path: ['description']
});
