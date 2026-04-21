import React, { useState, useEffect } from 'react';
import { Smile, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative transition-colors duration-700">
      {/* Background Deep Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-black pointer-events-none" />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px] animate-pulse pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse pointer-events-none opacity-60 flex items-center justify-center" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] left-[30%] w-[20%] h-[30%] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse pointer-events-none opacity-40" style={{ animationDelay: '4s' }}></div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white p-4 rounded-[1.2rem] shadow-2xl shadow-blue-500/40 ring-1 ring-white/30 backdrop-blur-sm">
            <Smile className="w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-black text-white tracking-tighter">
          DentalFlow<span className="text-cyan-400">.</span>
        </h2>
        <p className="mt-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Gestor Clínico Inteligente
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl py-10 px-6 sm:px-10 shadow-2xl sm:rounded-[2rem] border border-white/10 relative overflow-hidden group">
          {/* subtle interior shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
          
          <form className="space-y-7 relative" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium backdrop-blur-md animate-in fade-in zoom-in-95">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 text-sm font-medium text-white bg-slate-900/50 border border-white/10 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:bg-slate-900 transition-all placeholder:text-slate-600 outline-none shadow-inner"
                  placeholder="doctor@dentalflow.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 text-sm font-medium text-white bg-slate-900/50 border border-white/10 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:bg-slate-900 transition-all placeholder:text-slate-600 outline-none shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)] text-[11px] font-black uppercase tracking-widest text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 focus:outline-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
