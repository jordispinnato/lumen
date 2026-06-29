export function EntityForm({ title, description, action, encType, children, submitLabel = "Guardar" }) {
  return (
    <section className="panel cms-entity-form-card">
      <div className="cms-entity-form-head">
        <h2>{title}</h2>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      <form className="admin-form cms-entity-form" action={action} method="post" encType={encType}>
        {children}
        <button className="button" type="submit">{submitLabel}</button>
      </form>
    </section>
  );
}

export function EntityFormSection({ title, description, children }) {
  return (
    <fieldset className="cms-form-section">
      <legend>{title}</legend>
      {description ? <p className="muted">{description}</p> : null}
      <div>{children}</div>
    </fieldset>
  );
}
