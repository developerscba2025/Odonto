import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Stethoscope, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { LoginSchema, type LoginInput } from '@dentalflow/shared';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err: any) {
      setServerError(err.response?.data?.error ?? 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0a0a0f',
      fontFamily: '"Inter", sans-serif',
    }}>
      {/* Left Panel */}
      <div style={{
        flex: '1 1 55%',
        background: 'linear-gradient(135deg, #0f172a 0%, #0a0a0f 60%, #0d1a12 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow effects */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-60px',
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          }}>
            <Stethoscope size={22} color="white" />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>
              OdontoMax
            </span>
            <p style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '1px' }}>
              Professional OS
            </p>
          </div>
        </div>

        {/* Hero Text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            marginBottom: '28px',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Sistema Operativo Odontológico
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 700,
            color: '#fff',
            fontFamily: '"Space Grotesk", sans-serif',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '20px',
          }}>
            Tu consultorio,<br/>
            <span style={{ color: '#10b981' }}>digitalizado.</span>
          </h1>

          <p style={{ fontSize: '1rem', color: 'rgba(148,163,184,0.7)', lineHeight: 1.7, maxWidth: '400px', marginBottom: '40px' }}>
            Gestiona pacientes, agenda y facturación desde un solo lugar. Diseñado para profesionales de la salud.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: Shield, text: 'Historias clínicas digitales seguras' },
              { icon: Zap, text: 'Recordatorios automáticos por WhatsApp' },
              { icon: Users, text: 'Gestión multi-profesional en tiempo real' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <f.icon size={16} color="#10b981" />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'rgba(203,213,225,0.8)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: '0.72rem', color: 'rgba(100,116,139,0.5)', position: 'relative', zIndex: 1 }}>
          © 2024 OdontoMax OS · Todos los derechos reservados
        </p>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: '1 1 45%',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '1.75rem', fontWeight: 700,
              fontFamily: '"Space Grotesk", sans-serif',
              color: '#0f172a', letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              Bienvenido de vuelta
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="doctor@clinica.com"
                {...register('email')}
                style={{
                  width: '100%', padding: '11px 14px',
                  border: `1.5px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '10px', fontSize: '0.9rem',
                  outline: 'none', fontFamily: '"Inter", sans-serif',
                  color: '#0f172a', background: '#f9fafb',
                  transition: 'all 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; e.currentTarget.style.background = '#fff'; }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f9fafb'; }}
              />
              {errors.email && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '6px', fontWeight: 500 }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Contraseña</label>
                <a href="#" style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••"
                  {...register('password')}
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px',
                    border: `1.5px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px', fontSize: '0.9rem',
                    outline: 'none', fontFamily: '"Inter", sans-serif',
                    color: '#0f172a', background: '#f9fafb',
                    transition: 'all 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f9fafb'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9ca3af' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '6px', fontWeight: 500 }}>{errors.password.message}</p>}
            </div>

            {serverError && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '0.85rem', color: '#dc2626', fontWeight: 500,
              }}>
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '13px',
                background: isSubmitting ? '#6ee7b7' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                border: 'none', borderRadius: '10px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                transition: 'all 0.2s', fontFamily: '"Inter", sans-serif',
              }}
            >
              {isSubmitting ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  Ingresar al panel
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
