import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useUIStore } from "../stores/uiStore";
export default function Layout() {
    const isDarkMode = useUIStore((s) => s.isDarkMode);
    const location = useLocation();
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        }
        else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);
    return (_jsxs("div", { className: "min-h-screen flex transition-colors duration-500 relative", children: [_jsx("div", { className: "mesh-gradient" }), _jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 ml-[260px] flex flex-col min-h-screen transition-colors duration-300", children: [_jsx(Topbar, {}), _jsx("main", { className: "p-8 flex-1", children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 10, filter: 'blur(10px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, exit: { opacity: 0, y: -10, filter: 'blur(10px)' }, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, className: "h-full", children: _jsx(Outlet, {}) }, location.pathname) }) })] })] }));
}
