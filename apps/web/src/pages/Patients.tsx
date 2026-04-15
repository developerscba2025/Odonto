import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, UserPlus, Eye, Calendar, Loader2 } from "lucide-react";
import api from "../lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

import NewPatientModal from "../components/NewPatientModal";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function Patients() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ["patients", searchTerm],
    queryFn: async () => {
      const res = await api.get(`/patients?search=${searchTerm}`);
      return res.data;
    },
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">Gestiona la base de datos de pacientes y su historial</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} />
          Nuevo paciente
        </button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        style={{ transitionDelay: "0.1s" }}
        className="card glass"
        style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            color="var(--text-tertiary)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-subtle)',
              border: '1.5px solid var(--border)',
              borderRadius: '10px',
              padding: '10px 16px 10px 42px',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: '"Inter", sans-serif',
              transition: 'all 0.15s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <button className="btn-secondary">
          <Filter size={16} />
          Filtrar
        </button>
      </motion.div>

      {/* Results Table */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        style={{ transitionDelay: "0.2s" }}
        className="card glass"
      >
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>DNI / Identificación</th>
                <th>Cobertura</th>
                <th>Teléfono</th>
                <th>Última visita</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "64px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                       <Loader2 size={32} color="#10b981" style={{ animation: "spin 1s linear infinite" }} />
                       <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-tertiary)" }}>Cargando pacientes...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px 0", color: "#ef4444", fontWeight: 600 }}>
                    Error al cargar los pacientes.
                  </td>
                </tr>
              ) : patients?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "80px 0" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                       <Search size={48} color="var(--border)" />
                       <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                         No se encontraron pacientes que coincidan con la búsqueda
                       </p>
                    </div>
                  </td>
                </tr>
              ) : (patients?.map((p: any) => {
                const latestAppt = p.appointments?.[0];
                const coverage = p.coverages?.[0]?.insurancePlan;
                const initials = `${p.name[0]}${p.lastName[0]}`.toUpperCase();

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "8px",
                          background: "var(--bg-subtle)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "var(--text-secondary)", fontWeight: 700, fontSize: "0.75rem",
                          border: "1px solid var(--border)",
                        }}>
                          {initials}
                        </div>
                        <Link
                          to={`/pacientes/${p.id}`}
                          style={{ fontWeight: 700, color: "var(--text-primary)", textDecoration: "none", fontSize: "0.875rem" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#10b981"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--text-primary)"}
                        >
                          {p.lastName}, {p.name}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.875rem" }}>{p.dni}</span>
                    </td>
                    <td>
                      {coverage ? (
                        <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "0.7rem" }}>
                          {coverage.provider.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Particular</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>{p.phone}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {latestAppt ? format(new Date(latestAppt.date), "dd/MM/yyyy", { locale: es }) : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        <Link
                          to={`/pacientes/${p.id}`}
                          style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--text-tertiary)", transition: "all 0.15s",
                            background: "transparent",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "#10b981" }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)" }}
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--text-tertiary)", transition: "all 0.15s",
                            background: "transparent", border: "none", cursor: "pointer",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "#10b981" }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)" }}
                        >
                          <Calendar size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <NewPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
