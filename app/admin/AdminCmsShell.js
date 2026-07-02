"use client";

import { useEffect, useMemo, useState } from "react";

const menuGroups = [
  [
    { label: "Dashboard", href: "#dashboard", icon: "D" },
    { label: "Sitio principal", href: "/", icon: "H" },
    { label: "Mi Espacio", href: "/mi-cuenta", icon: "E" },
  ],
  [
    { label: "Profesionales", href: "#profesionales", icon: "P" },
    { label: "Turnos", href: "#turnos", icon: "T" },
  ],
  [
    { label: "Cursos", href: "#cursos", icon: "C" },
    { label: "Módulos", href: "#modulos", icon: "M" },
    { label: "Lecciones", href: "#lecciones", icon: "L" },
    { label: "Materiales", href: "#materiales", icon: "A" },
  ],
  [
    { label: "Catálogo", href: "#catalogo", icon: "G" },
    { label: "Productos", href: "#productos", icon: "R" },
    { label: "Categorias", href: "#categorias", icon: "K" },
    { label: "Solicitudes", href: "#solicitudes", icon: "S" },
  ],
  [
    { label: "Usuarios", href: "#usuarios", icon: "U" },
    { label: "Inscripciones", href: "#inscripciones", icon: "I" },
  ],
  [
    { label: "Contenido", href: "#contenido", icon: "N" },
    { label: "Biblioteca", href: "#biblioteca", icon: "B" },
  ],
  [
    { label: "Configuración", href: "#configuracion", icon: "O" },
  ],
];

const viewActions = {
  dashboard: [
    { label: "Turnos", href: "#turnos" },
    { label: "Cursos", href: "#cursos" },
    { label: "Usuarios", href: "#usuarios" },
  ],
  turnos: [
    { label: "Profesionales", href: "#profesionales" },
    { label: "Horarios", href: "#turnos" },
    { label: "Reservas", href: "#turnos" },
  ],
  cursos: [
    { label: "Crear curso", href: "#cursos" },
    { label: "Modulos", href: "#modulos" },
    { label: "Lecciones", href: "#lecciones" },
    { label: "Materiales", href: "#materiales" },
  ],
  modulos: [
    { label: "Crear modulo", href: "#modulos" },
    { label: "Lecciones", href: "#lecciones" },
    { label: "Cursos", href: "#cursos" },
  ],
  lecciones: [
    { label: "Crear leccion", href: "#lecciones" },
    { label: "Materiales", href: "#materiales" },
    { label: "Cursos", href: "#cursos" },
  ],
  materiales: [
    { label: "Subir material", href: "#materiales" },
    { label: "Lecciones", href: "#lecciones" },
    { label: "Cursos", href: "#cursos" },
  ],
  catalogo: [
    { label: "Productos", href: "#productos" },
    { label: "Solicitudes", href: "#solicitudes" },
  ],
  usuarios: [
    { label: "Usuarios", href: "#usuarios" },
    { label: "Inscripciones", href: "#inscripciones" },
  ],
  inscripciones: [
    { label: "Habilitar curso", href: "#inscripciones" },
    { label: "Usuarios", href: "#usuarios" },
  ],
  contenido: [
    { label: "Modulos", href: "#modulos" },
    { label: "Lecciones", href: "#lecciones" },
    { label: "Materiales", href: "#materiales" },
  ],
};

function getInitials(name, email) {
  const source = name || email || "Admin";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
}

function getViewFromHash(hash) {
  const key = String(hash || "#dashboard").replace("#", "") || "dashboard";
  const viewMap = {
    dashboard: "dashboard",
    profesionales: "turnos",
    turnos: "turnos",
    cursos: "cursos",
    modulos: "modulos",
    lecciones: "lecciones",
    materiales: "materiales",
    catalogo: "catalogo",
    productos: "catalogo",
    categorias: "catalogo",
    solicitudes: "catalogo",
    usuarios: "usuarios",
    inscripciones: "inscripciones",
    contenido: "contenido",
    biblioteca: "contenido",
    configuracion: "configuracion",
  };

  return viewMap[key] || "dashboard";
}

export default function AdminCmsShell({ adminName, adminEmail, children }) {
  const flatMenu = useMemo(() => menuGroups.flat(), []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const initials = getInitials(adminName, adminEmail);
  const activeItem = flatMenu.find((item) => item.href === activeHash) || flatMenu[0];
  const activeView = getViewFromHash(activeHash);
  const activeActions = viewActions[activeView] || [];

  useEffect(() => {
    const storedValue = window.localStorage.getItem("lumen-admin-sidebar-collapsed");

    if (storedValue === "true") {
      setIsCollapsed(true);
    }

    function updateHash() {
      setActiveHash(window.location.hash || "#dashboard");
    }

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
    const panels = document.querySelectorAll("[data-admin-view]");

    panels.forEach((panel) => {
      const views = String(panel.getAttribute("data-admin-view") || "")
        .split(/\s+/)
        .filter(Boolean);

      panel.hidden = views.length ? !views.includes(activeView) : false;
    });
  }, [activeView]);

  useEffect(() => {
    const items = document.querySelectorAll(
      ".admin-cms-content article, .admin-cms-content tbody tr, .admin-cms-content .cms-empty-state"
    );
    const normalizedQuery = searchQuery.trim().toLowerCase();

    items.forEach((item) => {
      const parentPanel = item.closest("[data-admin-view]");

      if (parentPanel?.hidden) {
        item.removeAttribute("data-admin-filter-hidden");
        return;
      }

      const matches = !normalizedQuery || item.textContent.toLowerCase().includes(normalizedQuery);
      item.toggleAttribute("data-admin-filter-hidden", !matches);
    });
  }, [activeView, searchQuery]);

  function toggleCollapsed() {
    setIsCollapsed((current) => {
      const nextValue = !current;
      window.localStorage.setItem("lumen-admin-sidebar-collapsed", String(nextValue));
      return nextValue;
    });
  }

  function closeMobileMenu() {
    setIsMobileOpen(false);
  }

  return (
    <div className={`admin-cms-shell ${isCollapsed ? "is-collapsed" : ""} ${isMobileOpen ? "is-mobile-open" : ""}`} data-active-admin-view={activeView}>
      <button className="admin-cms-overlay" type="button" aria-label="Cerrar menu" onClick={closeMobileMenu} />

      <aside className="admin-cms-sidebar" aria-label="Navegacion del CMS">
        <div className="admin-cms-sidebar-head">
          <a className="brand" href="/admin">
            <span className="brand-mark" aria-hidden="true" />
            <span className="admin-cms-brand-text">LUMEN CMS</span>
          </a>
          <button className="admin-cms-collapse" type="button" onClick={toggleCollapsed} aria-label="Contraer sidebar">
            {isCollapsed ? ">" : "<"}
          </button>
        </div>

        <nav className="admin-cms-menu">
          {menuGroups.map((group, index) => (
            <div className="admin-cms-menu-group" key={`group-${index}`}>
              {group.map((item) => (
                <a
                  className={activeHash === item.href ? "is-active" : ""}
                  href={item.href}
                  key={item.label}
                  onClick={closeMobileMenu}
                  title={item.label}
                >
                  <span className="admin-cms-icon" aria-hidden="true">{item.icon}</span>
                  <span className="admin-cms-label">{item.label}</span>
                </a>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-cms-main-shell">
        <header className="admin-cms-header">
          <div className="admin-cms-header-left">
            <button className="admin-cms-mobile-toggle" type="button" onClick={() => setIsMobileOpen(true)}>
              Menu
            </button>
            <div>
              <p className="eyebrow">Panel administrativo</p>
              <strong>CMS LUMEN</strong>
              <nav className="admin-breadcrumb" aria-label="Breadcrumb">
                <a href="/admin">Admin</a>
                <span>/</span>
                <a href={activeItem.href}>{activeItem.label}</a>
              </nav>
            </div>
          </div>

          <label className="admin-cms-search">
            <span>Buscar</span>
            <input
              placeholder={`Buscar en ${activeItem.label.toLowerCase()}...`}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <details className="admin-user-menu">
            <summary>
              <span className="admin-avatar" aria-hidden="true">{initials}</span>
              <span>{adminName || adminEmail || "Admin"}</span>
            </summary>
            <div>
              <p>{adminEmail || "Usuario administrador"}</p>
              <a href="/mi-cuenta">Mi Espacio</a>
              <a href="/">Sitio principal</a>
              <a href="#dashboard">Dashboard</a>
              <form action="/auth/logout" method="post">
                <button type="submit">Cerrar sesión</button>
              </form>
            </div>
          </details>
        </header>

        <main className="admin-cms-content">
          {activeActions.length ? (
            <nav className="admin-cms-view-actions" aria-label="Accesos de la pantalla actual">
              {activeActions.map((action) => (
                <a href={action.href} key={`${activeView}-${action.href}`}>
                  {action.label}
                </a>
              ))}
            </nav>
          ) : null}
          {children}
        </main>

        <footer className="admin-cms-footer">
          <span>LUMEN CMS</span>
          <span>Arquitectura preparada para nuevos módulos.</span>
        </footer>
      </div>
    </div>
  );
}
