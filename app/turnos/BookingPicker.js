"use client";

import { useMemo, useState } from "react";

function pad(value) {
  return String(value).padStart(2, "0");
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildMonth(offset) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
  const days = [];

  for (let date = new Date(monthStart); date <= monthEnd; date.setDate(date.getDate() + 1)) {
    days.push({
      iso: toISODate(date),
      dayNumber: date.getDate(),
      weekday: date.toLocaleDateString("es-AR", { weekday: "short" }),
      isPast: toISODate(date) < toISODate(today),
    });
  }

  return {
    label: monthStart.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
    days,
  };
}

function formatTime(value) {
  return value?.slice(0, 5) || "";
}

export default function BookingPicker({ specialists, slots }) {
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(specialists[0]?.id);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const months = useMemo(() => [buildMonth(0), buildMonth(1)], []);

  const selectedSpecialist = useMemo(
    () => specialists.find((specialist) => specialist.id === selectedSpecialistId) || specialists[0],
    [selectedSpecialistId, specialists]
  );

  const specialistSlots = useMemo(
    () => slots.filter((slot) => slot.specialist_id === selectedSpecialistId),
    [selectedSpecialistId, slots]
  );

  const slotsByDate = useMemo(() => {
    return specialistSlots.reduce((acc, slot) => {
      acc[slot.slot_date] = acc[slot.slot_date] || [];
      acc[slot.slot_date].push(slot);
      return acc;
    }, {});
  }, [specialistSlots]);

  const selectedDateSlots = selectedDate ? slotsByDate[selectedDate] || [] : [];
  const selectedSlot = selectedDateSlots.find((slot) => slot.id === selectedSlotId);

  function selectSpecialist(id) {
    setSelectedSpecialistId(id);
    setSelectedDate("");
    setSelectedSlotId("");
  }

  function selectDay(day) {
    setSelectedDate(day.iso);
    setSelectedSlotId("");
  }

  if (!specialists.length) {
    return (
      <section className="panel">
        <h2>Todavia no hay especialistas disponibles</h2>
        <p className="muted">
          Cuando el equipo cargue especialistas y horarios desde el panel admin, vas a poder reservar desde aca.
        </p>
      </section>
    );
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
              onClick={() => selectSpecialist(specialist.id)}
            >
              <strong>{specialist.name}</strong>
              <span>{specialist.role}</span>
              <small>{specialist.focus}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel booking-panel">
        <p className="eyebrow">2. Elegi un dia</p>
        <div className="month-tabs">
          {months.map((month, index) => (
            <button
              className={`month-tab ${index === selectedMonthIndex ? "is-active" : ""}`}
              key={month.label}
              type="button"
              onClick={() => {
                setSelectedMonthIndex(index);
                setSelectedDate("");
                setSelectedSlotId("");
              }}
            >
              {month.label}
            </button>
          ))}
        </div>
        <div className="calendar-grid" aria-label="Calendario de turnos disponibles">
          {months[selectedMonthIndex].days.map((day) => {
            const daySlots = slotsByDate[day.iso] || [];
            const isSelectable = !day.isPast && daySlots.length > 0;

            return (
              <button
                className={`calendar-day ${day.iso === selectedDate ? "is-active" : ""}`}
                disabled={!isSelectable}
                key={day.iso}
                type="button"
                onClick={() => selectDay(day)}
              >
                <span>{day.weekday}</span>
                <strong>{day.dayNumber}</strong>
                {daySlots.length ? <small>{daySlots.length} horarios</small> : <small>Sin turnos</small>}
              </button>
            );
          })}
        </div>

        <p className="eyebrow">3. Elegi un horario</p>
        {selectedDate ? (
          selectedDateSlots.length ? (
            <div className="slot-grid" aria-label="Horarios disponibles">
              {selectedDateSlots.map((slot) => (
                <button
                  className={`slot-option ${slot.id === selectedSlotId ? "is-active" : ""}`}
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.id)}
                >
                  {formatTime(slot.slot_time)}
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">Ese dia no tiene horarios disponibles.</p>
          )
        ) : (
          <p className="muted">Primero selecciona un dia con horarios disponibles.</p>
        )}
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
            <dd>{selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("es-AR") : "Sin seleccionar"}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>{selectedSlot ? formatTime(selectedSlot.slot_time) : "Sin seleccionar"}</dd>
          </div>
        </dl>
        <p className="price">$ {selectedSpecialist.price.toLocaleString("es-AR")}</p>
        <button className="button" disabled={!selectedSlot} type="button">Continuar al pago</button>
        <p className="muted">
          En la siguiente etapa conectamos este boton con pago y confirmacion automatica del turno.
        </p>
      </aside>
    </div>
  );
}
