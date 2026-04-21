export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  obraSocial: string | null;
  phone?: string | null;
  email?: string | null;
  affiliateNum?: string | null;
  birthDate?: string | null;
}

export interface OdontogramEntry {
  id?: string;
  toothNumber: number;
  status: string; // JSON string of face statuses OR simple string 'EXTRACTION', etc.
  notes?: string | null;
}

export interface Attachment {
  id: string;
  clinicalHistoryId?: string;
  type: string;
  url: string;
  description?: string | null;
  createdAt?: string;
}

export interface Evolution {
  id: string;
  date: string;
  description: string;
  professional: { name: string };
  odontogramEntries: OdontogramEntry[];
  attachments: Attachment[];
}

export interface TreatmentPlanTask {
  id: string;
  desc: string;
  done: boolean;
}

export interface TreatmentPlan {
  id: string;
  patientId?: string;
  description: string;
  budget: number | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | string;
  tasks: string; // Serialized TreatmentPlanTask[] JSON string
  createdAt: string;
}
