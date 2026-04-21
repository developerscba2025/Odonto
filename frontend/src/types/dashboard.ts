export interface UpcomingAppointment {
  id: string;
  patientId: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
  service: string | null;

  patient: {
    firstName: string;
    lastName: string;
  };
  professional: {
    name: string;
    color: string | null;
  };
}

export interface DashboardStats {
  patientCount: number;
  appointmentsToday: number;
  pendingAppointments: number;
  upcomingAppointments: UpcomingAppointment[];
  showingNextDays?: boolean;
  clinicSettings?: {
    openTime: string;
    closeTime: string;
  };
}

export interface FunnelStats {
  total: number;
  confirmed: number;
  passed: number;
  active: number;
}
