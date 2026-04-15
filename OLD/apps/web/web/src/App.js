import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Agenda from './pages/Agenda';
import PatientDetail from './pages/PatientDetail';
import Register from './pages/Register';
import Settings from './pages/Settings';
const queryClient = new QueryClient();
const Placeholder = ({ title }) => (_jsxs("div", { className: "card-premium p-12 flex flex-col items-center justify-center text-center space-y-4", children: [_jsx("h2", { className: "text-2xl font-black text-slate-900 dark:text-white", children: title }), _jsx("p", { className: "text-sm font-bold text-slate-500 uppercase tracking-widest", children: "Secci\u00F3n en Desarrollo" })] }));
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { future: { v7_startTransition: true, v7_relativeSplatPath: true }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { element: _jsx(ProtectedRoute, {}), children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "pacientes", element: _jsx(Patients, {}) }), _jsx(Route, { path: "pacientes/:id", element: _jsx(PatientDetail, {}) }), _jsx(Route, { path: "agenda", element: _jsx(Agenda, {}) }), _jsx(Route, { path: "configuracion", element: _jsx(Settings, {}) })] }) })] }) }) }));
}
export default App;
