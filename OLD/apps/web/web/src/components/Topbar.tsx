import { Search, Bell, Menu } from "lucide-react";
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

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? "Detalle";
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  return (
    <header className="topbar glass">
      {/* Mobile menu button */}
      <button 
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-lg bg-bg-subtle border border-border flex items-center justify-center cursor-pointer transition-colors hover:bg-bg-elevated mr-2"
      >
        <Menu size={20} className="text-text-primary" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-lg font-bold font-display text-text-primary tracking-tight">
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="relative shrink-0 hidden sm:block">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar paciente o turno..."
          className="input-field pl-9 w-[260px] text-xs"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-[0.7rem] font-semibold text-text-tertiary capitalize">
            {today}
          </p>
          <p className="text-[0.7rem] font-bold text-primary mt-px">
            • En línea
          </p>
        </div>

        <button className="btn-secondary w-9 h-9 !padding-0 flex items-center justify-center relative shrink-0">
          <Bell size={16} className="text-text-secondary" />
          <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-red-500 border-1.5 border-bg-elevated" />
        </button>
      </div>
    </header>
  );
}
