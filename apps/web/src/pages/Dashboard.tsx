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
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { PRACTICE_META, STATUS_META } from "@dentalflow/shared";
import { cn } from "../lib/utils";
import NewAppointmentModal from "../components/NewAppointmentModal";

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
      bg: "rgba(16,185,129,0.08)",
    },
    {
      icon: Users,
      label: "Pacientes atendidos",
      value: data?.metrics.attendedPatients ?? "—",
      change: "+8%",
      positive: true,
      accent: "#6366f1",
      bg: "rgba(99,102,241,0.08)",
    },
    {
      icon: CalendarClock,
      label: "Turnos pendientes",
      value: data?.metrics.pendingTurns ?? "—",
      change: "−3%",
      positive: false,
      accent: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
    {
      icon: CalendarX,
      label: "Cancelaciones",
      value: data?.metrics.cancelledTurns ?? "—",
      change: "+2%",
      positive: false,
      accent: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div>
          <h1 className="page-title">Vista General</h1>
          <p className="page-subtitle">Resumen del día en tu clínica</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Nueva cita
        </button>
      </motion.div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            custom={i + 1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="stat-card glass"
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: m.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <m.icon size={20} color={m.accent} strokeWidth={1.75} />
              </div>
              <span style={{
                fontSize: "0.7rem", fontWeight: 700,
                color: m.positive ? "#10b981" : "#ef4444",
                background: m.positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                padding: "3px 8px", borderRadius: "20px",
                display: "flex", alignItems: "center", gap: "2px",
              }}>
                <ArrowUpRight size={11} style={{ transform: m.positive ? "none" : "rotate(90deg)" }} />
                {m.change}
              </span>
            </div>
            <p style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1, marginBottom: "6px" }}>
              {isLoading ? <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> : m.value}
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              {m.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
        {/* Agenda Table */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card glass"
        >
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                Agenda del día
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                Turnos programados para hoy
              </p>
            </div>
            <span style={{
              fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.06em", padding: "4px 10px", borderRadius: "20px",
              background: "rgba(16,185,129,0.1)", color: "#059669",
            }}>
              En curso
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
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
                    <td colSpan={5} style={{ textAlign: "center", padding: "48px 0" }}>
                      <Loader2 size={28} color="#10b981" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
                    </td>
                  </tr>
                ) : !data?.agenda || data.agenda.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "64px 0" }}>
                      <CalendarClock size={40} color="var(--text-tertiary)" style={{ margin: "0 auto 12px" }} />
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500 }}>
                        Sin turnos agendados para hoy
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.agenda.map((appt: any) => {
                    const practice = PRACTICE_META[appt.practice as keyof typeof PRACTICE_META] || PRACTICE_META.OTHER;
                    const status = STATUS_META[appt.status.toUpperCase() as keyof typeof STATUS_META] || STATUS_META.PENDING;
                    return (
                      <tr key={appt.id}>
                        <td>
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                            {appt.time}
                          </span>
                        </td>
                        <td>
                          <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>{appt.patient}</p>
                        </td>
                        <td>
                          <span className={cn("badge", practice.bg, practice.color)} style={{ fontSize: "0.7rem" }}>
                            {practice.label}
                          </span>
                        </td>
                        <td>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Dr. {appt.professional}</p>
                        </td>
                        <td>
                          <span className={cn("badge", status.color)} style={{
                            background: "transparent",
                            display: "flex", alignItems: "center", gap: "5px",
                            fontSize: "0.78rem", fontWeight: 600,
                          }}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Stats */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="card glass" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={16} color="#6366f1" />
              </div>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                Rendimiento
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Ocupación", value: 84, color: "#10b981" },
                { label: "Satisfacción", value: 97, color: "#6366f1" },
                { label: "Puntualidad", value: 76, color: "#f59e0b" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>{stat.label}</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-primary)", fontWeight: 700 }}>{stat.value}%</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-subtle)", borderRadius: "99px", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                      style={{ height: "100%", background: stat.color, borderRadius: "99px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Alert Card */}
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="card glass" style={{ padding: "24px", borderRadius: "24px" }}>
            <div style={{
              width: "100%", padding: "18px", borderRadius: "16px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0, animation: "pulse-dot 2s infinite" }} />
                <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.02em" }}>Recordatorios activos</p>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 500 }}>
                Los recordatorios de WhatsApp se enviarán automáticamente 24hs antes de cada cita para reducir ausentismo.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
