import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, Loader2, Stethoscope, ArrowRight,
  Shield, Zap, Users, CheckCircle2, Activity,
} from 'lucide-react';
import { LoginSchema, type LoginInput } from '@dentalflow/shared';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

/* ─── Color System Tokens ───────────────────────────────
   Panel izquierdo  → navy profundo + gradiente slate-teal
   Panel derecho    → off-white frío #F5F8FF
   Brand accent     → Teal profesional #0D9488 (healthcare SaaS)
   CTA              → Teal oscuro #0F766E (más autoridad que verde)
──────────────────────────────────────────────────────── */
const TOKENS = {
  bgLeft:             'linear-gradient(150deg, #0B1628 0%, #0D2137 45%, #081C1A 100%)',
  bgRight:            '#F5F8FF',
  brandPrimary:       '#0D9488',
  brandSecondary:     '#3B82F6',
  ctaBg:              '#0D9488',
  ctaHover:           '#0F766E',
  ctaText:            '#FFFFFF',
  inputBorder:        '#CBD5E1',
  inputBorderFocus:   '#0D9488',
  textHeading:        '#0B1628',
  textBody:           '#334155',
  textMuted:          '#94A3B8',
  leftHeading:        '#E8F0FE',
  leftBody:           '#7A9BB5',
  iconBg:             'rgba(13,148,136,0.14)',
  iconBorder:         'rgba(13,148,136,0.22)',
} as const;

/* ─── Inject global CSS once ───────────────────────────── */
const GLOBAL_CSS = `
  :root {
    --color-bg-left:            linear-gradient(150deg, #0B1628 0%, #0D2137 45%, #081C1A 100%);
    --color-bg-right:           #F5F8FF;
    --color-brand-primary:      #0D9488;
    --color-brand-secondary:    #3B82F6;
    --color-cta-bg:             #0D9488;
    --color-cta-text:           #FFFFFF;
    --color-cta-hover:          #0F766E;
    --color-input-border:       #CBD5E1;
    --color-input-border-focus: #0D9488;
    --color-text-heading:       #0B1628;
    --color-text-body:          #334155;
    --color-text-muted:         #94A3B8;
    --color-text-left-heading:  #E8F0FE;
    --color-text-left-body:     #7A9BB5;
    --color-icon-bg:            rgba(13,148,136,0.14);
  }

  /* ── Keyframes ── */
  @keyframes df-float {
    0%,100% { transform: translateY(0px) scale(1); }
    50%      { transform: translateY(-24px) scale(1.04); }
  }
  @keyframes df-spin-ring {
    from { transform: translateY(-50%) rotate(0deg); }
    to   { transform: translateY(-50%) rotate(360deg); }
  }
  @keyframes df-pulse-logo {
    0%   { box-shadow: 0 0 0 0   rgba(13,148,136,0.55); }
    70%  { box-shadow: 0 0 0 14px rgba(13,148,136,0.0);  }
    100% { box-shadow: 0 0 0 0   rgba(13,148,136,0.0);  }
  }
  @keyframes df-blink {
    0%,100% { opacity:1; } 50% { opacity:0.25; }
  }
  @keyframes df-slide-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes df-fade-in {
    from { opacity:0; } to { opacity:1; }
  }
  @keyframes df-spin {
    from { transform:rotate(0deg); } to { transform:rotate(360deg); }
  }
  @keyframes df-shimmer {
    0%   { left:-100%; }
    100% { left:220%;  }
  }

  /* ── Reusable utility classes ── */
  .df-spinning { animation: df-spin 0.9s linear infinite; }

  /* Inputs */
  .df-input {
    width: 100%; padding: 13px 16px;
    background: #ffffff;
    border: 1.5px solid #CBD5E1;
    border-radius: 11px;
    font-size: 0.9rem; color: #0B1628;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    outline: none; box-sizing: border-box;
  }
  .df-input::placeholder { color: #94A3B8; }
  .df-input:focus {
    border-color: #0D9488;
    box-shadow: 0 0 0 4px rgba(13,148,136,0.11);
    background: #ffffff;
  }
  .df-input.df-err             { border-color: #E53E3E; background: #FFF5F5; }
  .df-input.df-err:focus       { border-color: #E53E3E; box-shadow: 0 0 0 4px rgba(229,62,62,0.09); }

  /* CTA Button */
  .df-submit {
    width: 100%; padding: 14px;
    background: #0D9488;
    color: #ffffff;
    font-weight: 700; font-size: 0.9rem; letter-spacing: 0.015em;
    border: none; border-radius: 11px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 18px rgba(13,148,136,0.28), 0 1px 3px rgba(0,0,0,0.08);
    transition: background 0.2s ease, transform 0.18s ease, box-shadow 0.18s ease;
    font-family: 'Inter', sans-serif;
    margin-top: 6px; position: relative; overflow: hidden;
  }
  .df-submit:not(:disabled):hover {
    background: #0F766E;
    transform: translateY(-2px);
    box-shadow: 0 8px 26px rgba(13,148,136,0.36), 0 2px 6px rgba(0,0,0,0.1);
  }
  .df-submit:not(:disabled):active  { transform: translateY(0); }
  .df-submit:disabled { background: #5eead4; cursor: not-allowed; box-shadow: none; }
  .df-submit-shimmer {
    position: absolute; top: 0; width: 55%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
    animation: df-shimmer 2.4s ease infinite;
    pointer-events: none;
  }

  /* Feature cards */
  .df-feat {
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }
  .df-feat:hover {
    background: rgba(13,148,136,0.09) !important;
    border-color: rgba(13,148,136,0.22) !important;
    transform: translateY(-2px);
  }

  /* Hover micro-interactions */
  .df-eye:hover    { color: #0D9488 !important; }
  .df-forgot:hover { color: #0F766E !important; }
  .df-reg:hover    { color: #0F766E !important; }

  /* Rotating decorative ring */
  .df-ring {
    position: absolute; right: -140px; top: 50%;
    transform: translateY(-50%);
    width: 500px; height: 500px;
    border-radius: 50%;
    border: 1px solid rgba(13,148,136,0.09);
    pointer-events: none; z-index: 1;
    animation: df-spin-ring 30s linear infinite;
  }
  .df-ring::before {
    content: ''; position: absolute; inset: 40px; border-radius: 50%;
    border: 1px solid rgba(59,130,246,0.06);
  }
  .df-ring::after {
    content: ''; position: absolute; inset: 90px; border-radius: 50%;
    border: 1px solid rgba(13,148,136,0.05);
  }

  /* Responsive */
  @media (max-width: 820px) {
    .df-left  { display: none !important; }
    .df-right { flex: 1 !important; padding: 36px 24px !important; }
  }
`;

function useInjectCSS() {
  useEffect(() => {
    const id = 'df-login-css';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
  }, []);
}

/* ─── Component ─────────────────────────────────────────── */
export default function Login() {
  const navigate  = useNavigate();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const [showPass, setShowPass]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [mounted, setMounted]       = useState(false);

  useInjectCSS();
  useEffect(() => { const t = setTimeout(() => setMounted(true), 20); return () => clearTimeout(t); }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

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

  /* animation helper */
  const anim = (delay = 0): React.CSSProperties =>
    mounted ? { animation: `df-slide-up 0.55s ${delay}s ease both` } : { opacity: 0 };

  const features = [
    { icon: Shield,   title: 'Historias clínicas cifradas', sub: 'Datos seguros y respaldados' },
    { icon: Zap,      title: 'Agenda inteligente',          sub: 'Recordatorios automáticos' },
    { icon: Users,    title: 'Multi-profesional',           sub: 'Gestión en tiempo real' },
    { icon: Activity, title: 'Dashboard en vivo',           sub: 'Métricas al instante'  },
  ];

  /* Orbs seeded so they're stable between renders */
  const orbs = [
    { x: 12, y: 18, s: 220, d: 8.5, dl: 0    },
    { x: 72, y: 8,  s: 150, d: 10,  dl: 1.4  },
    { x: 48, y: 62, s: 190, d: 9,   dl: 0.7  },
    { x: 84, y: 54, s: 130, d: 11,  dl: 2.1  },
    { x: 28, y: 82, s: 110, d: 7.5, dl: 1.1  },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div
        className="df-left"
        style={{
          flex: '1 1 56%',
          background: TOKENS.bgLeft,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '52px 56px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Subtle noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 15% 15%, rgba(13,148,136,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 85% 85%, rgba(59,130,246,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 60% 5%,  rgba(13,148,136,0.04) 0%, transparent 55%)
          `,
        }} />

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(13,148,136,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,148,136,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }} />

        {/* Rotating ring */}
        <div className="df-ring" />

        {/* Floating orbs */}
        {orbs.map((o, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            left: `${o.x}%`, top: `${o.y}%`,
            width: o.s, height: o.s,
            background: 'radial-gradient(circle, rgba(13,148,136,0.09), transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
            animation: `df-float ${o.d}s ${o.dl}s ease-in-out infinite`,
          }} />
        ))}

        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2, ...anim(0) }}>
          <div style={{
            width: 50, height: 50, flexShrink: 0,
            background: `linear-gradient(135deg, ${TOKENS.brandPrimary}, #0F766E)`,
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(13,148,136,0.32), inset 0 1px 0 rgba(255,255,255,0.12)',
            animation: 'df-pulse-logo 2.6s cubic-bezier(0.66,0,0,1) infinite',
          }}>
            <Stethoscope size={24} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.25rem', fontWeight: 800,
              color: TOKENS.leftHeading, letterSpacing: '-0.03em',
            }}>
              OdontoMax
            </div>
            <div style={{
              fontSize: '0.6rem', color: 'rgba(122,155,181,0.55)',
              textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2,
            }}>
              Professional OS
            </div>
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 15px', borderRadius: 100,
            background: 'rgba(13,148,136,0.1)',
            border: '1px solid rgba(13,148,136,0.2)',
            marginBottom: 30, width: 'fit-content',
            ...anim(0.06),
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: TOKENS.brandPrimary,
              animation: 'df-blink 2.2s infinite', flexShrink: 0,
            }} />
            <span style={{
              fontSize: '0.69rem', fontWeight: 600,
              color: '#2DD4BF',
              textTransform: 'uppercase', letterSpacing: '0.09em',
            }}>
              Sistema Operativo Odontológico
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.1rem, 3.6vw, 3.6rem)',
            fontWeight: 800, lineHeight: 1.06,
            letterSpacing: '-0.04em',
            color: TOKENS.leftHeading,
            marginBottom: 20,
            ...anim(0.1),
          }}>
            Tu consultorio,<br />
            <span style={{
              background: `linear-gradient(95deg, ${TOKENS.brandPrimary} 0%, #2DD4BF 50%, #38BDF8 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              elevado.
            </span>
          </h1>

          <p style={{
            fontSize: '0.97rem', lineHeight: 1.75,
            color: TOKENS.leftBody,
            maxWidth: 420, marginBottom: 48,
            ...anim(0.14),
          }}>
            Gestiona pacientes, agenda y facturación desde un solo lugar.
            Diseñado para profesionales que exigen precisión y confianza.
          </p>

          {/* Feature cards 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, maxWidth: 490 }}>
            {features.map((f, i) => (
              <div key={i} className="df-feat" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 15px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 13,
                ...anim(0.18 + i * 0.07),
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: TOKENS.iconBg,
                  border: `1px solid ${TOKENS.iconBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={16} color={TOKENS.brandPrimary} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.79rem', fontWeight: 600,
                    color: 'rgba(232,240,254,0.88)', lineHeight: 1.25,
                  }}>{f.title}</div>
                  <div style={{
                    fontSize: '0.7rem', marginTop: 2,
                    color: TOKENS.leftBody,
                  }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '0.68rem', color: 'rgba(122,155,181,0.35)',
          position: 'relative', zIndex: 2,
        }}>
          © 2025 OdontoMax OS · Todos los derechos reservados
        </p>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div
        className="df-right"
        style={{
          flex: '1 1 44%',
          background: TOKENS.bgRight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 44px', minHeight: '100vh',
          /* Subtle inner shadow on left edge for depth */
          boxShadow: 'inset 4px 0 24px rgba(11,22,40,0.06)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400, ...anim(0.1) }}>

          {/* ── Form Header ── */}
          <div style={{ marginBottom: 36 }}>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(13,148,136,0.07)',
              border: '1px solid rgba(13,148,136,0.16)',
              borderRadius: 100, padding: '4px 13px',
              fontSize: '0.7rem', fontWeight: 600,
              color: TOKENS.brandPrimary,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 18,
            }}>
              <CheckCircle2 size={12} />
              Acceso seguro
            </div>

            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.85rem', fontWeight: 800,
              color: TOKENS.textHeading,
              letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 8,
            }}>
              Bienvenido<br />de vuelta 👋
            </h2>
            <p style={{ fontSize: '0.87rem', color: TOKENS.textBody, lineHeight: 1.55 }}>
              Ingresa tus credenciales para acceder al panel profesional.
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: TOKENS.textBody, marginBottom: 7 }}
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="doctor@clinica.com"
                className={`df-input${errors.email ? ' df-err' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p style={{ marginTop: 5, fontSize: '0.73rem', color: '#E53E3E', fontWeight: 500 }}>
                  ⚠ {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label
                  htmlFor="login-password"
                  style={{ fontSize: '0.78rem', fontWeight: 600, color: TOKENS.textBody }}
                >
                  Contraseña
                </label>
                <a
                  href="#"
                  className="df-forgot"
                  style={{ fontSize: '0.75rem', fontWeight: 600, color: TOKENS.brandPrimary, textDecoration: 'none', transition: 'color 0.15s' }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••"
                  className={`df-input${errors.password ? ' df-err' : ''}`}
                  style={{ paddingRight: 48 }}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="df-eye"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Mostrar contraseña"
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: TOKENS.textMuted, display: 'flex', padding: 0, transition: 'color 0.15s',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ marginTop: 5, fontSize: '0.73rem', color: '#E53E3E', fontWeight: 500 }}>
                  ⚠ {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div style={{
                padding: '12px 15px', borderRadius: 10,
                background: '#FFF5F5', border: '1.5px solid rgba(229,62,62,0.2)',
                fontSize: '0.82rem', color: '#C53030', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8,
                animation: 'df-fade-in 0.2s ease',
              }}>
                ⚠ {serverError}
              </div>
            )}

            {/* CTA */}
            <button type="submit" disabled={isSubmitting} className="df-submit">
              <span className="df-submit-shimmer" />
              {isSubmitting
                ? <Loader2 size={18} className="df-spinning" />
                : <><span>Ingresar al panel</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '26px 0 20px' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: '0.73rem', color: '#CBD5E1', fontWeight: 500 }}>o</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          {/* Register */}
          <div style={{ textAlign: 'center', fontSize: '0.87rem', color: TOKENS.textBody }}>
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="df-reg"
              style={{ color: TOKENS.brandPrimary, fontWeight: 700, textDecoration: 'none', transition: 'color 0.15s' }}
            >
              Regístrate gratis
            </Link>
          </div>

          {/* Trust row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 22, marginTop: 28, paddingTop: 22,
            borderTop: '1px solid #E2E8F0',
          }}>
            {[
              { Icon: Shield,       label: 'Cifrado SSL'     },
              { Icon: CheckCircle2, label: 'HIPAA Compliant' },
              { Icon: Zap,          label: '99.9% uptime'    },
            ].map(({ Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: TOKENS.textMuted, fontWeight: 500 }}>
                <Icon size={13} color={TOKENS.brandPrimary} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
