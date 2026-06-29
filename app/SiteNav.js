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
        <a href="/turnos" onClick={closeMenu}>Turnos</a>
        <a href="/cursos" onClick={closeMenu}>Cursos</a>
        <a href="/catalogo" onClick={closeMenu}>Catalogo</a>
        <a href="/aula" onClick={closeMenu}>Aula</a>
        {isAdmin ? <a href="/admin" onClick={closeMenu}>Admin</a> : null}
        {isLoggedIn ? (
          <>
            <a href="/mi-cuenta" onClick={closeMenu}>Mi Cuenta</a>
            <form action="/auth/logout" method="post">
              <button className="nav-button" type="submit">Salir</button>
            </form>
          </>
        ) : (
          <>
            <a href="/login" onClick={closeMenu}>Ingresar</a>
            <a className="button" href="/registro" onClick={closeMenu}>Crear cuenta</a>
          </>
        )}
      </nav>
    </div>
  );
}
