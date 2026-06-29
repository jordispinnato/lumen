"use client";

import { StatusBadge } from "./EntityTable";

export default function EntityDetails({ title, eyebrow, items = [], actions }) {
  return (
    <section className="panel cms-entity-details">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <div className="cms-entity-details-head">
        <h2>{title}</h2>
        {actions ? <div className="inline-actions">{actions}</div> : null}
      </div>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.type === "status" ? <StatusBadge value={item.value} /> : item.value || "-"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
