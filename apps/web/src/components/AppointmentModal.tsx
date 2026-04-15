import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarPlus, Loader2, Calendar } from "lucide-react";
import { AppointmentSchema, type AppointmentInput } from "@dentalflow/shared";
import { PRACTICE_TYPES, PRACTICE_META, STATUS_META, APPOINTMENT_STATUSES } from "@dentalflow/shared";
import api from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { useEffect } from "react";
import { format, parseISO } from "date-fns";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointment?: any; // If provided, we are editing
  initialDate?: string; // For new appointments from calendar click
}

export default function AppointmentModal({ isOpen, onClose, appointment, initialDate }: Props) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ["patients-list"],
    queryFn: async () => {
      const res = await api.get("/patients?limit=200");
      return res.data.patients ?? res.data;
    },
    enabled: isOpen,
  });

  const { data: professionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const res = await api.get("/auth/professionals");
      return res.data;
    },
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(AppointmentSchema),
  });

  // Sync form with appointment data when editing
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        reset({
          patientId: appointment.patientId,
          professionalId: appointment.professionalId,
          practiceType: appointment.practiceType,
          date: appointment.date ? format(parseISO(appointment.date), "yyyy-MM-dd'T'HH:mm") : "",
          duration: appointment.duration,
          status: appointment.status,
          notes: appointment.notes || "",
        });
      } else {
        reset({
          patientId: "",
          professionalId: user?.id || "",
          practiceType: "GENERAL_CONSULTATION",
          date: initialDate ? format(parseISO(initialDate), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          duration: 30,
          status: "PENDING",
          notes: "",
        });
      }
    }
  }, [isOpen, appointment, initialDate, reset, user]);

  const onSubmit = async (data: AppointmentInput) => {
    try {
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
      };

      if (appointment?.id) {
        await api.patch(`/appointments/${appointment.id}`, payload);
      } else {
        await api.post("/appointments", payload);
      }

      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
    } catch (error) {
      console.error("Error saving appointment", error);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
    },
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative z-10 w-full max-w-[540px] bg-bg-elevated rounded-2xl shadow-xl overflow-hidden border border-border"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-bg-subtle/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {appointment ? <Calendar size={20} /> : <CalendarPlus size={20} />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary font-display">
                    {appointment ? "Detalles del turno" : "Agendar nuevo turno"}
                  </h2>
                  <p className="text-[0.7rem] text-text-tertiary mt-0.5">
                    {appointment ? "Gestioná la información de la cita" : "Completá los datos para la reserva"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-bg-subtle hover:text-red-500 transition-all border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Paciente</label>
                  <select {...register("patientId")} className="input-field">
                    <option value="">Seleccionar paciente...</option>
                    {patients?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName}, {p.name} — DNI {p.dni}
                      </option>
                    ))}
                  </select>
                  {errors.patientId && <p className="text-[0.7rem] text-red-500 mt-1.5 font-medium">{errors.patientId.message}</p>}
                </div>

                <div>
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Tratamiento</label>
                  <select {...register("practiceType")} className="input-field">
                    {PRACTICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {PRACTICE_META[type as keyof typeof PRACTICE_META]?.label || type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Fecha y hora</label>
                  <input type="datetime-local" {...register("date")} className="input-field" />
                  {errors.date && <p className="text-[0.7rem] text-red-500 mt-1.5 font-medium">{errors.date.message as string}</p>}
                </div>

                <div>
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Duración</label>
                  <select {...register("duration", { valueAsNumber: true })} className="input-field">
                    {[15, 20, 30, 45, 60, 90, 120].map((d) => (
                      <option key={d} value={d}>
                        {d} minutos
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Estado</label>
                  <select {...register("status")} className="input-field">
                    {APPOINTMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s.toUpperCase() as keyof typeof STATUS_META]?.label || s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Profesional</label>
                <select {...register("professionalId")} className="input-field">
                  {professionals?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      Dr. {p.lastName}, {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.78rem] font-bold text-text-secondary mb-2">Notas (opcional)</label>
                <textarea
                  {...register("notes")}
                  placeholder="Ej. El paciente llega tarde, o indicaciones de post-operatorio..."
                  className="input-field h-24 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                {appointment?.id && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("¿Estás seguro de eliminar este turno?")) {
                        deleteMutation.mutate(appointment.id);
                      }
                    }}
                    className="btn-secondary px-4 text-red-500 hover:bg-red-500/5 hover:border-red-500/20"
                    title="Eliminar turno"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-[1.5] justify-center"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : appointment?.id ? (
                    "Guardar cambios"
                  ) : (
                    "Confirmar turno"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
