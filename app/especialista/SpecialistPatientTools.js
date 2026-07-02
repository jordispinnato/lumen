"use client";

import { useEffect, useRef, useState } from "react";

function normalize(value) {
  return String(value || "").toLowerCase();
}

export default function SpecialistPatientTools({ children, total = 0 }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [visibleCount, setVisibleCount] = useState(total);
  const gridRef = useRef(null);

  useEffect(() => {
    const cards = [...(gridRef.current?.querySelectorAll("[data-patient-card]") || [])];
    let nextVisibleCount = 0;

    cards.forEach((card) => {
      const patientText = normalize(card.getAttribute("data-patient-search"));
      const patientStatus = card.getAttribute("data-patient-status") || "without-next";
      const matchesQuery = !query || patientText.includes(normalize(query));
      const matchesStatus = status === "all" || patientStatus === status;
      const isVisible = matchesQuery && matchesStatus;

      card.toggleAttribute("data-patient-hidden", !isVisible);
      if (isVisible) {
        nextVisibleCount += 1;
      }
    });

    setVisibleCount(nextVisibleCount);
  }, [query, status]);

  return (
    <div className="specialist-patient-tools">
      <div className="specialist-patient-toolbar">
        <label>
          <span>Buscar paciente</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre o email"
          />
        </label>
        <label>
          <span>Estado</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Todos</option>
            <option value="with-next">Con proximo turno</option>
            <option value="without-next">Sin proximo turno</option>
          </select>
        </label>
        <strong>{visibleCount}/{total} pacientes</strong>
      </div>
      <div className="specialist-patient-grid" ref={gridRef}>
        {children}
      </div>
      {!visibleCount ? (
        <div className="account-empty-state">
          <span className="account-empty-icon">P</span>
          <h3>No encontramos pacientes con ese filtro</h3>
          <p>Proba buscar por nombre, email o cambiar el estado seleccionado.</p>
        </div>
      ) : null}
    </div>
  );
}
