"use client";

import { useEffect, useRef, useState } from "react";

function useCloseOnOutsideClick(ref, isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, onClose, ref]);
}

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

function SiteNotificationMenu({ unreadMessages = 0, unreadNotifications = 0, isOpen, onToggle, onClose }) {
  const pendingAlerts = unreadNotifications + unreadMessages;
  const menuRef = useRef(null);

  useCloseOnOutsideClick(menuRef, isOpen, onClose);

  return (
    <details className="site-notification-menu" open={isOpen} ref={menuRef}>
      <summary
        aria-label="Abrir notificaciones"
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
      >
        <span className="notification-bell-shape" aria-hidden="true" />
        <NavCounter value={pendingAlerts} />
      </summary>
      <div className="site-notification-dropdown">
        <strong>Notificaciones</strong>
        <a href="/mi-cuenta#notificaciones" onClick={onClose}>
          Notificaciones
          <NavCounter value={unreadNotifications} />
        </a>
        <a href="/mi-cuenta#mensajes" onClick={onClose}>
          Mensajes
          <NavCounter value={unreadMessages} />
        </a>
      </div>
    </details>
  );
}

export default function SiteNav({
  displayName = "",
  email = "",
  isAdmin,
  isSpecialist,
  isLoggedIn,
  unreadMessages = 0,
  unreadNotifications = 0,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const initials = getInitials(displayName || email);

  useCloseOnOutsideClick(userMenuRef, isUserMenuOpen, () => setIsUserMenuOpen(false));

  function closeMenu() {
    setIsOpen(false);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
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
              <SiteNotificationMenu
                unreadMessages={unreadMessages}
                unreadNotifications={unreadNotifications}
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onToggle={() => {
                  setIsNotificationOpen((value) => !value);
                  setIsUserMenuOpen(false);
                }}
              />
              <details className="site-user-menu" open={isUserMenuOpen} ref={userMenuRef}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    setIsUserMenuOpen((value) => !value);
                    setIsNotificationOpen(false);
                  }}
                >
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
