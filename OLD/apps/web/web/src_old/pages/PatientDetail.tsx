import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  User as UserIcon, 
  CreditCard, 
  Clock, 
  FileText,
  Plus,
  Loader2,
  Activity,
  Image as ImageIcon,
  ShieldCheck,
  ChevronRight,
  User
} from "lucide-react";
import api from "../lib/api";
import { format, differenceInYears } from "date-fns";
import { es } from "date-fns/locale";
import { PRACTICE_META, STATUS_META } from "@dentalflow/shared";
import { cn } from "../lib/utils";
import Odontogram from "../components/clinical/Odontogram";
import AttachmentsGallery from "../components/clinical/AttachmentsGallery";
import { motion, AnimatePresence } from "framer-motion";

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

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("history");
  
  // Modals state
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', email: '' });

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await api.get(`/patients/${id}`);
      return res.data;
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: (data: any) => api.put(`/patients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      setIsEditModalOpen(false);
    },
  });

  const { data: toothConditionsResponse } = useQuery({
    queryKey: ["odontogram", id],
    queryFn: async () => {
      const res = await api.get(`/clinical/patients/${id}/odontogram`);
      return res.data;
    },
    enabled: activeTab === 'odontogram',
  });

  const upsertToothMutation = useMutation({
    mutationFn: (data: any) => api.post(`/clinical/patients/${id}/odontogram`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["odontogram", id] });
    },
  });

  if (isLoading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="card" style={{ padding: "48px", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.25rem", color: "#ef4444", fontWeight: 700 }}>Error al cargar el paciente</h2>
        <button onClick={() => navigate("/pacientes")} className="btn-secondary" style={{ marginTop: "16px", marginInline: "auto" }}>
          Volver al listado
        </button>
      </div>
    );
  }

  const age = differenceInYears(new Date(), new Date(patient.dob));
  const initials = `${patient.name[0]}${patient.lastName[0]}`.toUpperCase();

  // Convert array of tooth conditions to record mapping { toothNumber: conditionStr }
  const conditionsMap: Record<number, string> = {};
  if (toothConditionsResponse) {
    toothConditionsResponse.forEach((tc: any) => {
      conditionsMap[tc.toothNumber] = tc.condition;
    });
  }

  const handleToothClick = (toothNum: number) => {
    setSelectedTooth(toothNum);
  };

  const handleSetCondition = (condition: string) => {
    if (selectedTooth) {
      upsertToothMutation.mutate({
        toothNumber: selectedTooth,
        condition: condition
      });
      setSelectedTooth(null);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           <button 
             onClick={() => navigate("/pacientes")}
             style={{
               width: "40px", height: "40px", borderRadius: "10px",
               border: "1.5px solid var(--border)", background: "var(--bg-elevated)",
               display: "flex", alignItems: "center", justifyContent: "center",
               color: "var(--text-tertiary)", cursor: "pointer", transition: "all 0.15s"
             }}
             onMouseEnter={e => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.color = "#10b981" }}
             onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-tertiary)" }}
           >
             <ArrowLeft size={18} />
           </button>
           <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
             <div 
               style={{ 
                 width: "56px", height: "56px", borderRadius: "14px",
                 background: "var(--bg-subtle)", border: "1.5px solid var(--border)",
                 display: "flex", alignItems: "center", justifyContent: "center",
                 fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)"
               }}
             >
               {initials}
             </div>
             <div>
               <h1 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)", lineHeight: 1 }}>
                 {patient.lastName}, {patient.name}
               </h1>
               <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CreditCard size={14} /> {patient.dni}
                  </span>
                  <div style={{ width: "4px", height: "4px", borderRadius: "full", background: "var(--border)" }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-tertiary)" }}>{age} años</span>
               </div>
             </div>
           </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
           <button 
             onClick={() => {
               setEditForm({ phone: patient.phone || '', email: patient.email || '' });
               setIsEditModalOpen(true);
             }}
             className="btn-secondary"
           >
             <User size={16} /> Contacto
           </button>
           <button className="btn-primary" onClick={() => navigate('/agenda')}>
             <Plus size={16} /> Nuevo turno
           </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px", alignItems: "flex-start" }}>
        {/* Left Sidebar: Patient Info */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
           <div className="card glass" style={{ padding: "20px" }}>
             <h3 style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                Identidad y contacto
             </h3>
             <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "4px" }}>TELÉFONO</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={14} color="#10b981" /> {patient.phone}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "4px" }}>EMAIL</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Mail size={14} color="#10b981" /> 
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{patient.email || '—'}</span>
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "4px" }}>NACIMIENTO</p>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={14} color="#10b981" />
                    {format(new Date(patient.dob), "d/MM/yyyy", { locale: es })}
                  </p>
                </div>
             </div>
           </div>

           <div className="card glass" style={{ padding: "24px" }}>
             <h3 style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", marginBottom: "16px" }}>
                Cobertura Médica
             </h3>
             {patient.coverages?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {patient.coverages.map((c: any) => (
                    <div key={c.id} style={{ padding: "12px", background: "var(--bg-subtle)", borderRadius: "10px", border: "1.5px solid var(--border)" }}>
                      <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase", marginBottom: "2px" }}>{c.insurancePlan.provider.name}</p>
                      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{c.insurancePlan.name}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "4px", fontWeight: 600 }}>Nº {c.affiliateNumber || 'N/A'}</p>
                    </div>
                  ))}
               </div>
             ) : (
               <div style={{ padding: "16px", background: "var(--bg-subtle)", borderRadius: "10px", textAlign: "center", border: "1.5px dashed var(--border)" }}>
                 <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600 }}>Atención Particular</p>
               </div>
             )}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 card glass" style={{ padding: "0", display: "flex", flexDirection: "column", minHeight: "600px" }}>
           <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)", borderRadius: "16px 16px 0 0" }}>
             {[
               { id: 'history', label: 'Historial clínico', icon: FileText },
               { id: 'odontogram', label: 'Odontograma', icon: Activity },
               { id: 'attachments', label: 'Estudios / Fotos', icon: ImageIcon },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 style={{
                   flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                   padding: "16px", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
                   background: activeTab === tab.id ? "var(--bg-elevated)" : "transparent",
                   color: activeTab === tab.id ? "#10b981" : "var(--text-secondary)",
                   border: "none", borderBottom: activeTab === tab.id ? "2px solid #10b981" : "2px solid transparent",
                   transition: "all 0.15s"
                 }}
               >
                 <tab.icon size={16} />
                 {tab.label}
               </button>
             ))}
           </div>

           <div style={{ padding: "32px", flex: 1 }}>
             <AnimatePresence mode="wait">
               {activeTab === 'history' && (
                 <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                   {patient.appointments?.length === 0 ? (
                     <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text-tertiary)", fontSize: "0.875rem", fontWeight: 500 }}>
                       No hay registros clínicos previos para este paciente.
                     </div>
                   ) : (
                     patient.appointments.map((appt: any) => {
                       const practice = PRACTICE_META[appt.practiceType as keyof typeof PRACTICE_META] || PRACTICE_META.OTHER;
                       const status = STATUS_META[appt.status.toUpperCase() as keyof typeof STATUS_META] || STATUS_META.PENDING;
                       return (
                         <div key={appt.id} style={{ display: "flex", gap: "24px" }}>
                           <div style={{ width: "100px", flexShrink: 0 }}>
                              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>{format(new Date(appt.date), "dd/MM/yyyy")}</p>
                              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>{format(new Date(appt.date), "HH:mm")}</p>
                           </div>
                           <div style={{ flex: 1, padding: "20px", background: "var(--bg-subtle)", borderRadius: "12px", border: "1.5px solid var(--border)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                <div>
                                  <span className="badge" style={{ background: practice.bg, color: practice.color, marginBottom: "4px" }}>{practice.label}</span>
                                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>Atendido por Dr. {appt.professional.lastName}</h4>
                                </div>
                                <span className={cn("badge", status.color)}>{status.label}</span>
                              </div>
                              {appt.notes ? (
                                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>
                                  "{appt.notes}"
                                </p>
                              ) : (
                                <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>Sin notas registradas.</p>
                              )}
                           </div>
                         </div>
                       );
                     })
                   )}
                 </motion.div>
               )}

               {activeTab === 'odontogram' && (
                 <motion.div key="odontogram" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                   <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>Estado Dental</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Control clínico por pieza dentaria</p>
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                         {CONDITIONS_LEGEND.map(c => (
                           <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                             <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.color }} />
                             <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)" }}>{c.label}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div style={{ padding: "24px", background: "var(--bg-subtle)", borderRadius: "16px", border: "1.5px solid var(--border)" }}>
                      <Odontogram 
                        conditions={conditionsMap} 
                        onToothClick={handleToothClick} 
                      />
                   </div>
                 </motion.div>
               )}

               {activeTab === 'attachments' && (
                 <motion.div key="attachments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                   <AttachmentsGallery patientId={patient.id} />
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </div>

      {/* Edit Contact Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: "relative", zIndex: 1, background: "var(--bg-elevated)", borderRadius: "16px", width: "100%", maxWidth: "400px", padding: "24px", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)" }}
            >
               <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "20px", textAlign: "center" }}>Actualizar contacto</h3>
               <form 
                 onSubmit={(e) => { e.preventDefault(); updatePatientMutation.mutate(editForm); }}
                 style={{ display: "flex", flexDirection: "column", gap: "16px" }}
               >
                  <div>
                    <label style={labelStyle}>Número de teléfono</label>
                    <input type="text" required value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>{updatePatientMutation.isPending ? <Loader2 className="animate-spin" size={16}/> : 'Guardar'}</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tooth Selection Modal */}
      <AnimatePresence>
        {selectedTooth && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTooth(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: "relative", zIndex: 1, background: "var(--bg-elevated)", borderRadius: "16px", width: "100%", maxWidth: "440px", padding: "32px", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)" }}
            >
               <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Pieza dental</p>
                  <h3 style={{ fontSize: "3rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#10b981", lineHeight: 1 }}>{selectedTooth}</h3>
               </div>
               
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                  {[
                    { id: 'HEALTHY', label: 'Sano' },
                    { id: 'CARIES', label: 'Caries' },
                    { id: 'FILLED', label: 'Restaurado' },
                    { id: 'EXTRACTED', label: 'Extraído' },
                    { id: 'CROWN', label: 'Corona' },
                    { id: 'ROOT_CANAL', label: 'Endodoncia' },
                  ].map(c => (
                    <button 
                      key={c.id}
                      onClick={() => handleSetCondition(c.id)} 
                      style={{
                        padding: "12px", border: "1.5px solid var(--border)", borderRadius: "10px",
                        fontSize: "0.75rem", fontWeight: 700, background: "var(--bg-subtle)",
                        color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.1s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.color = "#10b981" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
                    >
                      {c.label}
                    </button>
                  ))}
               </div>

               <button onClick={() => setSelectedTooth(null)} className="btn-secondary" style={{ width: "100%" }}>Descartar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CONDITIONS_LEGEND = [
  { label: 'Caries', color: '#f43f5e' },
  { label: 'Restaurado', color: '#3b82f6' },
  { label: 'Extraído', color: '#475569' },
  { label: 'Corona', color: '#fbbf24' },
];
