import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, ChevronRight, Sparkles, Zap, Activity } from 'lucide-react';
import { LoginSchema } from '@dentalflow/shared';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [showPass, setShowPass] = useState(false);
    const [serverError, setServerError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({ resolver: zodResolver(LoginSchema) });
    const onSubmit = async (data) => {
        setServerError('');
        try {
            const res = await api.post('/auth/login', data);
            setAuth(res.data.user, res.data.token);
            navigate('/');
        }
        catch (err) {
            setServerError(err.response?.data?.error ?? 'Error al iniciar sesión');
        }
    };
    const benefits = [
        {
            icon: Activity,
            title: "Historias Clínicas Digitales",
            desc: "Centraliza diagnósticos y evoluciones en segundos."
        },
        {
            icon: Sparkles,
            title: "Odontograma Inteligente",
            desc: "Visualización técnica precisa y fácil de actualizar."
        },
        {
            icon: Zap,
            title: "Automatización WhatsApp",
            desc: "Reduce el ausentismo con recordatorios inteligentes."
        },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-brand-background text-text-main flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-500", children: [_jsx("div", { className: "mesh-gradient" }), _jsxs("div", { className: "hidden md:flex flex-1 flex-col justify-between p-12 lg:p-20 relative overflow-hidden bg-slate-950 dark:bg-zinc-950", children: [_jsx("div", { className: "absolute inset-0 z-0 opacity-40", children: _jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" }) }), _jsx("div", { className: "absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" }), _jsxs("div", { className: "flex items-center gap-3 relative z-10", children: [_jsx("div", { className: "w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl", children: _jsx(Sparkles, { className: "w-7 h-7 text-primary" }) }), _jsxs("span", { className: "text-3xl font-bold tracking-tighter text-white drop-shadow-sm", children: ["Odonto", _jsx("span", { className: "text-primary", children: "Max" })] })] }), _jsxs("div", { className: "max-w-xl relative z-10", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[12px] font-bold uppercase tracking-widest mb-10 backdrop-blur-xl shadow-xl", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#10b981]" }), "Sistema Operativo Odontol\u00F3gico"] }), _jsxs("h1", { className: "text-5xl lg:text-7xl font-bold text-white leading-[1.05] mb-12 tracking-tighter", children: ["Tu consultorio, ", _jsx("br", {}), _jsx("span", { className: "text-secondary", children: "elevado." })] }), _jsx("div", { className: "space-y-8", children: benefits.map((b, i) => (_jsxs("div", { className: "flex items-start gap-5 group", children: [_jsx("div", { className: "mt-1 bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 group-hover:bg-accent group-hover:scale-110 transition-all duration-300", children: _jsx(b.icon, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-lg leading-tight", children: b.title }), _jsx("p", { className: "text-white/70 text-sm mt-1 leading-relaxed", children: b.desc })] })] }, i))) })] }), _jsxs("div", { className: "text-white/40 text-xs flex items-center justify-between relative z-10", children: [_jsx("p", { children: "\u00A9 2024 OdontoMax OS" }), _jsxs("div", { className: "flex gap-6", children: [_jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Seguridad" }), _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "GDPR" })] })] })] }), _jsx("div", { className: "flex-1 flex items-center justify-center p-6 sm:p-12 relative", children: _jsxs("div", { className: "w-full max-w-[420px] relative", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("div", { className: "md:hidden inline-flex mb-6 w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center", children: _jsx(Sparkles, { className: "w-6 h-6 text-primary" }) }), _jsx("h2", { className: "text-4xl font-extrabold text-text-primary tracking-tight mb-3", children: "Ingresar" }), _jsx("p", { className: "text-text-secondary font-medium", children: "Accede a tu plataforma profesional" })] }), _jsxs("div", { className: "space-y-8", children: [_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1", children: "Correo Electr\u00F3nico" }), _jsx("input", { type: "email", placeholder: "doctor@odontomax.com", ...register('email'), className: "w-full bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-[20px] px-6 py-4.5 text-base outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600" }), errors.email && (_jsx("p", { className: "text-xs text-status-error mt-2 font-semibold ml-2", children: errors.email.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center ml-1", children: [_jsx("label", { className: "text-[12px] font-bold text-gray-400 uppercase tracking-[0.1em]", children: "Contrase\u00F1a" }), _jsx("a", { href: "#", className: "text-xs text-primary font-bold hover:underline", children: "Recuperar" })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPass ? 'text' : 'password', placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", ...register('password'), className: "w-full bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 rounded-[20px] px-6 py-4.5 text-base outline-none focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600" }), _jsx("button", { type: "button", onClick: () => setShowPass(!showPass), className: "absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-primary transition-colors", children: showPass ? _jsx(EyeOff, { className: "w-5 h-5" }) : _jsx(Eye, { className: "w-5 h-5" }) }), errors.password && (_jsx("p", { className: "text-xs text-status-error mt-2 font-semibold ml-2", children: errors.password.message }))] })] }), serverError && (_jsx("div", { className: "bg-status-error/5 border-2 border-status-error/10 rounded-2xl p-4 text-sm text-status-error font-bold text-center animate-shake", children: serverError })), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full bg-primary hover:bg-[#1A253A] text-white font-bold py-5 rounded-[22px] transition-all shadow-xl shadow-primary/5 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 text-lg group", children: isSubmitting ? (_jsx(Loader2, { className: "w-6 h-6 animate-spin" })) : (_jsxs(_Fragment, { children: ["ENTRAR AL PANEL", _jsx(ChevronRight, { className: "w-5 h-5 group-hover:translate-x-1 transition-transform" })] })) })] }), _jsx("div", { className: "text-center pt-8 border-t border-gray-100", children: _jsxs("p", { className: "text-gray-500 font-medium", children: ["\u00BFTodav\u00EDa no tienes acceso? ", _jsx("br", {}), _jsx(Link, { to: "/register", className: "text-primary font-extrabold hover:text-primary/80 transition-colors inline-block mt-2", children: "Reg\u00EDstrate ahora mismo" })] }) })] })] }) })] }));
}
