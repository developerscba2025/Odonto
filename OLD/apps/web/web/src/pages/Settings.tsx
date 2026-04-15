import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Settings as SettingsIcon, 
  Building2, 
  User as UserIcon, 
  CalendarOff,
  Plus,
  Trash2,
  Save,
  Loader2,
  Clock,
  MapPin,
  Phone,
  Palette,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../lib/utils";

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: '10px', fontSize: '0.875rem',
  outline: 'none', fontFamily: '"Inter", sans-serif',
  color: 'var(--text-primary)', background: 'var(--bg-subtle)',
  transition: 'all 0.15s', boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600 as const,
  color: 'var(--text-secondary)', marginBottom: '7px',
};

export default function Settings() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState("clinic");

  const { data: absences, isLoading: loadingAbsences } = useQuery({
    queryKey: ["absences"],
    queryFn: async () => {
      const res = await api.get("/absences");
      return res.data;
    },
  });

  const { data: professionals } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const res = await api.get("/auth/professionals");
      return res.data;
    },
  });

  const createAbsenceMutation = useMutation({
    mutationFn: (data: any) => api.post("/absences", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["absences"] }),
  });

  const deleteAbsenceMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/absences/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["absences"] }),
  });

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">Gestiona los datos de la clínica y tu perfil profesional</p>
      </div>

      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
        {/* Tabs Sidebar */}
        <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
           {[
             { id: 'clinic', icon: Building2, label: 'Datos clínicos' },
             { id: 'professional', icon: UserIcon, label: 'Mi perfil médico' },
             { id: 'absences', icon: CalendarOff, label: 'Licencias / Ausencias' },
           ].map(tab => (
             <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 16px", borderRadius: "12px",
                fontSize: "0.875rem", fontWeight: 600,
                background: activeTab === tab.id ? "#10b981" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                border: "none", cursor: "pointer", textAlign: "left",
                transition: "all 0.15s"
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id) e.currentTarget.style.background = "var(--bg-subtle)";
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) e.currentTarget.style.background = "transparent";
              }}
             >
               <tab.icon size={18} />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'clinic' && (
              <motion.div 
                key="clinic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="card" style={{ padding: "32px" }}
              >
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "24px", fontFamily: "var(--font-display)" }}>Información de la Clínica</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={labelStyle}>Nombre del centro</label>
                      <input type="text" defaultValue="OdontoMax Demo Clinic" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>WhatsApp de contacto</label>
                      <input type="text" defaultValue="+54 9 11 1234 5678" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Ubicación física</label>
                    <input type="text" defaultValue="Avenida Santa Fe 1234, CABA" style={inputStyle} />
                  </div>
                  
                  <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn-primary">
                      <Save size={16} />
                      Guardar configuración
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'professional' && (
              <motion.div 
                key="professional" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="card" style={{ padding: "32px" }}
              >
                 <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
                    <div 
                      style={{ 
                        width: "80px", height: "80px", borderRadius: "16px",
                        background: user?.professionalProfile?.color || '#10b981',
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem", fontWeight: 700, color: "white", boxShadow: "0 8px 16px rgba(16,185,129,0.2)"
                      }}
                    >
                      {user?.name?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{user?.name} {user?.lastName}</h2>
                      <p style={{ fontSize: "0.875rem", color: "#10b981", fontWeight: 600, marginTop: "4px" }}>{user?.professionalProfile?.specialty || 'Profesional de la Salud'}</p>
                    </div>
                 </div>

                 <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                     <div>
                        <label style={labelStyle}>Especialidad clínica</label>
                        <input type="text" defaultValue={user?.professionalProfile?.specialty || ""} style={inputStyle} />
                     </div>
                     <div>
                        <label style={labelStyle}>Color representativo</label>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <input type="color" defaultValue={user?.professionalProfile?.color || "#10b981"} style={{ width: "60px", height: "40px", padding: "2px", border: "1.5px solid var(--border)", borderRadius: "8px", background: "none" }} />
                          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>Este color identifica tus turnos en la agenda.</span>
                        </div>
                     </div>
                   </div>

                   <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn-primary">
                      <Save size={16} />
                      Actualizar perfil
                    </button>
                  </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'absences' && (
              <motion.div 
                key="absences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ display: "flex", flexDirection: "column", gap: "24px" }}
              >
                 <div className="card" style={{ padding: "24px" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                       <CalendarOff size={18} color="#10b981" />
                       Registrar ausencia
                    </h2>

                    <form 
                      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        createAbsenceMutation.mutate({
                          userId: formData.get("userId"),
                          start: formData.get("start"),
                          end: formData.get("end"),
                          reason: formData.get("reason"),
                        });
                        (e.target as HTMLFormElement).reset();
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Profesional</label>
                        <select name="userId" required style={inputStyle}>
                           <option value="">Selecciona profesional...</option>
                           {professionals?.map((p: any) => (
                             <option key={p.id} value={p.id}>{p.lastName}, {p.name}</option>
                           ))}
                        </select>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                           <label style={labelStyle}>Desde</label>
                           <input type="datetime-local" name="start" required style={inputStyle} />
                        </div>
                        <div>
                           <label style={labelStyle}>Hasta</label>
                           <input type="datetime-local" name="end" required style={inputStyle} />
                        </div>
                      </div>

                      <div>
                         <label style={labelStyle}>Motivo / Comentario</label>
                         <input type="text" name="reason" placeholder="Vacaciones, congreso, etc." style={inputStyle} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                         <button type="submit" className="btn-primary">
                            <Plus size={16} />
                            Registrar
                         </button>
                      </div>
                    </form>
                 </div>

                 <div className="card" style={{ padding: "24px" }}>
                    <h3 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
                      Historial de ausencias
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {loadingAbsences ? (
                        <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                      ) : absences?.length === 0 ? (
                        <p style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)", fontSize: "0.875rem", fontStyle: "italic" }}>
                          No hay ausencias registradas.
                        </p>
                      ) : (
                        absences?.map((abs: any) => (
                          <div key={abs.id} className="card-subtle" style={{ 
                            padding: "16px", background: "var(--bg-subtle)", borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "space-between"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CalendarOff size={20} />
                              </div>
                              <div>
                                 <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                   {abs.user.lastName}, {abs.user.name} 
                                   <span style={{ marginLeft: "8px", fontSize: "0.65rem", padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontWeight: 800, textTransform: "uppercase" }}>{abs.reason || 'Sin motivo'}</span>
                                 </p>
                                 <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: "4px" }}>
                                   {format(parseISO(abs.start), "d MMM, HH:mm", { locale: es })} — {format(parseISO(abs.end), "d MMM, HH:mm", { locale: es })}
                                 </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => deleteAbsenceMutation.mutate(abs.id)}
                              style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
