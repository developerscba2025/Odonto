import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Trash2, 
  ShieldCheck, 
  MoreVertical,
  ChevronRight,
  Loader2,
  Building2,
  CreditCard,
  X
} from "lucide-react";
import api from "../lib/api";
import { cn } from "../lib/utils";
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

export default function Insurances() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [newName, setNewName] = useState("");

  const { data: insurances, isLoading } = useQuery({
    queryKey: ["insurances"],
    queryFn: async () => {
      const res = await api.get("/insurances");
      return res.data;
    },
  });

  const createProviderMutation = useMutation({
    mutationFn: (name: string) => api.post("/insurances/providers", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurances"] });
      setShowProviderModal(false);
      setNewName("");
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: { name: string, providerId: string }) => 
      api.post("/insurances/plans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurances"] });
      setShowPlanModal(false);
      setNewName("");
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/insurances/providers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["insurances"] }),
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/insurances/plans/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["insurances"] }),
  });

  const filteredInsurances = insurances?.filter((i: any) => 
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Obras Sociales</h1>
          <p className="page-subtitle">Gestiona prestadores médicos y sus planes de cobertura</p>
        </div>
        <button className="btn-primary" onClick={() => setShowProviderModal(true)}>
          <Plus size={16} />
          Nuevo prestador
        </button>
      </div>

      {/* Main Content */}
      <div className="card glass" style={{ padding: "24px" }}>
        <div style={{ position: "relative", marginBottom: "24px" }}>
          <Search size={18} color="var(--text-tertiary)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre de obra social..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "42px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: "60px", background: "var(--bg-subtle)", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : filteredInsurances?.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", fontWeight: 500 }}>No se encontraron obras sociales.</p>
            </div>
          ) : (
            filteredInsurances?.map((provider: any) => (
              <div key={provider.id} style={{ display: "flex", flexDirection: "column", border: "1.5px solid var(--border)", borderRadius: "16px", overflow: "hidden", background: "var(--bg-elevated)", transition: "all 0.15s" }}>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-elevated)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{provider.name}</h3>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>{provider.plans.length} planes registrados</p>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button 
                      onClick={() => { setSelectedProvider(provider); setShowPlanModal(true); }}
                      style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700, borderRadius: "8px", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "none", cursor: "pointer" }}
                    >
                      Añadir plan
                    </button>
                    <button 
                      onClick={() => { if(confirm("¿Eliminar prestador y todos sus planes?")) deleteProviderMutation.mutate(provider.id); }}
                      style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", color: "var(--text-tertiary)", border: "none", background: "none", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {provider.plans.length > 0 && (
                  <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                    {provider.plans.map((plan: any) => (
                      <div key={plan.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>{plan.name}</span>
                        <button 
                          onClick={() => deletePlanMutation.mutate(plan.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", opacity: 0.5 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(showProviderModal || showPlanModal) && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowProviderModal(false); setShowPlanModal(false); setNewName(""); }}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: "relative", zIndex: 1, background: "var(--bg-elevated)", borderRadius: "16px", width: "100%", maxWidth: "400px", padding: "32px", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)" }}
            >
               <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", fontFamily: "var(--font-display)" }}>
                 {showProviderModal ? "Nuevo prestador" : "Nuevo plan"}
               </h3>
               <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginBottom: "24px" }}>
                 {showProviderModal ? "Ingresa el nombre de la nueva obra social" : `Añadiendo plan para ${selectedProvider?.name}`}
               </p>
               
               <div style={{ marginBottom: "24px" }}>
                 <label style={labelStyle}>Nombre</label>
                 <input 
                   type="text"
                   value={newName}
                   onChange={(e) => setNewName(e.target.value)}
                   placeholder={showProviderModal ? "Ej. OSDE" : "Ej. Plan 210"}
                   style={inputStyle}
                   autoFocus
                 />
               </div>
               
               <div style={{ display: "flex", gap: "12px" }}>
                 <button 
                   onClick={() => { setShowProviderModal(false); setShowPlanModal(false); setNewName(""); }}
                   className="btn-secondary" style={{ flex: 1 }}
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={() => {
                     if (showProviderModal) createProviderMutation.mutate(newName);
                     else createPlanMutation.mutate({ name: newName, providerId: selectedProvider?.id });
                   }}
                   disabled={!newName || createProviderMutation.isPending || createPlanMutation.isPending}
                   className="btn-primary" style={{ flex: 2 }}
                 >
                   {(createProviderMutation.isPending || createPlanMutation.isPending) ? <Loader2 className="animate-spin" size={18} /> : "Guardar"}
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
