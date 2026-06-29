"use client";

import { useState } from "react";

export default function AccountDashboardShell({ navItems, displayName, avatarInitials, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <main className={`account-app-shell${isMenuOpen ? " is-menu-open" : ""}`}>
      <button className="account-app-overlay" type="button" aria-label="Cerrar menu" onClick={closeMenu} />

      <aside className="account-sidebar" aria-label="Navegacion de mi cuenta">
        <a className="account-brand" href="/mi-cuenta" onClick={closeMenu}>
          <span className="account-brand-mark" aria-hidden="true" />
          <strong>LUMEN</strong>
        </a>

        <nav className="account-sidebar-nav">
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
            Cerrar sesion
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
            <button className="account-icon-button" type="button" aria-label="Notificaciones">
              N
              <span>3</span>
            </button>
            <button className="account-icon-button" type="button" aria-label="Mensajes">M</button>
            <details className="account-user-menu">
              <summary>
                <span className="account-avatar">{avatarInitials}</span>
                <strong>{displayName}</strong>
              </summary>
              <div>
                <a href="#configuracion">Ver perfil</a>
                <form action="/auth/logout" method="post">
                  <button type="submit">Cerrar sesion</button>
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
