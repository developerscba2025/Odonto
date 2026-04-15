import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Plus,
  Loader2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { PRACTICE_META, STATUS_META } from "@dentalflow/shared";
import { cn } from "../lib/utils";
import AppointmentModal from "../components/AppointmentModal";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.3, ease: "easeOut" },
  }),
};

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data;
    },
  });

  const metrics = [
    {
      icon: CalendarCheck,
      label: "Turnos hoy",
      value: data?.metrics.turnsToday ?? "—",
      change: "+12%",
      positive: true,
      accent: "#10b981",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Users,
      label: "Pacientes atendidos",
      value: data?.metrics.attendedPatients ?? "—",
      change: "+8%",
      positive: true,
      accent: "#6366f1",
      bg: "bg-indigo-500/10",
    },
    {
      icon: CalendarClock,
      label: "Turnos pendientes",
      value: data?.metrics.pendingTurns ?? "—",
      change: "−3%",
      positive: false,
      accent: "#f59e0b",
      bg: "bg-amber-500/10",
    },
    {
      icon: CalendarX,
      label: "Cancelaciones",
      value: data?.metrics.cancelledTurns ?? "—",
      change: "+2%",
      positive: false,
      accent: "#ef4444",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Page Header */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8 flex items-start sm:items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="page-title">Vista General</h1>
          <p className="page-subtitle">Resumen del día en tu clínica</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Nueva cita
        </button>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            custom={i + 1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="card glass p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", m.bg)}>
                <m.icon size={20} color={m.accent} strokeWidth={1.75} />
              </div>
              <span
                className={cn(
                  "text-[0.68rem] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                  m.positive
                    ? "text-emerald-600 bg-emerald-500/10"
                    : "text-red-500 bg-red-500/10"
                )}
              >
                {m.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {m.change}
              </span>
            </div>
            <p className="text-[2rem] font-bold text-text-primary leading-none mb-1.5 font-display">
              {isLoading ? (
                <Loader2 size={22} className="text-text-tertiary animate-spin" />
              ) : (
                m.value
              )}
            </p>
            <p className="text-xs text-text-secondary font-medium">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        {/* Agenda Table */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card glass overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-[0.95rem] font-bold text-text-primary font-display">Agenda del día</h2>
              <p className="text-xs text-text-secondary mt-0.5">Turnos programados para hoy</p>
            </div>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
              En curso
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Práctica</th>
                  <th>Profesional</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 size={28} className="text-primary animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : !data?.agenda || data.agenda.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <CalendarClock size={40} className="text-border mx-auto mb-3" />
                      <p className="text-sm font-medium text-text-secondary">Sin turnos agendados para hoy</p>
                    </td>
                  </tr>
                ) : (
                  data.agenda.map((appt: any) => {
                    const practice =
                      PRACTICE_META[appt.practice as keyof typeof PRACTICE_META] || PRACTICE_META.OTHER;
                    const status =
                      STATUS_META[appt.status.toUpperCase() as keyof typeof STATUS_META] || STATUS_META.PENDING;
                    return (
                      <tr key={appt.id}>
                        <td>
                          <span className="font-bold font-display text-[0.9rem] text-text-primary">
                            {appt.time}
                          </span>
                        </td>
                        <td>
                          <p className="font-semibold text-text-primary text-sm">{appt.patient}</p>
                        </td>
                        <td>
                          <span className={cn("badge text-[0.7rem]", practice.bg, practice.color)}>
                            {practice.label}
                          </span>
                        </td>
                        <td>
                          <p className="text-[0.8rem] text-text-secondary">Dr. {appt.professional}</p>
                        </td>
                        <td>
                          <span
                            className={cn(
                              "flex items-center gap-1.5 text-[0.78rem] font-semibold",
                              status.color
                            )}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Performance Card */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="card glass p-5"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <TrendingUp size={15} color="#6366f1" />
              </div>
              <h3 className="text-sm font-bold text-text-primary font-display">Rendimiento</h3>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: "Ocupación", value: 84, color: "#10b981" },
                { label: "Satisfacción", value: 97, color: "#6366f1" },
                { label: "Puntualidad", value: 76, color: "#f59e0b" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-text-secondary font-medium">{stat.label}</span>
                    <span className="text-xs text-text-primary font-bold">{stat.value}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-subtle rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                      style={{ background: stat.color }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Alert Card */}
          <motion.div
            custom={7}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="card glass p-5"
          >
            <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/15">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span
                  className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                  style={{ animation: "pulse-dot 2s infinite" }}
                />
                <p className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                  Recordatorios activos
                </p>
              </div>
              <p className="text-[0.78rem] text-text-secondary leading-relaxed">
                Los recordatorios de WhatsApp se enviarán automáticamente 24hs antes de cada cita para
                reducir ausentismo.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
