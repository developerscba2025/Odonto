import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Stethoscope, ArrowRight } from 'lucide-react';
import { RegisterSchema, type RegisterInput } from '@dentalflow/shared';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setServerError('');
    try {
      const res = await api.post('/auth/register', data);
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err: any) {
      setServerError(err.response?.data?.error ?? 'Error al registrarse');
    }
  };

  const field = (label: string, name: keyof RegisterInput, type = 'text', placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        style={{
          width: '100%', padding: '10px 14px',
          border: `1.5px solid ${errors[name] ? '#ef4444' : '#e5e7eb'}`,
          borderRadius: '10px', fontSize: '0.875rem',
          outline: 'none', fontFamily: '"Inter", sans-serif',
          color: '#0f172a', background: '#f9fafb',
          transition: 'all 0.15s', boxSizing: 'border-box',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; e.currentTarget.style.background = '#fff'; }}
        onBlur={e => { e.currentTarget.style.borderColor = errors[name] ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f9fafb'; }}
      />
      {errors[name] && (
        <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px', fontWeight: 500 }}>
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc', fontFamily: '"Inter", sans-serif', padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(16,185,129,0.3)',
          }}>
            <Stethoscope size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>
            OdontoMax OS
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          padding: '36px',
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Crear cuenta
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '28px' }}>
            Registrate para acceder a tu plataforma médica
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {field('Nombre', 'name', 'text', 'Juan')}
              {field('Apellido', 'lastName', 'text', 'Pérez')}
            </div>
            {field('Email profesional', 'email', 'email', 'doctor@clinica.com')}

            {/* Password with toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  {...register('password')}
                  style={{
                    width: '100%', padding: '10px 44px 10px 14px',
                    border: `1.5px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px', fontSize: '0.875rem',
                    outline: 'none', fontFamily: '"Inter", sans-serif',
                    color: '#0f172a', background: '#f9fafb',
                    transition: 'all 0.15s', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f9fafb'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px', fontWeight: 500 }}>{errors.password.message}</p>}
            </div>

            {field('Confirmar contraseña', 'confirmPassword', 'password', '••••••••')}

            {serverError && (
              <div style={{
                padding: '11px 14px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '0.82rem', color: '#dc2626', fontWeight: 500,
              }}>
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                border: 'none', borderRadius: '10px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                fontFamily: '"Inter", sans-serif',
                marginTop: '4px',
              }}
            >
              {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><ArrowRight size={16} />Crear cuenta</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
