import { Search, Bell } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/pacientes": "Pacientes",
  "/agenda": "Agenda",
  "/obras-sociales": "Obras Sociales",
  "/configuracion": "Configuración",
};

export default function Topbar() {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? "Detalle";
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

    <header className="topbar glass">
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h1>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Search
          size={15}
          color="var(--text-tertiary)"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Buscar paciente o turno..."
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 16px 8px 36px',
            fontSize: '0.8rem',
            color: 'var(--text-primary)',
            outline: 'none',
            width: '260px',
            fontFamily: 'var(--font-sans)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
            {today}
          </p>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', marginTop: '1px' }}>
            • En línea
          </p>
        </div>

        <button style={{
          width: '36px', height: '36px',
          borderRadius: '8px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
          transition: 'background 0.15s',
          flexShrink: 0,
        }}>
          <Bell size={16} color="var(--text-secondary)" />
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '7px', height: '7px',
            borderRadius: '50%', background: '#ef4444',
            border: '1.5px solid var(--bg-elevated)',
          }} />
        </button>
      </div>
    </header>
  );
}
