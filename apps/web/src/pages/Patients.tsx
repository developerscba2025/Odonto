import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, UserPlus, Eye, Calendar, Loader2 } from "lucide-react";
import api from "../lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
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
    <div className="max-w-[1200px] mx-auto">
      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8 flex items-start sm:items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">Gestiona la base de datos de pacientes y su historial</p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} />
          Nuevo paciente
        </button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card glass p-5 mb-5 flex gap-3 items-center"
      >
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button className="btn-secondary shrink-0">
          <Filter size={15} />
          Filtrar
        </button>
      </motion.div>

      {/* Results Table */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card glass overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Obra Social</th>
                <th>Teléfono</th>
                <th>Última visita</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={32} className="text-primary animate-spin" />
                      <p className="text-sm font-semibold text-text-tertiary">Cargando pacientes...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-red-500 font-semibold text-sm">
                    Error al cargar los pacientes. Verificá que el servidor esté activo.
                  </td>
                </tr>
              ) : !patients || patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <Search size={44} className="text-border" />
                      <div className="text-center">
                        <p className="text-sm font-semibold text-text-primary mb-1">
                          {searchTerm ? "Sin resultados" : "No hay pacientes aún"}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {searchTerm
                            ? "Probá con otro nombre, apellido o DNI"
                            : "Empezá agregando tu primer paciente al sistema"}
                        </p>
                      </div>
                      {!searchTerm && (
                        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                          <UserPlus size={15} />
                          Agregar primer paciente
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map((p: any) => {
                  const latestAppt = p.appointments?.[0];
                  const coverage = p.coverages?.[0]?.insurancePlan;
                  const initials = `${p.name?.[0] || "?"}${p.lastName?.[0] || "?"}`.toUpperCase();

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-bg-subtle border border-border flex items-center justify-center text-text-secondary font-extrabold text-xs shrink-0 select-none">
                            {initials}
                          </div>
                          <Link
                            to={`/pacientes/${p.id}`}
                            className="font-semibold text-text-primary text-sm no-underline hover:text-primary transition-colors duration-150"
                          >
                            {p.lastName}, {p.name}
                          </Link>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm text-text-secondary tracking-wide">{p.dni}</span>
                      </td>
                      <td>
                        {coverage ? (
                          <span className="badge bg-primary/10 text-primary text-[0.7rem] font-semibold">
                            {coverage.provider.name}
                          </span>
                        ) : (
                          <span className="text-[0.7rem] font-semibold text-text-tertiary uppercase tracking-wider">
                            Particular
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-sm text-text-secondary">{p.phone}</span>
                      </td>
                      <td>
                        <span className="text-sm text-text-secondary font-medium">
                          {latestAppt
                            ? format(new Date(latestAppt.date), "dd MMM yyyy", { locale: es })
                            : "—"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            to={`/pacientes/${p.id}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-bg-subtle hover:text-primary transition-all duration-150 no-underline"
                            title="Ver detalle"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:bg-bg-subtle hover:text-primary transition-all duration-150 bg-transparent border-none cursor-pointer"
                            title="Agendar turno"
                          >
                            <Calendar size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <NewPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
