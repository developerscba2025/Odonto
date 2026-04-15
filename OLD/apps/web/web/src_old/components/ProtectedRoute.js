import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
export default function ProtectedRoute() {
    const token = useAuthStore((s) => s.token);
    if (!token)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(Outlet, {});
}
