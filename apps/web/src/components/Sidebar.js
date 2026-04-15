import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings, Moon, Sun, Sparkles, } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Pacientes', path: '/pacientes' },
    { icon: Calendar, label: 'Agenda', path: '/agenda' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
];
const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};
const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};
export default function Sidebar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const { isDarkMode, toggleDarkMode } = useUIStore();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const initials = user
        ? `${user.name[0]}${user.lastName[0]}`.toUpperCase()
        : '??';
    return (_jsxs(motion.aside, { initial: "hidden", animate: "visible", variants: containerVariants, className: "w-[260px] sidebar-floating flex flex-col h-[calc(100vh-2rem)] fixed left-4 top-4 z-[70] hidden md:flex", children: [_jsxs("div", { className: "p-8 flex flex-col items-start gap-6", children: [_jsx(motion.div, { whileHover: { rotate: 180, scale: 1.1 }, transition: { type: "spring", stiffness: 200, damping: 10 }, className: "w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40", children: _jsx(Sparkles, { className: "w-8 h-8 text-white" }) }), _jsxs("div", { children: [_jsxs("span", { className: "text-2xl font-display font-extrabold text-slate-950 dark:text-white tracking-tighter", children: ["Odonto", _jsx("span", { className: "text-primary italic", children: "Max" })] }), _jsx("p", { className: "text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-1 italic", children: "Professional OS" })] })] }), _jsxs("nav", { className: "flex-1 px-4 mt-4 space-y-2 overflow-y-auto", children: [_jsx("p", { className: "text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] px-4 mb-4", children: "Principal" }), navItems.map((item) => (_jsx(motion.div, { variants: itemVariants, children: _jsxs(NavLink, { to: item.path, end: item.path === '/', className: ({ isActive }) => cn('flex items-center gap-3 px-5 py-4 rounded-[1.8rem] transition-all duration-500 text-[13px] font-extrabold group relative overflow-hidden', isActive
                                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-2xl scale-[1.02]'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white'), children: [_jsx(item.icon, { className: "w-5 h-5 shrink-0", strokeWidth: 2.5 }), item.label] }) }, item.path)))] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsx("div", { className: "p-4 bg-white/40 dark:bg-white/5 rounded-3xl border border-white/20 dark:border-white/5 group hover:shadow-xl transition-all", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xl", style: { backgroundColor: user?.professionalProfile?.color ?? '#10b981' }, children: initials }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs font-black text-slate-900 dark:text-white truncate", children: user ? user.lastName : 'Doctor' }), _jsx("button", { onClick: handleLogout, className: "text-[9px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest mt-0.5", children: "Cerrar Sesi\u00F3n" })] })] }) }), _jsxs("button", { onClick: toggleDarkMode, className: "w-full flex items-center justify-between p-4 rounded-3xl bg-slate-950 dark:bg-white transition-all group", children: [_jsx("span", { className: "text-[10px] font-black text-white dark:text-slate-950 uppercase tracking-widest", children: isDarkMode ? 'Light' : 'Dark' }), isDarkMode ? (_jsx(Sun, { className: "w-4 h-4 text-amber-400 animate-spin-slow" })) : (_jsx(Moon, { className: "w-4 h-4 text-white" }))] })] })] }));
}
