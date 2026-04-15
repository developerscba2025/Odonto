import { z } from 'zod';

// ─── Auth ───────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nombre demasiado corto'),
  lastName: z.string().min(2, 'Apellido demasiado corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: 'ADMIN' | 'PROFESSIONAL';
  professionalProfile?: {
    specialty?: string | null;
    color?: string | null;
    avatar?: string | null;
  } | null;
}

// ─── Patient ─────────────────────────────────────────────────────────────────
export const PatientSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  dni: z.string().min(7, 'DNI demasiado corto').max(12, 'DNI demasiado largo'), // Allow points/spaces
  dob: z.string().min(1, 'Requerido'), // ISO string
  phone: z.string().min(6, 'Teléfono inválido'),
  email: z.string().email().optional().or(z.literal('')),
});
export type PatientInput = z.infer<typeof PatientSchema>;

// ─── Appointment ──────────────────────────────────────────────────────────────
export const PRACTICE_TYPES = [
  'GENERAL_CONSULTATION',
  'EXTRACTION',
  'CLEANING',
  'ORTHODONTICS',
  'URGENT',
  'XRAY',
  'OTHER',
] as const;
export type PracticeType = (typeof PRACTICE_TYPES)[number];

export const APPOINTMENT_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const AppointmentSchema = z.object({
  date: z.string().min(1, 'Requerido'),
  duration: z.number().min(15).max(180).default(30),
  notes: z.string().optional(),
  practiceType: z.enum(PRACTICE_TYPES),
  status: z.enum(APPOINTMENT_STATUSES).default('PENDING'),
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
});
export type AppointmentInput = z.infer<typeof AppointmentSchema>;

// ─── Practice labels/colors ───────────────────────────────────────────────────
export const PRACTICE_META: Record<
  PracticeType,
  { label: string; color: string; bg: string; icon: string }
> = {
  GENERAL_CONSULTATION: { label: 'Consulta general', color: '#6366f1', bg: '#eef2ff', icon: 'Stethoscope' },
  EXTRACTION:           { label: 'Extracción',        color: '#ef4444', bg: '#fef2f2', icon: 'Activity'    },
  CLEANING:             { label: 'Limpieza',          color: '#10b981', bg: '#ecfdf5', icon: 'Sparkles'    },
  ORTHODONTICS:         { label: 'Ortodoncia',        color: '#a855f7', bg: '#faf5ff', icon: 'ShieldPlus'  },
  URGENT:               { label: 'Urgencia',          color: '#f59e0b', bg: '#fffbeb', icon: 'AlertCircle' },
  XRAY:                 { label: 'Radiografía',       color: '#64748b', bg: '#f8fafc', icon: 'Camera'      },
  OTHER:                { label: 'Otro',              color: '#334155', bg: '#f1f5f9', icon: 'MoreHorizontal' },
};

export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; color: string; dot: string; bg: string }
> = {
  PENDING:   { label: 'Pendiente',   color: '#b45309', dot: '#f59e0b', bg: '#fffbeb' },
  CONFIRMED: { label: 'Confirmado',  color: '#047857', dot: '#10b981', bg: '#ecfdf5' },
  CANCELLED: { label: 'Cancelado',   color: '#b91c1c', dot: '#ef4444', bg: '#fef2f2' },
  COMPLETED: { label: 'Completado',  color: '#334155', dot: '#64748b', bg: '#f1f5f9' },
};
