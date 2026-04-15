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
import Insurances from './pages/Insurances';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

const Placeholder = ({ title }: { title: string }) => (
  <div className="card p-12 flex flex-col items-center justify-center text-center space-y-4">
    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sección en Desarrollo</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pacientes" element={<Patients />} />
              <Route path="pacientes/:id" element={<PatientDetail />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="configuracion" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
