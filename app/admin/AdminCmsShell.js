"use client";

import { useEffect, useMemo, useState } from "react";

const menuGroups = [
  [
    { label: "Dashboard", href: "#dashboard", icon: "D" },
  ],
  [
    { label: "Profesionales", href: "#profesionales", icon: "P" },
    { label: "Turnos", href: "#turnos", icon: "T" },
  ],
  [
    { label: "Cursos", href: "#cursos", icon: "C" },
    { label: "Modulos", href: "#modulos", icon: "M" },
    { label: "Lecciones", href: "#lecciones", icon: "L" },
    { label: "Materiales", href: "#materiales", icon: "A" },
  ],
  [
    { label: "Catalogo", href: "#catalogo", icon: "G" },
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
    { label: "Configuracion", href: "#configuracion", icon: "O" },
  ],
];

function getInitials(name, email) {
  const source = name || email || "Admin";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
}

export default function AdminCmsShell({ adminName, adminEmail, children }) {
  const flatMenu = useMemo(() => menuGroups.flat(), []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#dashboard");
  const initials = getInitials(adminName, adminEmail);
  const activeItem = flatMenu.find((item) => item.href === activeHash) || flatMenu[0];

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
    <div className={`admin-cms-shell ${isCollapsed ? "is-collapsed" : ""} ${isMobileOpen ? "is-mobile-open" : ""}`}>
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
            <input placeholder="Buscar en el CMS..." type="search" />
          </label>

          <details className="admin-user-menu">
            <summary>
              <span className="admin-avatar" aria-hidden="true">{initials}</span>
              <span>{adminName || adminEmail || "Admin"}</span>
            </summary>
            <div>
              <p>{adminEmail || "Usuario administrador"}</p>
              <form action="/auth/logout" method="post">
                <button type="submit">Cerrar sesion</button>
              </form>
            </div>
          </details>
        </header>

        <main className="admin-cms-content">
          {children}
        </main>

        <footer className="admin-cms-footer">
          <span>LUMEN CMS</span>
          <span>Arquitectura preparada para nuevos modulos.</span>
        </footer>
      </div>
    </div>
  );
}
