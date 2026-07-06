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

function formatShortDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("es-AR");
}

function SiteNotificationMenu({
  unreadMessages = 0,
  unreadNotifications = 0,
  notificationPreview = [],
  messagePreview = [],
  isOpen,
  onToggle,
  onClose,
  onHoverStart,
  onHoverEnd,
}) {
  const pendingAlerts = unreadNotifications + unreadMessages;
  const menuRef = useRef(null);
  const items = [
    ...notificationPreview.map((item) => ({
      id: `notification-${item.id}`,
      label: item.notification_type || "Notificacion",
      title: item.title,
      body: item.body,
      href: item.href || "/mi-cuenta#notificaciones",
      date: item.created_at,
      unread: pendingAlerts > 0 && !item.read_at,
    })),
    ...messagePreview.map((item) => ({
      id: `message-${item.id}`,
      label: item.message_type || "Mensaje",
      title: item.subject,
      body: item.body,
      href: "/mi-cuenta#mensajes",
      date: item.created_at,
      unread: pendingAlerts > 0 && !item.read_at,
    })),
  ]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 5);

  useCloseOnOutsideClick(menuRef, isOpen, onClose);

  return (
    <details
      className="site-notification-menu"
      open={isOpen}
      ref={menuRef}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
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
        {items.length ? (
          <div className="site-notification-list">
            {items.map((item) => (
              <a className={item.unread ? "is-unread" : ""} href={item.href} key={item.id} onClick={onClose}>
                <span>{item.label}</span>
                <b>{item.title}</b>
                {item.body ? <small>{item.body}</small> : null}
                <em>{formatShortDate(item.date)}</em>
              </a>
            ))}
          </div>
        ) : (
          <p className="site-notification-empty">No tenes novedades por ahora.</p>
        )}
        <a className="site-notification-all" href="/mi-cuenta#notificaciones" onClick={onClose}>Ver todas</a>
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
  notificationPreview = [],
  messagePreview = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [visibleUnreadNotifications, setVisibleUnreadNotifications] = useState(unreadNotifications);
  const [visibleUnreadMessages, setVisibleUnreadMessages] = useState(unreadMessages);
  const closeTimerRef = useRef(null);
  const userMenuRef = useRef(null);
  const initials = getInitials(displayName || email);

  useCloseOnOutsideClick(userMenuRef, isUserMenuOpen, () => setIsUserMenuOpen(false));

  useEffect(() => {
    setVisibleUnreadNotifications(unreadNotifications);
    setVisibleUnreadMessages(unreadMessages);
  }, [unreadNotifications, unreadMessages]);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function closeDropdownsWithDelay() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsNotificationOpen(false);
      setIsUserMenuOpen(false);
    }, 260);
  }

  function closeMenu() {
    clearCloseTimer();
    setIsOpen(false);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
  }

  function markNotificationsRead() {
    if (!visibleUnreadNotifications && !visibleUnreadMessages) {
      return;
    }

    setVisibleUnreadNotifications(0);
    setVisibleUnreadMessages(0);
    fetch("/notifications/read", { method: "POST" }).catch(() => {});
  }

  function openNotifications() {
    clearCloseTimer();
    markNotificationsRead();
    setIsNotificationOpen(true);
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
          <a href="/turnos" onClick={closeMenu}>Consultas</a>
          <a href="/contacto" onClick={closeMenu}>Contacto</a>
        </div>
        <div className="site-nav-actions">
          {isLoggedIn ? (
            <>
              <SiteNotificationMenu
                unreadMessages={visibleUnreadMessages}
                unreadNotifications={visibleUnreadNotifications}
                notificationPreview={notificationPreview}
                messagePreview={messagePreview}
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onHoverStart={openNotifications}
                onHoverEnd={closeDropdownsWithDelay}
                onToggle={() => {
                  clearCloseTimer();
                  setIsNotificationOpen((value) => {
                    if (!value) {
                      markNotificationsRead();
                    }

                    return !value;
                  });
                  setIsUserMenuOpen(false);
                }}
              />
              <details
                className="site-user-menu"
                open={isUserMenuOpen}
                ref={userMenuRef}
                onMouseEnter={() => {
                  clearCloseTimer();
                  setIsUserMenuOpen(true);
                  setIsNotificationOpen(false);
                }}
                onMouseLeave={closeDropdownsWithDelay}
              >
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    clearCloseTimer();
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
                    <a href="/mi-cuenta#compras" onClick={closeMenu}>Mis compras</a>
                    <a href="/mi-cuenta#facturacion" onClick={closeMenu}>Facturacion</a>
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
