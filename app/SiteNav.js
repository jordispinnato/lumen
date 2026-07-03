"use client";

import { useState } from "react";

function getInitials(value) {
  return String(value || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

function NavCounter({ value }) {
  return value > 0 ? <span className="nav-counter">{value > 9 ? "9+" : value}</span> : null;
}

export default function SiteNav({
  cartItems = 0,
  displayName = "",
  email = "",
  isAdmin,
  isSpecialist,
  isLoggedIn,
  unreadMessages = 0,
  unreadNotifications = 0,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = getInitials(displayName || email);

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
              <a className="nav-icon-link" href="/mi-cuenta#favoritos" onClick={closeMenu} aria-label="Lista de deseos">H</a>
              <a className="nav-icon-link" href="/mi-cuenta#carrito" onClick={closeMenu} aria-label="Carrito">
                C
                <NavCounter value={cartItems} />
              </a>
              <a className="nav-icon-link" href="/mi-cuenta#notificaciones" onClick={closeMenu} aria-label="Notificaciones">
                N
                <NavCounter value={unreadNotifications} />
              </a>
              <details className="site-user-menu">
                <summary>
                  <span className="site-user-avatar">{initials}</span>
                </summary>
                <div className="site-user-dropdown">
                  <div className="site-user-card">
                    <span className="site-user-avatar large">{initials}</span>
                    <div>
                      <strong>{displayName || "Usuario LUMEN"}</strong>
                      <small>{email}</small>
                    </div>
                  </div>
                  <div className="site-user-section">
                    <a href="/mi-cuenta" onClick={closeMenu}>Mi Espacio</a>
                    <a href="/mi-cuenta#cursos" onClick={closeMenu}>Mi aprendizaje</a>
                    <a href="/mi-cuenta#carrito" onClick={closeMenu}>Mi carrito</a>
                    <a href="/mi-cuenta#favoritos" onClick={closeMenu}>Lista de deseos</a>
                    {isSpecialist ? <a href="/especialista" onClick={closeMenu}>Panel especialista</a> : null}
                    {isAdmin ? <a href="/admin" onClick={closeMenu}>Admin</a> : null}
                  </div>
                  <div className="site-user-section">
                    <a href="/mi-cuenta#notificaciones" onClick={closeMenu}>Notificaciones</a>
                    <a className="site-user-row" href="/mi-cuenta#mensajes" onClick={closeMenu}>
                      Mensajes
                      <NavCounter value={unreadMessages} />
                    </a>
                  </div>
                  <div className="site-user-section">
                    <a href="/mi-cuenta#configuracion" onClick={closeMenu}>Configuracion de la cuenta</a>
                    <a href="/mi-cuenta#pedidos" onClick={closeMenu}>Historial de compra</a>
                  </div>
                  <form action="/auth/logout" method="post">
                    <button type="submit">Cerrar sesion</button>
                  </form>
                </div>
              </details>
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
