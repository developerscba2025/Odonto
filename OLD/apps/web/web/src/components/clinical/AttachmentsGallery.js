import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileImage, FileText, Upload, Trash2, Loader2, Eye, X } from "lucide-react";
import api from "../../lib/api";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
export default function AttachmentsGallery({ patientId }) {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); // For preview
    const { data: attachments, isLoading } = useQuery({
        queryKey: ["attachments", patientId],
        queryFn: async () => {
            const res = await api.get(`/clinical/patients/${patientId}/attachments`);
            return res.data;
        },
    });
    const createAttachmentMutation = useMutation({
        mutationFn: (data) => api.post(`/clinical/patients/${patientId}/attachments`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attachments", patientId] });
            setIsUploading(false);
        },
    });
    const deleteAttachmentMutation = useMutation({
        mutationFn: (id) => api.delete(`/clinical/attachments/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attachments", patientId] }),
    });
    // Simulated upload (in a real app, this would upload to S3/Cloudinary and get a URL)
    const handleSimulatedUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setIsUploading(true);
        // Simulate network delay
        setTimeout(() => {
            createAttachmentMutation.mutate({
                fileName: file.name,
                fileUrl: URL.createObjectURL(file), // Local blob URL for demo
                fileType: file.type,
            });
        }, 1500);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-black text-slate-800 dark:text-white tracking-tight", children: "Estudios e Im\u00E1genes" }), _jsx("p", { className: "text-[10px] items-center text-slate-400 font-bold uppercase tracking-widest mt-1", children: "Gabinete de Archivos" })] }), _jsx("label", { className: "btn-primary cursor-pointer flex items-center gap-2 group transition-all", children: isUploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Subiendo..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "w-4 h-4 group-hover:-translate-y-0.5 transition-transform" }), "Subir Archivo", _jsx("input", { type: "file", className: "hidden", onChange: handleSimulatedUpload, accept: "image/*,application/pdf" })] })) })] }), isLoading ? (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6", children: [1, 2, 3, 4].map(i => _jsx("div", { className: "h-48 bg-slate-100 dark:bg-white/5 animate-pulse rounded-[2rem]" }, i)) })) : attachments?.length === 0 ? (_jsxs("div", { className: "p-20 text-center bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]", children: [_jsx("div", { className: "w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm", children: _jsx(FileImage, { className: "w-8 h-8 text-slate-300 dark:text-slate-600" }) }), _jsx("p", { className: "text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest", children: "No hay archivos adjuntos." }), _jsx("p", { className: "text-xs text-slate-400 dark:text-slate-600 mt-2 font-medium italic", children: "Radiograf\u00EDas, estudios o fotos cl\u00EDnicas aparecer\u00E1n aqu\u00ED." })] })) : (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6", children: attachments?.map((file) => {
                    const isImage = file.fileType.startsWith('image/');
                    return (_jsxs("div", { className: "group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all flex flex-col", children: [_jsxs("div", { className: "h-40 bg-slate-50 dark:bg-black/20 flex items-center justify-center relative overflow-hidden", children: [isImage ? (_jsx("img", { src: file.fileUrl, alt: file.fileName, className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" })) : (_jsx(FileText, { className: "w-12 h-12 text-slate-300 dark:text-slate-700" })), _jsxs("div", { className: "absolute inset-0 bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4", children: [isImage && (_jsx("button", { onClick: () => setSelectedFile(file), className: "w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all active:scale-90", children: _jsx(Eye, { className: "w-5 h-5" }) })), _jsx("button", { onClick: () => { if (confirm("¿Eliminar archivo?"))
                                                    deleteAttachmentMutation.mutate(file.id); }, className: "w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-90", children: _jsx(Trash2, { className: "w-5 h-5" }) })] })] }), _jsxs("div", { className: "p-4 bg-white dark:bg-slate-900", children: [_jsx("p", { className: "text-xs font-black text-slate-800 dark:text-slate-200 truncate", title: file.fileName, children: file.fileName }), _jsx("p", { className: "text-[9px] items-center text-slate-400 dark:text-slate-500 mt-2 flex font-bold uppercase tracking-widest", children: format(parseISO(file.createdAt), "d MMM, yyyy", { locale: es }) })] })] }, file.id));
                }) })), selectedFile && (_jsxs("div", { className: "fixed inset-0 bg-slate-950/95 z-[130] flex items-center justify-center p-8 backdrop-blur-xl animate-in fade-in duration-300", children: [_jsx("button", { onClick: () => setSelectedFile(null), className: "absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all group active:scale-90", children: _jsx(X, { className: "w-6 h-6 group-hover:rotate-90 transition-transform" }) }), _jsxs("div", { className: "max-w-5xl w-full flex flex-col items-center gap-6", children: [_jsx("img", { src: selectedFile.fileUrl, alt: selectedFile.fileName, className: "max-w-full max-h-[80vh] object-contain rounded-[2rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500" }), _jsx("p", { className: "text-white font-black uppercase tracking-[0.4em] text-xs bg-white/5 px-6 py-2 rounded-full border border-white/10", children: selectedFile.fileName })] })] }))] }));
}
