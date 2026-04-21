import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Patients from './pages/Patients';
import ClinicalRecord from './pages/ClinicalRecord';
import Settings from './pages/Settings';

import { ThemeProvider } from './store/ThemeContext';
import { ToastProvider } from './store/ToastContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/agenda" element={
                  <ProtectedRoute>
                    <Agenda />
                  </ProtectedRoute>
                } />

                <Route path="/pacientes" element={
                  <ProtectedRoute>
                    <Patients />
                  </ProtectedRoute>
                } />

                <Route path="/pacientes/:id" element={
                  <ProtectedRoute>
                    <ClinicalRecord />
                  </ProtectedRoute>
                } />

                <Route path="/configuracion" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
