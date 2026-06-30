export function DSButton({ as: Component = "button", variant = "primary", className = "", children, ...props }) {
  const classes = `ds-button ds-button-${variant} ${className}`.trim();

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

export function DSCard({ className = "", children, ...props }) {
  return (
    <section className={`ds-card ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

export function DSBadge({ tone = "neutral", children }) {
  return <span className={`ds-badge is-${tone}`}>{children}</span>;
}

export function DSTabs({ items = [], activeItem }) {
  return (
    <div className="ds-tabs" role="tablist">
      {items.map((item) => (
        <span className={item === activeItem ? "is-active" : ""} key={item} role="tab">
          {item}
        </span>
      ))}
    </div>
  );
}

export function DSEmptyState({ title, text, action }) {
  return (
    <div className="ds-empty-state">
      <span aria-hidden="true">+</span>
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {action}
    </div>
  );
}

export function DSModal({ title, text, children }) {
  return (
    <div className="ds-modal-backdrop" role="presentation">
      <section className="ds-modal" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        {text ? <p>{text}</p> : null}
        {children}
      </section>
    </div>
  );
}

export function DSToastStack({ messages = [] }) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="ds-toast-stack" role="status" aria-live="polite">
      {messages.map((message) => (
        <p className={`ds-toast is-${message.type || "info"}`} key={message.text}>
          {message.text}
        </p>
      ))}
    </div>
  );
}

export function DSSkeleton({ lines = 3 }) {
  return (
    <div className="ds-skeleton" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
