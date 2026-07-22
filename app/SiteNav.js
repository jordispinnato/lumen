"use client";

import Link from "next/link";
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
      label: item.notification_type || "Notificación",
      title: item.title,
      body: item.body,
      href: item.href || "/mis-notificaciones",
      date: item.created_at,
      unread: pendingAlerts > 0 && !item.read_at,
    })),
    ...messagePreview.map((item) => ({
      id: `message-${item.id}`,
      label: item.message_type || "Mensaje",
      title: item.subject,
      body: item.body,
      href: "/mis-mensajes",
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
        <span className="site-mobile-action-label">Notificaciones</span>
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
        <Link className="site-notification-all" href="/mis-notificaciones" onClick={onClose}>Ver todas</Link>
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
  cartCount = 0,
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
      {isLoggedIn ? (
        <Link
          className="mobile-account-link"
          href="/mi-cuenta"
          aria-label="Ir a Mi Espacio"
          title="Mi Espacio"
          onClick={closeMenu}
        >
          <span className="site-user-avatar">{initials}</span>
        </Link>
      ) : null}
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
          <Link href="/quienes-somos" onClick={closeMenu}>Quiénes somos</Link>
          <Link href="/cursos" onClick={closeMenu}>Cursos</Link>
          <Link href="/catalogo" onClick={closeMenu}>Catálogo</Link>
          <Link href="/turnos" onClick={closeMenu}>Consultas profesionales</Link>
          <Link href="/contacto" onClick={closeMenu}>Contacto</Link>
        </div>
        <div className="site-nav-actions">
          {isLoggedIn ? (
            <>
              <Link
                className="site-cart-link"
                href="/carrito"
                aria-label="Ir al carrito"
                title="Carrito"
                onClick={closeMenu}
              >
                <svg
                  className="cart-icon-shape"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="20" r="1.4" />
                  <circle cx="18" cy="20" r="1.4" />
                  <path d="M2 3h2.4l2.24 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
                </svg>
                <span className="site-mobile-action-label">Carrito</span>
                <NavCounter value={cartCount} />
              </Link>
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
                  <span className="site-mobile-user-copy">
                    <strong>{displayName || email || "Mi Espacio"}</strong>
                    <small>Mi Espacio</small>
                  </span>
                  <span className="site-mobile-chevron" aria-hidden="true">{">"}</span>
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
                    <Link href="/mi-cuenta" onClick={closeMenu}>Mi Espacio</Link>
                    <Link href="/mi-perfil" onClick={closeMenu}>Mi Perfil</Link>
                    {isSpecialist ? <Link href="/especialista" onClick={closeMenu}>Panel especialista</Link> : null}
                    {isAdmin ? <Link href="/admin" onClick={closeMenu}>Admin</Link> : null}
                  </div>
                  <div className="site-user-section">
                    <Link href="/carrito" onClick={closeMenu}>Carrito</Link>
                    <Link href="/mis-pedidos" onClick={closeMenu}>Mis pedidos</Link>
                    <Link href="/facturacion" onClick={closeMenu}>Facturación</Link>
                  </div>
                  <div className="site-user-section">
                    <Link href="/configuracion" onClick={closeMenu}>Configuración</Link>
                  </div>
                  <form action="/auth/logout" method="post">
                    <button type="submit">Cerrar sesión</button>
                  </form>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link className="secondary-button" href="/login" onClick={closeMenu}>Iniciar sesión</Link>
              <Link className="button" href="/registro" onClick={closeMenu}>Registrarse</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
