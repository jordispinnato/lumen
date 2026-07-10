const titles = {
  dashboard: { kicker: "Mi Espacio", title: "Mi Espacio" },
  list: { kicker: "Mi cuenta", title: "Carrito" },
  splitList: { kicker: "Mi cuenta", title: "Mis pedidos" },
  form: { kicker: "Mi cuenta", title: "Facturación" },
};

const navItems = [
  { icon: "I", label: "Inicio" },
  { icon: "T", label: "Mis turnos" },
  { icon: "C", label: "Mis cursos" },
  { icon: "R", label: "Mis recursos" },
];
function SkeletonLine({ size = "medium" }) {
  return <span className={`account-skeleton-line is-${size}`} aria-hidden="true" />;
}
function SkeletonPanelHead() {
  return (
    <div className="account-panel-head">
      <div>
        <span className="account-skeleton-icon" aria-hidden="true" />
        <SkeletonLine />
      </div>
    </div>
  );
}
function SkeletonRows({ count = 3 }) {
  return (
    <div className="account-history-list">
      {Array.from({ length: count }).map((_, index) => (
        <article className="account-skeleton-card" key={index}>
          <SkeletonLine size="small" />
          <SkeletonLine size="large" />
          <SkeletonLine />
        </article>
      ))}
    </div>
  );
}
function SkeletonGrid({ count = 4, wide = false }) {
  return (
    <div className={`account-settings-grid${wide ? " is-wide" : ""}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div className="account-settings-card account-skeleton-card" key={index}>
          <SkeletonLine size="medium" />
          <SkeletonLine />
          <SkeletonLine size="small" />
        </div>
      ))}
    </div>
  );
}
function DashboardSkeleton() {
  return (
    <>
      <section className="account-stats-grid" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <article className="account-stat-card account-skeleton-card" key={index}>
            <span className="account-skeleton-icon" />
            <div>
              <SkeletonLine size="small" />
              <SkeletonLine />
            </div>
          </article>
        ))}
      </section>
      <section className="account-panel">
        <SkeletonPanelHead />
        <div className="account-course-grid" aria-hidden="true">
          {Array.from({ length: 2 }).map((_, index) => (
            <article className="account-course-card account-skeleton-card" key={index}>
              <div className="account-skeleton-media" />
              <div className="account-course-body">
                <SkeletonLine size="large" />
                <SkeletonLine />
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="account-lower-grid">
        <section className="account-panel">
          <SkeletonPanelHead />
          <SkeletonRows count={2} />
        </section>
        <section className="account-panel">
          <SkeletonPanelHead />
          <SkeletonRows count={2} />
        </section>
      </div>
    </>
  );
}
function LoadingContent({ variant }) {
  if (variant === "dashboard") {
    return <DashboardSkeleton />;
  }
  if (variant === "splitList") {
    return (
      <div className="account-lower-grid">
        <section className="account-panel">
          <SkeletonPanelHead />
          <SkeletonRows />
        </section>
        <section className="account-panel">
          <SkeletonPanelHead />
          <SkeletonRows />
        </section>
      </div>
    );
  }
  if (variant === "form") {
    return (
      <section className="account-panel">
        <SkeletonPanelHead />
        <SkeletonGrid count={4} />
        <SkeletonGrid count={3} wide />
      </section>
    );
  }
  return (
    <section className="account-panel">
      <SkeletonPanelHead />
      <SkeletonRows />
    </section>
  );
}
export default function AccountLoadingState({ variant = "dashboard", title }) {
  const current = titles[variant] || titles.dashboard;
  return (
    <main className="account-app-shell account-skeleton-shell">
      <aside className="account-sidebar" aria-label="Cargando navegación de Mi Espacio">
        <div className="account-brand">
          <span className="account-brand-mark" aria-hidden="true" />
          <span>
            <strong>LUMEN</strong>
            <small>Mi Espacio</small>
          </span>
        </div>
        <nav className="account-sidebar-nav" aria-hidden="true">
          {navItems.map((item, index) => (
            <span className={`account-skeleton-nav-item${index === 0 ? " is-active" : ""}`} key={item.label}>
              <span>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </nav>
      </aside>
      <section className="account-app-main">
        <header className="account-app-header">
          <span className="account-skeleton-menu" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <div className="account-header-actions" aria-hidden="true">
            <span className="account-cart-link account-skeleton-block" />
            <span className="account-icon-button account-skeleton-block" />
            <span className="account-user-badge account-skeleton-user">
              <span className="account-avatar" />
              <SkeletonLine size="small" />
            </span>
          </div>
        </header>
        <div className="account-dashboard" aria-busy="true" aria-label="Cargando página">
          <section className="account-hero">
            <div>
              <span className="account-page-kicker">{current.kicker}</span>
              <h1>{title || current.title}</h1>
            </div>
            <span className="account-skeleton-action account-skeleton-block" aria-hidden="true" />
          </section>
          <LoadingContent variant={variant} />
        </div>
      </section>
    </main>
  );
}
