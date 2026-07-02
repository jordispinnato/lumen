"use client";

import { useMemo, useState } from "react";

function pad(value) {
  return String(value).padStart(2, "0");
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index,
  label: new Date(2026, index, 1).toLocaleDateString("es-AR", { month: "long" }),
}));

function buildMonth(year, monthIndex) {
  const today = new Date();
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const firstVisibleDay = new Date(monthStart);
  const days = [];

  while (firstVisibleDay.getDay() === 0 && firstVisibleDay <= monthEnd) {
    firstVisibleDay.setDate(firstVisibleDay.getDate() + 1);
  }

  const leadingBlanks = firstVisibleDay.getDay() === 0 ? 0 : firstVisibleDay.getDay() - 1;

  for (let date = new Date(monthStart); date <= monthEnd; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 0) {
      continue;
    }

    days.push({
      iso: toISODate(date),
      dayNumber: date.getDate(),
      weekday: date.toLocaleDateString("es-AR", { weekday: "short" }),
      isPast: toISODate(date) < toISODate(today),
    });
  }

  return {
    label: monthStart.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
    leadingBlanks,
    days,
  };
}

function getDateParts(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
}

function formatTime(value) {
  return value?.slice(0, 5) || "";
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function slotLabel(count) {
  if (!count) {
    return "Sin turnos";
  }

  return count === 1 ? "1 turno" : `${count} turnos`;
}

function formatShortDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

function isSunday(dateValue) {
  return new Date(`${dateValue}T00:00:00`).getDay() === 0;
}

function getInitialSpecialistId(specialists, initialSpecialistSlug) {
  const matchedSpecialist = specialists.find((specialist) => specialist.slug === initialSpecialistSlug);
  return matchedSpecialist?.id || specialists[0]?.id;
}

export default function BookingPicker({ specialists, slots, userEmail, initialSpecialistSlug }) {
  const currentDate = new Date();
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(
    getInitialSpecialistId(specialists, initialSpecialistSlug)
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMonth = useMemo(() => buildMonth(selectedYear, selectedMonthIndex), [selectedMonthIndex, selectedYear]);
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const slotYears = slots.map((slot) => Number(slot.slot_date?.slice(0, 4))).filter(Boolean);

    return [...new Set([currentYear, currentYear + 1, currentYear + 2, selectedYear, ...slotYears])]
      .sort((a, b) => a - b);
  }, [selectedYear, slots]);

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
  const nextAvailableDates = useMemo(() => {
    const todayIso = toISODate(new Date());

    return Object.entries(slotsByDate)
      .filter(([date, dateSlots]) => date >= todayIso && !isSunday(date) && dateSlots.length > 0)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .slice(0, 6)
      .map(([date, dateSlots]) => ({ date, count: dateSlots.length }));
  }, [slotsByDate]);

  function selectSpecialist(id) {
    setSelectedSpecialistId(id);
    setSelectedDate("");
    setSelectedSlotId("");
    setIsReviewing(false);
  }

  function selectDay(day) {
    setSelectedDate(day.iso);
    setSelectedSlotId("");
    setIsReviewing(false);
  }

  function selectDateValue(dateValue) {
    const dateParts = getDateParts(dateValue);

    setSelectedYear(dateParts.year);
    setSelectedMonthIndex(dateParts.monthIndex);
    setSelectedDate(dateValue);
    setSelectedSlotId("");
    setIsReviewing(false);
  }

  if (!specialists.length) {
    return (
      <section className="panel">
        <h2>Todavía no hay especialistas disponibles</h2>
        <p className="muted">
          Cuando el equipo cargue especialistas y horarios desde el panel admin, vas a poder reservar desde acá.
        </p>
      </section>
    );
  }

  return (
    <div className="booking-layout">
      <section className="panel booking-panel">
        <p className="eyebrow">1. Elegí especialista</p>
        <div className="professional-card-list">
          {specialists.map((specialist) => (
            <article
              className={`professional-option ${specialist.id === selectedSpecialistId ? "is-active" : ""}`}
              key={specialist.id}
            >
              {specialist.photo_url ? (
                <img alt="" src={specialist.photo_url} />
              ) : (
                <span className="professional-avatar" aria-hidden="true">{specialist.name?.slice(0, 1) || "L"}</span>
              )}
              <span className="professional-option-body">
                <strong>{specialist.name}</strong>
                <span>{specialist.role}</span>
                {specialist.professional_license ? <small>{specialist.professional_license}</small> : null}
                {specialist.focus ? <small>{specialist.focus}</small> : null}
                <span className="professional-meta">
                  <small>{specialist.duration_minutes ? `${specialist.duration_minutes} min` : specialist.session}</small>
                  <small>{formatPrice(specialist.price)}</small>
                  <small>{specialist.status === "active" ? "Activo" : "Inactivo"}</small>
                </span>
                {specialist.short_bio ? <small>{specialist.short_bio}</small> : null}
                <span className="professional-actions">
                  <button type="button" onClick={() => selectSpecialist(specialist.id)}>
                    {specialist.id === selectedSpecialistId ? "Seleccionado" : "Ver disponibilidad"}
                  </button>
                  {specialist.slug ? <a href={`/profesionales/${specialist.slug}`}>Ver perfil</a> : null}
                </span>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel booking-panel">
        <p className="eyebrow">2. Elegí un día</p>
        <div className="calendar-selectors">
          <label>
            Mes
            <select
              value={selectedMonthIndex}
              onChange={(event) => {
                setSelectedMonthIndex(Number(event.target.value));
                setSelectedDate("");
                setSelectedSlotId("");
                setIsReviewing(false);
              }}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Año
            <select
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(Number(event.target.value));
                setSelectedDate("");
                setSelectedSlotId("");
                setIsReviewing(false);
              }}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
        {nextAvailableDates.length ? (
          <div className="next-available-dates" aria-label="Próximas fechas disponibles">
            <span>Próximos disponibles</span>
            <div>
              {nextAvailableDates.map((item) => (
                <button
                  className={item.date === selectedDate ? "is-active" : ""}
                  key={item.date}
                  type="button"
                  onClick={() => selectDateValue(item.date)}
                >
                  {formatShortDate(item.date)}
                  <small>{slotLabel(item.count)}</small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="muted">Todavía no hay fechas disponibles para esta especialista.</p>
        )}
        <div className="calendar-weekdays" aria-hidden="true">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid" aria-label="Calendario de turnos disponibles">
          {Array.from({ length: selectedMonth.leadingBlanks }).map((_, index) => (
            <span className="calendar-empty" key={`empty-${index}`} />
          ))}
          {selectedMonth.days.map((day) => {
            const daySlots = slotsByDate[day.iso] || [];
            const isSelectable = !day.isPast && daySlots.length > 0;

            return (
              <button
                className={`calendar-day ${day.iso === selectedDate ? "is-active" : ""} ${daySlots.length ? "has-slots" : ""}`}
                disabled={!isSelectable}
                key={day.iso}
                type="button"
                onClick={() => selectDay(day)}
              >
                <span>{day.weekday}</span>
                <strong>{day.dayNumber}</strong>
                <small>{slotLabel(daySlots.length)}</small>
              </button>
            );
          })}
        </div>

        <p className="eyebrow">3. Elegí un horario</p>
        {selectedDate ? (
          selectedDateSlots.length ? (
            <div className="slot-grid" aria-label="Horarios disponibles">
              {selectedDateSlots.map((slot) => (
                <button
                  className={`slot-option ${slot.id === selectedSlotId ? "is-active" : ""}`}
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    setIsReviewing(false);
                  }}
                >
                  {formatTime(slot.slot_time)}
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">No hay horarios disponibles para este día.</p>
          )
        ) : (
          <p className="muted">Elegí un día para continuar.</p>
        )}
      </section>

      <aside className="panel booking-summary">
        <p className="eyebrow">Resumen</p>
        <h2>Reserva de atención psicológica</h2>
        <div className="selected-professional">
          {selectedSpecialist.photo_url ? (
            <img alt="" src={selectedSpecialist.photo_url} />
          ) : (
            <span className="professional-avatar" aria-hidden="true">{selectedSpecialist.name?.slice(0, 1) || "L"}</span>
          )}
          <div>
            <strong>{selectedSpecialist.name}</strong>
            <span>{selectedSpecialist.role}</span>
            {selectedSpecialist.professional_license ? <small>{selectedSpecialist.professional_license}</small> : null}
          </div>
        </div>
        <dl>
          <div>
            <dt>Especialista</dt>
            <dd>{selectedSpecialist.name}</dd>
          </div>
          <div>
            <dt>Modalidad</dt>
            <dd>Online</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("es-AR") : "Sin seleccionar"}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>{selectedSlot ? formatTime(selectedSlot.slot_time) : "Sin seleccionar"}</dd>
          </div>
          <div>
            <dt>Duración</dt>
            <dd>{selectedSpecialist.duration_minutes ? `${selectedSpecialist.duration_minutes} minutos` : selectedSpecialist.session}</dd>
          </div>
        </dl>
        <p className="price">{formatPrice(selectedSpecialist.price)}</p>
        {userEmail ? (
          isReviewing ? (
            <form className="booking-confirm-form" action="/turnos/reservar" method="post" onSubmit={() => setIsSubmitting(true)}>
              <input name="slotId" type="hidden" value={selectedSlot?.id || ""} />
              <label>
                Nombre del paciente
                <input name="patientName" placeholder="Nombre y apellido" />
              </label>
              <label>
                Email de confirmación
                <input readOnly value={userEmail} />
              </label>
              <div className="booking-review-box">
                <strong>Confirmación previa</strong>
                <p>La reserva quedará registrada en tu cuenta.</p>
                <p>El pago todavía no está integrado en esta versión.</p>
              </div>
              <label className="booking-consent">
                <input name="privacyConsent" type="checkbox" value="accepted" required />
                <span>
                  Acepto la <a href="/politica-privacidad" target="_blank">Politica de privacidad</a> y los{" "}
                  <a href="/terminos-condiciones" target="_blank">Terminos y condiciones</a> de LUMEN.
                </span>
              </label>
              <div className="booking-form-actions">
                <button className="button" disabled={!selectedSlot || isSubmitting} type="submit">
                  {isSubmitting ? "Reservando..." : "Confirmar reserva"}
                </button>
                <button className="button secondary" type="button" onClick={() => setIsReviewing(false)}>Volver</button>
              </div>
            </form>
          ) : (
            <div className="booking-confirm-form">
              <button className="button" disabled={!selectedSlot} type="button" onClick={() => setIsReviewing(true)}>
                Revisar reserva
              </button>
              <p className="muted">
                {selectedSlot ? "Revisá los datos antes de confirmar." : "Elegí un día y horario para continuar."}
              </p>
            </div>
          )
        ) : (
          <div className="booking-login-box">
            <p className="muted">Para confirmar la reserva necesitás iniciar sesión.</p>
            <a className="button" href="/login?next=/turnos">Ingresar</a>
          </div>
        )}
        <p className="muted">El pago se conectará en una etapa posterior.</p>
      </aside>
    </div>
  );
}
