"use client";

import { useMemo, useState } from "react";

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function compareValues(a, b, direction) {
  const aValue = normalize(a);
  const bValue = normalize(b);
  const result = aValue.localeCompare(bValue, "es");
  return direction === "desc" ? -result : result;
}

export function StatusBadge({ value }) {
  const normalized = normalize(value).replace(/\s+/g, "-") || "neutral";

  return <span className={`cms-status-badge is-${normalized}`}>{value || "Sin estado"}</span>;
}

export function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <label className="cms-search-bar">
      <span>Busqueda</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="search" />
    </label>
  );
}

export function FilterBar({ filters, values, onChange }) {
  if (!filters?.length) {
    return null;
  }

  return (
    <div className="cms-filter-bar">
      {filters.map((filter) => (
        <label key={filter.key}>
          <span>{filter.label}</span>
          <select value={values[filter.key] || ""} onChange={(event) => onChange(filter.key, event.target.value)}>
            <option value="">Todos</option>
            {(filter.options || []).map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

export function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="cms-pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span>
        Pagina {page} de {pageCount}
      </span>
      <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Siguiente
      </button>
    </div>
  );
}

export function EmptyState({ title = "Todavia no hay registros.", text, actionHref, actionLabel }) {
  return (
    <div className="cms-state cms-empty-state">
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {actionHref && actionLabel ? <a className="secondary-button" href={actionHref}>{actionLabel}</a> : null}
    </div>
  );
}

export function LoadingState({ text = "Cargando informacion..." }) {
  return <div className="cms-state">{text}</div>;
}

export function ErrorState({ text = "No se pudo cargar la informacion." }) {
  return <div className="cms-state cms-error-state">{text}</div>;
}

export function ToastStack({ messages = [] }) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="cms-toast-stack" role="status" aria-live="polite">
      {messages.map((message) => (
        <p className={`cms-toast is-${message.type || "info"}`} key={message.text}>
          {message.text}
        </p>
      ))}
    </div>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel = "Confirmar", onConfirm, onCancel }) {
  if (!open) {
    return null;
  }

  return (
    <div className="cms-confirm-backdrop" role="presentation">
      <section className="cms-confirm-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        <p>{text}</p>
        <div>
          <button className="button" type="button" onClick={onConfirm}>{confirmLabel}</button>
          <button className="secondary-button" type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </section>
    </div>
  );
}

export function ActionToolbar({ selectedCount, children }) {
  return (
    <div className="cms-action-toolbar">
      <span>{selectedCount ? `${selectedCount} seleccionados` : "Seleccion multiple preparada"}</span>
      {children}
    </div>
  );
}

export function BulkActions({ selectedCount }) {
  return (
    <div className="cms-bulk-actions">
      <button type="button" disabled={!selectedCount}>Publicar</button>
      <button type="button" disabled={!selectedCount}>Ocultar</button>
      <button type="button" disabled={!selectedCount}>Archivar</button>
      <button type="button" disabled={!selectedCount}>Eliminar</button>
    </div>
  );
}

export default function EntityTable({
  title,
  description,
  columns = [],
  rows = [],
  filters = [],
  emptyTitle,
  emptyText,
  searchPlaceholder,
  pageSize = 8,
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: columns[0]?.key || "", direction: "asc" });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);

  function changeFilter(key, value) {
    setFilterValues((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function toggleSort(key) {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  function toggleSelected(id) {
    setSelectedIds((current) => {
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
  }

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => {
        const searchTarget = columns.map((column) => row[column.key]).join(" ");
        const matchesQuery = !query || normalize(searchTarget).includes(normalize(query));
        const matchesFilters = filters.every((filter) => {
          const value = filterValues[filter.key];
          return !value || String(row[filter.key] ?? "") === value;
        });

        return matchesQuery && matchesFilters;
      })
      .sort((a, b) => compareValues(a[sortConfig.key], b[sortConfig.key], sortConfig.direction));
  }, [columns, filterValues, filters, query, rows, sortConfig]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedIds.includes(row.id));

  function toggleVisibleRows() {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleRows.some((row) => row.id === id)));
    } else {
      setSelectedIds((current) => [...new Set([...current, ...visibleRows.map((row) => row.id)])]);
    }
  }

  return (
    <section className="cms-entity-table">
      <div className="cms-entity-head">
        <div>
          <h2>{title}</h2>
          {description ? <p className="muted">{description}</p> : null}
        </div>
        <ActionToolbar selectedCount={selectedIds.length}>
          <BulkActions selectedCount={selectedIds.length} />
        </ActionToolbar>
      </div>

      <div className="cms-entity-controls">
        <SearchBar value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder={searchPlaceholder} />
        <FilterBar filters={filters} values={filterValues} onChange={changeFilter} />
      </div>

      {visibleRows.length ? (
        <>
          <div className="cms-table-wrap">
            <table className="table cms-table">
              <thead>
                <tr>
                  <th>
                    <input aria-label="Seleccionar visibles" type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleRows} />
                  </th>
                  {columns.map((column) => (
                    <th key={column.key}>
                      <button type="button" onClick={() => toggleSort(column.key)}>
                        {column.header}
                        {sortConfig.key === column.key ? <span>{sortConfig.direction === "asc" ? " asc" : " desc"}</span> : null}
                      </button>
                    </th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input aria-label={`Seleccionar ${row.id}`} type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} />
                    </td>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.type === "status" ? <StatusBadge value={row[column.key]} /> : row[column.key] || "-"}
                      </td>
                    ))}
                    <td>
                      {row.actions?.length ? (
                        <div className="inline-actions">
                          {row.actions.map((action) => (
                            <button
                              key={action.label}
                              type="button"
                              onClick={() => setPendingAction({ ...action, row })}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="muted">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title={emptyTitle} text={emptyText || "No se encontraron resultados con los filtros actuales."} />
      )}

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.confirmTitle || "Confirmar accion"}
        text={pendingAction?.confirmText || `Vas a ejecutar "${pendingAction?.label}" sobre este registro.`}
        confirmLabel={pendingAction?.label || "Confirmar"}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          const action = pendingAction;
          setPendingAction(null);

          if (!action?.endpoint) {
            return;
          }

          const form = document.createElement("form");
          form.method = "post";
          form.action = action.endpoint;
          Object.entries(action.fields || {}).forEach(([name, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        }}
      />
    </section>
  );
}
