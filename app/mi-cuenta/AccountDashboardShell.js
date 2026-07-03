"use client";

import { useState } from "react";

export default function AccountDashboardShell({ navItems, displayName, avatarInitials, isAdmin = false, children }) {
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
            <a className="account-icon-button" href="#notificaciones" aria-label="Notificaciones">
              N
              <span>3</span>
            </a>
            <a className="account-icon-button" href="#mensajes" aria-label="Mensajes">M</a>
            <a className="account-icon-button" href="#carrito" aria-label="Carrito">K</a>
            <details className="account-user-menu">
              <summary>
                <span className="account-avatar">{avatarInitials}</span>
                <strong>{displayName}</strong>
              </summary>
              <div>
                <a href="#cursos">Mi aprendizaje</a>
                <a href="#carrito">Mi carrito</a>
                <a href="#notificaciones">Notificaciones</a>
                <a href="#mensajes">Mensajes</a>
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
