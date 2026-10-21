import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Building2, GraduationCap, Sparkles } from "lucide-react";
import Brand from "../components/ui/Brand.jsx";
import { useTalentMatch } from "../hooks/useTalentMatch.js";
import { auth } from "../services/auth.js";
import { getNavigation } from "../routes/navigation.js";

export default function Sidebar() {
  const { profile, company } = useTalentMatch();
  const logout = () => auth.logout({ redirectUri: location.origin });
  return (
    <aside>
      <Brand />
      <button
        className="mobile-logout icon-button"
        aria-label="Cerrar sesión en móvil"
        onClick={logout}
      >
        <LogOut size={19} />
      </button>
      <div className="workspace">
        <span className="workspace-icon">
          {company ? <Building2 size={20} /> : <GraduationCap size={20} />}
        </span>
        <div>
          <strong>
            {company ? "Portal de empresa" : "Espacio del estudiante"}
          </strong>
          <small>Tu futuro, en movimiento</small>
        </div>
      </div>
      <span className="nav-label">MI ESPACIO</span>
      <nav aria-label="Navegación del portal">
        {getNavigation(profile.role).map(({ path, label, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `nav-link flex items-center gap-[9px] rounded-lg px-[13px] py-[14px] text-[12px] no-underline transition-colors max-md:text-[11px] max-sm:px-[10px] max-sm:py-[11px] ${isActive ? "active bg-[#eaf2e7] font-bold text-brand" : "bg-transparent font-medium text-muted hover:bg-[#f3f7f2] hover:text-brand"}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} />
                {label}
                {isActive && <span className="nav-dot" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-note">
        <Sparkles size={21} />
        <h4>
          Pequeños pasos.
          <br />
          Grandes oportunidades.
        </h4>
        <p>
          {company
            ? "Encuentra el talento que hará crecer tus ideas."
            : "Cada habilidad que aprendes abre una nueva puerta."}
        </p>
      </div>
      <div className="account">
        <div className="avatar">
          {profile.name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </div>
        <div>
          <strong>{profile.name}</strong>
          <small>{company ? "Empresa" : "Estudiante"}</small>
        </div>
        <button
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="icon-button"
          onClick={logout}
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
