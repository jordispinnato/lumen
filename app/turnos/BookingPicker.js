"use client";

import { useMemo, useState } from "react";

export default function BookingPicker({ specialists, days }) {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(specialists[0]?.id);
  const [selectedDay, setSelectedDay] = useState(days[0]?.label);
  const [selectedSlot, setSelectedSlot] = useState(days[0]?.slots[0]);

  const selectedSpecialist = useMemo(
    () => specialists.find((specialist) => specialist.id === selectedSpecialistId) || specialists[0],
    [selectedSpecialistId, specialists]
  );

  const activeDay = useMemo(
    () => days.find((day) => day.label === selectedDay) || days[0],
    [selectedDay, days]
  );

  function selectDay(day) {
    setSelectedDay(day.label);
    setSelectedSlot(day.slots[0]);
  }

  return (
    <div className="booking-layout">
      <section className="panel booking-panel">
        <p className="eyebrow">1. Elegi especialista</p>
        <div className="specialist-list">
          {specialists.map((specialist) => (
            <button
              className={`specialist-option ${specialist.id === selectedSpecialistId ? "is-active" : ""}`}
              key={specialist.id}
              type="button"
              onClick={() => setSelectedSpecialistId(specialist.id)}
            >
              <strong>{specialist.name}</strong>
              <span>{specialist.role}</span>
              <small>{specialist.focus}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel booking-panel">
        <p className="eyebrow">2. Selecciona dia y horario</p>
        <div className="calendar-strip">
          {days.map((day) => (
            <button
              className={`day-option ${day.label === selectedDay ? "is-active" : ""}`}
              key={day.label}
              type="button"
              onClick={() => selectDay(day)}
            >
              <strong>{day.date}</strong>
              <span>{day.slots.length} horarios</span>
            </button>
          ))}
        </div>

        <div className="slot-grid" aria-label={`Horarios disponibles para ${activeDay.label}`}>
          {activeDay.slots.map((slot) => (
            <button
              className={`slot-option ${slot === selectedSlot ? "is-active" : ""}`}
              key={slot}
              type="button"
              onClick={() => setSelectedSlot(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </section>

      <aside className="panel booking-summary">
        <p className="eyebrow">Resumen</p>
        <h2>Reserva de atencion psicologica</h2>
        <dl>
          <div>
            <dt>Especialista</dt>
            <dd>{selectedSpecialist.name}</dd>
          </div>
          <div>
            <dt>Modalidad</dt>
            <dd>{selectedSpecialist.session}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{activeDay.label}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>{selectedSlot}</dd>
          </div>
        </dl>
        <p className="price">$ {selectedSpecialist.price.toLocaleString("es-AR")}</p>
        <button className="button" type="button">Continuar al pago</button>
        <p className="muted">
          En la siguiente etapa conectamos este boton con pago y confirmacion automatica del turno.
        </p>
      </aside>
    </div>
  );
}
