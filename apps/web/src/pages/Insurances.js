import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, ShieldCheck, Loader2, Building2, X } from "lucide-react";
import api from "../lib/api";
export default function Insurances() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [newName, setNewName] = useState("");
    const { data: insurances, isLoading } = useQuery({
        queryKey: ["insurances"],
        queryFn: async () => {
            const res = await api.get("/insurances");
            return res.data;
        },
    });
    const createProviderMutation = useMutation({
        mutationFn: (name) => api.post("/insurances/providers", { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["insurances"] });
            setShowProviderModal(false);
            setNewName("");
        },
    });
    const createPlanMutation = useMutation({
        mutationFn: (data) => api.post("/insurances/plans", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["insurances"] });
            setShowPlanModal(false);
            setNewName("");
        },
    });
    const deleteProviderMutation = useMutation({
        mutationFn: (id) => api.delete(`/insurances/providers/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["insurances"] }),
    });
    const deletePlanMutation = useMutation({
        mutationFn: (id) => api.delete(`/insurances/plans/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["insurances"] }),
    });
    const filteredInsurances = insurances?.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between px-2", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100", children: _jsx(ShieldCheck, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900", children: "Obras Sociales" }), _jsx("p", { className: "text-sm text-slate-500 font-medium", children: "Gestiona prestadores y planes de cobertura." })] })] }), _jsxs("button", { onClick: () => setShowProviderModal(true), className: "btn-primary bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100 flex items-center gap-2", children: [_jsx(Plus, { className: "w-5 h-5" }), "Nuevo Prestador"] })] }), _jsxs("div", { className: "card-premium p-6", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Buscar obra social...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full bg-slate-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-emerald-100 focus:bg-white focus:ring-4 focus:ring-emerald-50/50 outline-none transition-all" })] }), _jsx("div", { className: "space-y-4", children: isLoading ? (_jsx("div", { className: "flex flex-col gap-4", children: [1, 2, 3].map(i => _jsx("div", { className: "h-20 bg-slate-50 animate-pulse rounded-2xl" }, i)) })) : (filteredInsurances?.map((provider) => (_jsxs("div", { className: "group border border-slate-100 rounded-2xl hover:border-emerald-100 hover:bg-emerald-50/5 transition-all overflow-hidden", children: [_jsxs("div", { className: "p-5 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors", children: _jsx(Building2, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-800", children: provider.name }), _jsxs("p", { className: "text-xs text-slate-400 font-medium", children: [provider.plans.length, " planes registrados"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => { setSelectedProvider(provider); setShowPlanModal(true); }, className: "px-4 py-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors", children: "A\u00F1adir Plan" }), _jsx("button", { onClick: () => { if (confirm("¿Eliminar prestador y sus planes?"))
                                                        deleteProviderMutation.mutate(provider.id); }, className: "p-2 text-slate-300 hover:text-rose-500 transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }), provider.plans.length > 0 && (_jsx("div", { className: "bg-slate-50/50 px-5 py-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: provider.plans.map((plan) => (_jsxs("div", { className: "bg-white border border-slate-100 px-3 py-2 rounded-xl flex items-center justify-between group/plan", children: [_jsx("span", { className: "text-[11px] font-bold text-slate-600", children: plan.name }), _jsx("button", { onClick: () => deletePlanMutation.mutate(plan.id), className: "opacity-0 group-hover/plan:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all", children: _jsx(X, { className: "w-3 h-3" }) })] }, plan.id))) }))] }, provider.id)))) })] }), showProviderModal && (_jsx("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "card-premium w-full max-w-md p-8 animate-in zoom-in-95 duration-200", children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 mb-2", children: "Nuevo Prestador" }), _jsx("p", { className: "text-sm text-slate-500 mb-6", children: "Ingresa el nombre de la nueva obra social." }), _jsx("input", { type: "text", value: newName, onChange: (e) => setNewName(e.target.value), placeholder: "Ej. OSDE", className: "w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm focus:border-emerald-100 outline-none transition-all mb-6" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setShowProviderModal(false), className: "flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm", children: "Cancelar" }), _jsx("button", { onClick: () => createProviderMutation.mutate(newName), disabled: !newName, className: "flex-[2] py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100", children: createProviderMutation.isPending ? _jsx(Loader2, { className: "w-5 h-5 animate-spin mx-auto" }) : "Crear Prestador" })] })] }) })), showPlanModal && (_jsx("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "card-premium w-full max-w-md p-8 animate-in zoom-in-95 duration-200", children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 mb-2", children: "Nuevo Plan" }), _jsx("p", { className: "text-sm text-slate-500 mb-1", children: "A\u00F1adiendo plan para:" }), _jsx("p", { className: "text-sm font-bold text-emerald-600 mb-6", children: selectedProvider?.name }), _jsx("input", { type: "text", value: newName, onChange: (e) => setNewName(e.target.value), placeholder: "Ej. Plan 210", className: "w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3 text-sm focus:border-emerald-100 outline-none transition-all mb-6" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setShowPlanModal(false), className: "flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm", children: "Cancelar" }), _jsx("button", { onClick: () => createPlanMutation.mutate({ name: newName, providerId: selectedProvider?.id }), disabled: !newName, className: "flex-[2] py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100", children: createPlanMutation.isPending ? _jsx(Loader2, { className: "w-5 h-5 animate-spin mx-auto" }) : "Añadir Plan" })] })] }) }))] }));
}
