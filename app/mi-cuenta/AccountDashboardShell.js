"use client";

import { useState } from "react";

function formatShortDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("es-AR");
}

function NotificationDropdown({ messages = [], notifications = [], count = 0 }) {
  const items = [
    ...notifications.slice(0, 4).map((item) => ({
      id: `notification-${item.id}`,
      title: item.title,
      body: item.body,
      href: item.href || "#notificaciones",
      type: item.notification_type || "notificacion",
      date: item.created_at,
      unread: !item.read_at,
    })),
    ...messages.slice(0, 4).map((item) => ({
      id: `message-${item.id}`,
      title: item.subject,
      body: item.body,
      href: "#mensajes",
      type: item.message_type || "mensaje",
      date: item.created_at,
      unread: !item.read_at,
    })),
  ]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 6);

  return (
    <details className="account-notification-menu">
      <summary aria-label="Abrir notificaciones">
        <span className="notification-bell-shape" aria-hidden="true" />
        {count > 0 ? <span className="account-notification-badge">{count > 9 ? "9+" : count}</span> : null}
      </summary>
      <div className="account-notification-dropdown">
        <div className="account-notification-head">
          <strong>Notificaciones</strong>
          <a href="#notificaciones">Ver todas</a>
        </div>
        {items.length ? (
          <div className="account-notification-list">
            {items.map((item) => (
              <a className={item.unread ? "is-unread" : ""} href={item.href} key={item.id}>
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
  children,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <main className={`account-app-shell${isMenuOpen ? " is-menu-open" : ""}`}>
      <button className="account-app-overlay" type="button" aria-label="Cerrar menu" onClick={closeMenu} />

      <aside className="account-sidebar" aria-label="Navegacion de Mi Espacio">
        <a className="account-brand" href="/" onClick={closeMenu}>
          <span className="account-brand-mark" aria-hidden="true" />
          <span>
            <strong>LUMEN</strong>
            <small>Mi Espacio</small>
          </span>
        </a>

        <nav className="account-sidebar-nav">
          <a href="/" onClick={closeMenu}>
            <span>H</span>
            Sitio principal
          </a>
          {isAdmin ? (
            <a href="/admin" onClick={closeMenu}>
              <span>A</span>
              Ir al Admin
            </a>
          ) : null}
          {navItems.map((item) => (
            <a className={item.href === "#inicio" ? "is-active" : ""} href={item.href} key={item.href} onClick={closeMenu}>
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
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
            <NotificationDropdown count={notificationCount} messages={messages} notifications={notifications} />
            <details className="account-user-menu">
              <summary>
                <span className="account-avatar">{avatarInitials}</span>
                <strong>{displayName}</strong>
              </summary>
              <div>
                <a href="#cursos">Mi aprendizaje</a>
                <a href="#carrito">Mi carrito</a>
                <a href="#configuracion">Configuracion de la cuenta</a>
                <a href="#pedidos">Historial de compra</a>
                <a href="/">Ir al sitio principal</a>
                {isAdmin ? <a href="/admin">Ir al Admin</a> : null}
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
