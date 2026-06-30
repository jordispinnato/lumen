"use client";

import { useState } from "react";

export default function SiteNav({ isAdmin, isLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className={`nav-shell ${isOpen ? "is-open" : ""}`}>
      <button
        aria-expanded={isOpen}
        aria-controls="site-nav"
        className="menu-toggle"
        type="button"
        onClick={() => setIsOpen((value) => !value)}
      >
        Menu
      </button>
      <nav className="site-nav" id="site-nav" aria-label="Principal">
        <div className="site-nav-links">
          <a href="/quienes-somos" onClick={closeMenu}>Quiénes somos</a>
          <a href="/cursos" onClick={closeMenu}>Cursos</a>
          <a href="/catalogo" onClick={closeMenu}>Catálogo</a>
          <a href="/turnos" onClick={closeMenu}>Turnos</a>
        </div>
        <div className="site-nav-actions">
          {isLoggedIn ? (
            <>
              <a className="secondary-button" href="/mi-cuenta" onClick={closeMenu}>Mi Espacio</a>
              {isAdmin ? <a className="secondary-button" href="/admin" onClick={closeMenu}>Admin</a> : null}
              <form action="/auth/logout" method="post">
                <button className="nav-button" type="submit">Salir</button>
              </form>
            </>
          ) : (
            <>
              <a className="secondary-button" href="/login" onClick={closeMenu}>Iniciar sesión</a>
              <a className="button" href="/registro" onClick={closeMenu}>Registrarse</a>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
