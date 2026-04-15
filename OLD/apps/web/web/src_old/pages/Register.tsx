import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Stethoscope, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { RegisterSchema, type RegisterInput } from '@dentalflow/shared';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

/* ─── Shared color tokens (must match Login) ─── */
const T = {
  brandPrimary:    '#0D9488',
  brandHover:      '#0F766E',
  bgPage:          '#F5F8FF',
  bgCard:          '#FFFFFF',
  bgInput:         '#FFFFFF',
  textHeading:     '#0B1628',
  textBody:        '#334155',
  textMuted:       '#94A3B8',
  inputBorder:     '#CBD5E1',
  inputFocus:      '#0D9488',
  errorColor:      '#E53E3E',
} as const;

/* ─── Inject CSS once ─── */
const REG_CSS = `
  @keyframes dreg-slide-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes dreg-pulse {
    0%   { box-shadow: 0 0 0 0    rgba(13,148,136,0.55); }
    70%  { box-shadow: 0 0 0 14px rgba(13,148,136,0);    }
    100% { box-shadow: 0 0 0 0    rgba(13,148,136,0);    }
  }
  @keyframes dreg-spin {
    from { transform: rotate(0deg); } to { transform: rotate(360deg); }
  }
  @keyframes dreg-fade-in {
    from { opacity:0; } to { opacity:1; }
  }

  .dreg-spinning { animation: dreg-spin 0.9s linear infinite; }

  .dreg-input {
    width: 100%; padding: 12px 14px;
    background: ${T.bgInput};
    border: 1.5px solid ${T.inputBorder};
    border-radius: 11px;
    font-size: 0.875rem; color: ${T.textHeading};
    font-family: 'Inter', sans-serif;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    outline: none; box-sizing: border-box;
  }
  .dreg-input::placeholder { color: ${T.textMuted}; }
  .dreg-input:focus {
    border-color: ${T.inputFocus};
    box-shadow: 0 0 0 4px rgba(13,148,136,0.11);
  }
  .dreg-input.dreg-err             { border-color: ${T.errorColor}; background: #FFF5F5; }
  .dreg-input.dreg-err:focus       { border-color: ${T.errorColor}; box-shadow: 0 0 0 4px rgba(229,62,62,0.09); }

  .dreg-submit {
    width: 100%; padding: 13px;
    background: ${T.brandPrimary};
    color: #fff; font-weight: 700; font-size: 0.9rem; letter-spacing: 0.015em;
    border: none; border-radius: 11px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 18px rgba(13,148,136,0.28);
    transition: background 0.2s ease, transform 0.18s ease, box-shadow 0.18s ease;
    font-family: 'Inter', sans-serif; margin-top: 6px;
  }
  .dreg-submit:not(:disabled):hover {
    background: ${T.brandHover};
    transform: translateY(-2px);
    box-shadow: 0 8px 26px rgba(13,148,136,0.36);
  }
  .dreg-submit:not(:disabled):active { transform: translateY(0); }
  .dreg-submit:disabled { background: #5eead4; cursor: not-allowed; box-shadow: none; }

  .dreg-eye:hover    { color: ${T.brandPrimary} !important; }
  .dreg-login:hover  { color: ${T.brandHover}   !important; }
`;

function useInjectRegCSS() {
  useEffect(() => {
    const id = 'df-register-css';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = REG_CSS;
      document.head.appendChild(el);
    }
  }, []);
}

/* ─── Component ─── */
export default function Register() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass]       = useState(false);
  const [serverError, setServerError] = useState('');
  const [mounted, setMounted]         = useState(false);

  useInjectRegCSS();
  useEffect(() => { const t = setTimeout(() => setMounted(true), 20); return () => clearTimeout(t); }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) });

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

  const anim = (delay = 0): React.CSSProperties =>
    mounted ? { animation: `dreg-slide-up 0.55s ${delay}s ease both` } : { opacity: 0 };

  /* Generic field renderer */
  const Field = ({
    id, label, name, type = 'text', placeholder = '',
  }: { id: string; label: string; name: keyof RegisterInput; type?: string; placeholder?: string }) => (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: T.textBody, marginBottom: 7 }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`dreg-input${errors[name] ? ' dreg-err' : ''}`}
        {...register(name)}
      />
      {errors[name] && (
        <p style={{ marginTop: 5, fontSize: '0.72rem', color: T.errorColor, fontWeight: 500 }}>
          ⚠ {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: T.bgPage, fontFamily: "'Inter', sans-serif",
      padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 480, ...anim(0) }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, justifyContent: 'center', ...anim(0) }}>
          <div style={{
            width: 46, height: 46,
            background: `linear-gradient(135deg, ${T.brandPrimary}, ${T.brandHover})`,
            borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(13,148,136,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
            animation: 'dreg-pulse 2.6s cubic-bezier(0.66,0,0,1) infinite',
          }}>
            <Stethoscope size={22} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: T.textHeading, letterSpacing: '-0.03em' }}>
              OdontoMax OS
            </div>
            <div style={{ fontSize: '0.6rem', color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 1 }}>
              Professional OS
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: T.bgCard, borderRadius: 20,
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 4px 32px rgba(11,22,40,0.08), 0 1px 4px rgba(11,22,40,0.04)',
          padding: '40px 40px 36px',
          ...anim(0.05),
        }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.16)',
              borderRadius: 100, padding: '4px 12px',
              fontSize: '0.7rem', fontWeight: 600, color: T.brandPrimary,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
            }}>
              <CheckCircle2 size={12} />
              Registro gratuito
            </div>

            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.65rem', fontWeight: 800,
              color: T.textHeading, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6,
            }}>
              Crea tu cuenta
            </h2>
            <p style={{ fontSize: '0.875rem', color: T.textBody, lineHeight: 1.55 }}>
              Registrate para acceder a tu plataforma médica profesional.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field id="reg-name"     label="Nombre"   name="name"     placeholder="Juan" />
              <Field id="reg-lastname" label="Apellido" name="lastName" placeholder="Pérez" />
            </div>

            <Field id="reg-email" label="Email profesional" name="email" type="email" placeholder="doctor@clinica.com" />

            {/* Password with toggle */}
            <div>
              <label htmlFor="reg-password" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: T.textBody, marginBottom: 7 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  className={`dreg-input${errors.password ? ' dreg-err' : ''}`}
                  style={{ paddingRight: 46 }}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="dreg-eye"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Mostrar contraseña"
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', padding: 0, transition: 'color 0.15s' }}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ marginTop: 5, fontSize: '0.72rem', color: T.errorColor, fontWeight: 500 }}>
                  ⚠ {errors.password.message}
                </p>
              )}
            </div>

            <Field id="reg-confirm" label="Confirmar contraseña" name="confirmPassword" type="password" placeholder="••••••••" />

            {/* Password strength hint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 13px', background: 'rgba(13,148,136,0.05)', borderRadius: 9, border: '1px solid rgba(13,148,136,0.12)' }}>
              <Shield size={13} color={T.brandPrimary} />
              <span style={{ fontSize: '0.72rem', color: T.textBody }}>Tu contraseña debe tener al menos 8 caracteres.</span>
            </div>

            {/* Server error */}
            {serverError && (
              <div style={{
                padding: '12px 14px', borderRadius: 10,
                background: '#FFF5F5', border: '1.5px solid rgba(229,62,62,0.2)',
                fontSize: '0.82rem', color: '#C53030', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
                animation: 'dreg-fade-in 0.2s ease',
              }}>
                ⚠ {serverError}
              </div>
            )}

            {/* CTA */}
            <button type="submit" disabled={isSubmitting} className="dreg-submit">
              {isSubmitting
                ? <Loader2 size={18} className="dreg-spinning" />
                : <><span>Crear cuenta</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: '0.86rem', color: T.textBody, marginTop: 24, paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="dreg-login" style={{ color: T.brandPrimary, fontWeight: 700, textDecoration: 'none', transition: 'color 0.15s' }}>
              Iniciar sesión
            </Link>
          </p>
        </div>

        {/* Trust row below card */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 22 }}>
          {[
            { label: 'Sin tarjeta de crédito' },
            { label: 'Configura en 5 minutos' },
            { label: 'Cancela cuando quieras' },
          ].map(({ label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: T.textMuted, fontWeight: 500 }}>
              <CheckCircle2 size={12} color={T.brandPrimary} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
