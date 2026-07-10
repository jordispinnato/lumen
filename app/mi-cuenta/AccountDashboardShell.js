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

function formatShortDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("es-AR");
}

function NotificationDropdown({ messages = [], notifications = [], count = 0, isOpen, onToggle, onClose }) {
  const menuRef = useRef(null);
  const items = [
    ...notifications.slice(0, 4).map((item) => ({
      id: `notification-${item.id}`,
      title: item.title,
      body: item.body,
      href: item.href || "#notificaciones",
      type: item.notification_type || "notificacion",
      date: item.created_at,
      unread: count > 0 && !item.read_at,
    })),
    ...messages.slice(0, 4).map((item) => ({
      id: `message-${item.id}`,
      title: item.subject,
      body: item.body,
      href: "#mensajes",
      type: item.message_type || "mensaje",
      date: item.created_at,
      unread: count > 0 && !item.read_at,
    })),
  ]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 6);

  useCloseOnOutsideClick(menuRef, isOpen, onClose);

  return (
    <details className="account-notification-menu" open={isOpen} ref={menuRef}>
      <summary
        aria-label="Abrir notificaciones"
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
      >
        <span className="notification-bell-shape" aria-hidden="true" />
        {count > 0 ? <span className="account-notification-badge">{count > 9 ? "9+" : count}</span> : null}
      </summary>
      <div className="account-notification-dropdown">
        <div className="account-notification-head">
          <strong>Notificaciones</strong>
          <a href="#notificaciones" onClick={onClose}>Ver todas</a>
        </div>
        {items.length ? (
          <div className="account-notification-list">
            {items.map((item) => (
              <a className={item.unread ? "is-unread" : ""} href={item.href} key={item.id} onClick={onClose}>
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                {item.body ? <small>{item.body}</small> : null}
                <em>{formatShortDate(item.date)}</em>
              </a>
            ))}
          </div>
        ) : (
          <p className="account-notification-empty">No tenes novedades por ahora.</p>
        )}
      </div>
    </details>
  );
}

export default function AccountDashboardShell({
  navItems,
  displayName,
  avatarInitials,
  isAdmin = false,
  notificationCount = 0,
  notifications = [],
  messages = [],
  cartCount = 0,
  children,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [visibleNotificationCount, setVisibleNotificationCount] = useState(notificationCount);
  const userMenuRef = useRef(null);

  useCloseOnOutsideClick(userMenuRef, isUserMenuOpen, () => setIsUserMenuOpen(false));

  useEffect(() => {
    setVisibleNotificationCount(notificationCount);
  }, [notificationCount]);

  function closeMenu() {
    setIsMenuOpen(false);
    setIsNotificationOpen(false);
    setIsUserMenuOpen(false);
  }

  function markNotificationsRead() {
    if (!visibleNotificationCount) {
      return;
    }

    setVisibleNotificationCount(0);
    fetch("/notifications/read", { method: "POST" }).catch(() => {});
  }

  return (
    <main className={`account-app-shell${isMenuOpen ? " is-menu-open" : ""}`}>
      <button className="account-app-overlay" type="button" aria-label="Cerrar menu" onClick={closeMenu} />

      <aside className="account-sidebar" aria-label="Navegacion de Mi Espacio">
        <Link className="account-brand" href="/" onClick={closeMenu}>
          <span className="account-brand-mark" aria-hidden="true" />
          <span>
            <strong>LUMEN</strong>
            <small>Mi Espacio</small>
          </span>
        </Link>

        <nav className="account-sidebar-nav">
          {navItems.map((item) => {
            const content = (
              <>
                <span>{item.icon}</span>
                {item.label}
              </>
            );

            return item.href.startsWith("#") ? (
              <a className={item.href === "#inicio" ? "is-active" : ""} href={item.href} key={item.href} onClick={closeMenu}>
                {content}
              </a>
            ) : (
              <Link className={item.href === "#inicio" ? "is-active" : ""} href={item.href} key={item.href} onClick={closeMenu}>
                {content}
              </Link>
            );
          })}
        </nav>

        <form className="account-logout-form" action="/auth/logout" method="post">
          <button type="submit">
            <span aria-hidden="true">X</span>
            Cerrar sesión
          </button>
        </form>
      </aside>

      <section className="account-app-main">
        <header className="account-app-header">
          <button className="account-mobile-menu" type="button" aria-label="Abrir menu" onClick={() => setIsMenuOpen(true)}>
            <span />
            <span />
            <span />
          </button>
          <div className="account-header-actions">
            <Link
              className="account-cart-link"
              href="/carrito"
              aria-label="Ir al carrito"
              title="Carrito"
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
              {cartCount > 0 ? (
                <span className="account-notification-badge">{cartCount > 9 ? "9+" : cartCount}</span>
              ) : null}
            </Link>
            <NotificationDropdown
              count={visibleNotificationCount}
              messages={messages}
              notifications={notifications}
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              onToggle={() => {
                setIsNotificationOpen((value) => {
                  if (!value) {
                    markNotificationsRead();
                  }

                  return !value;
                });
                setIsUserMenuOpen(false);
              }}
            />
            <details className="account-user-menu" open={isUserMenuOpen} ref={userMenuRef}>
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setIsUserMenuOpen((value) => !value);
                  setIsNotificationOpen(false);
                }}
              >
                <span className="account-avatar">{avatarInitials}</span>
                <strong>{displayName}</strong>
              </summary>
              <div>
                <Link href="/mi-cuenta" onClick={closeMenu}>Mi Espacio</Link>
                <Link href="/mi-perfil" onClick={closeMenu}>Mi Perfil</Link>
                {isAdmin ? <Link href="/admin" onClick={closeMenu}>Ir al Admin</Link> : null}
                <Link href="/carrito" onClick={closeMenu}>Carrito</Link>
                <Link href="/mis-pedidos" onClick={closeMenu}>Mis pedidos</Link>
                <Link href="/facturacion" onClick={closeMenu}>Facturación</Link>
                <Link href="/configuracion" onClick={closeMenu}>Configuración</Link>
                <Link href="/" onClick={closeMenu}>Ir al sitio principal</Link>
                <form action="/auth/logout" method="post">
                  <button type="submit">Cerrar sesión</button>
                </form>
              </div>
            </details>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
