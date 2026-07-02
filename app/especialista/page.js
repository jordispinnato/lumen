import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { hasGoogleCalendarConfig } from "../../lib/googleCalendar";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";

function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  return value?.slice(0, 5) || "Sin hora";
}

function initialsFromName(value) {
  return String(value || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function statusLabel(status) {
  const labels = {
    confirmed: "Confirmado",
    cancelled: "Cancelado",
    completed: "Realizado",
  };

  return labels[status] || status || "Sin estado";
}

function statusTone(status) {
  const tones = {
    confirmed: "is-confirmed",
    cancelled: "is-cancelled",
    completed: "is-completed",
  };

  return tones[status] || "is-pending";
}

export default async function SpecialistPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/especialista");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,role")
    .eq("id", userData.user.id)
    .maybeSingle();

  const dataSupabase = createSupabaseAdminClient() || supabase;

  const { data: specialist } = await dataSupabase
    .from("appointment_specialists")
    .select(`
      id,
      user_id,
      name,
      role,
      professional_license,
      professional_email,
      focus,
      short_bio,
      duration_minutes,
      session,
      price,
      status,
      slug,
      photo_url
    `)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "specialist" && profile?.role !== "admin" && !specialist) {
    return (
      <main className="section">
        <div className="form-card">
          <p className="eyebrow">Panel de especialista</p>
          <h1>Acceso restringido</h1>
          <p className="muted">Tu usuario todavia no esta vinculado a un perfil de especialista.</p>
        </div>
      </main>
    );
  }

  const { data: calendarConnection } = specialist
    ? await dataSupabase
        .from("specialist_calendar_connections")
        .select("google_calendar_email,google_calendar_connected_at,calendar_sync_enabled")
        .eq("specialist_id", specialist.id)
        .maybeSingle()
    : { data: null };

  const bookingsResult = specialist
    ? await dataSupabase
        .from("appointment_bookings")
        .select(`
          id,
          user_id,
          patient_email,
          patient_name,
          status,
          created_at,
          appointment_slots:slot_id (
            slot_date,
            slot_time
          )
        `)
        .eq("specialist_id", specialist.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const bookings = bookingsResult.data || [];
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings
    .filter((booking) => booking.appointment_slots?.slot_date === today && booking.status !== "cancelled")
    .sort((a, b) => String(a.appointment_slots?.slot_time || "").localeCompare(String(b.appointment_slots?.slot_time || "")));
  const upcomingBookings = bookings
    .filter((booking) => booking.appointment_slots?.slot_date >= today && booking.status !== "cancelled")
    .sort((a, b) => {
      const aValue = `${a.appointment_slots?.slot_date || ""} ${a.appointment_slots?.slot_time || ""}`;
      const bValue = `${b.appointment_slots?.slot_date || ""} ${b.appointment_slots?.slot_time || ""}`;
      return aValue.localeCompare(bValue);
    });
  const pastBookings = bookings.filter((booking) => booking.appointment_slots?.slot_date < today || booking.status === "cancelled");
  const recentBookings = bookings.slice(0, 5);
  const nextBooking = upcomingBookings[0];
  const displayName = specialist?.name || profile?.full_name || userData.user.email;
  const isCalendarConfigured = hasGoogleCalendarConfig();
  const navItems = [
    { href: "#inicio", label: "Inicio", icon: "I" },
    { href: "#turnos", label: "Mis turnos", icon: "T" },
    { href: "#calendario", label: "Google Calendar", icon: "G" },
    { href: "#perfil", label: "Perfil", icon: "P" },
  ];

  return (
    <AccountDashboardShell navItems={navItems} displayName={displayName} avatarInitials={initialsFromName(displayName)} isAdmin={profile?.role === "admin"}>
      <div className="account-dashboard specialist-dashboard" id="inicio">
        {params?.message ? <p className="notice success">{params.message}</p> : null}
        {params?.error ? <p className="notice">{params.error}</p> : null}

        <section className="account-hero specialist-hero">
          <div>
            <p className="account-page-kicker">Panel de especialista</p>
            <h1>Hola, {specialist?.name || profile?.full_name || "especialista"}</h1>
            <p>Desde aca podes revisar tus reservas, datos del paciente y conexion con Google Calendar.</p>
          </div>
          {specialist?.slug ? <a className="account-primary-action" href={`/profesionales/${specialist.slug}`}>Ver perfil publico</a> : null}
        </section>

        {!specialist ? (
          <section className="account-panel">
            <div className="account-empty-state">
              <span className="account-empty-icon">P</span>
              <h3>Todavia no tenes un perfil profesional vinculado</h3>
              <p>Un administrador tiene que asignar tu usuario a un especialista desde el panel admin.</p>
            </div>
          </section>
        ) : (
          <>
            <section className="account-stats-grid">
              <article className="account-stat-card">
                <span className="account-icon is-orange">H</span>
                <div>
                  <span>Turnos de hoy</span>
                  <strong>{todayBookings.length}</strong>
                  <small>{todayBookings.length ? "Agenda activa para hoy" : "Sin reservas hoy"}</small>
                </div>
              </article>
              <article className="account-stat-card">
                <span className="account-icon is-blue">T</span>
                <div>
                  <span>Proximo turno</span>
                  <strong>{nextBooking ? formatDate(nextBooking.appointment_slots?.slot_date) : "Sin turnos"}</strong>
                  <small>{nextBooking ? `${formatTime(nextBooking.appointment_slots?.slot_time)} hs` : "No hay reservas proximas"}</small>
                </div>
              </article>
              <article className="account-stat-card">
                <span className="account-icon is-green">A</span>
                <div>
                  <span>Turnos activos</span>
                  <strong>{upcomingBookings.length}</strong>
                  <small>Reservas proximas</small>
                </div>
              </article>
              <article className="account-stat-card">
                <span className="account-icon is-purple">C</span>
                <div>
                  <span>Calendar</span>
                  <strong>{calendarConnection?.google_calendar_connected_at ? "Conectado" : "Sin conectar"}</strong>
                  <small>{isCalendarConfigured ? calendarConnection?.google_calendar_email || "Pendiente de autorizacion" : "Faltan variables de Google"}</small>
                </div>
              </article>
            </section>

            <section className="account-panel specialist-today-panel">
              <div className="account-panel-head">
                <div>
                  <span className="account-icon is-orange">H</span>
                  <h2>Agenda de hoy</h2>
                </div>
              </div>
              {todayBookings.length ? (
                <div className="specialist-booking-grid">
                  {todayBookings.map((booking) => (
                    <article className="specialist-booking-card is-today" key={booking.id}>
                      <div className="specialist-booking-time">
                        <strong>{formatTime(booking.appointment_slots?.slot_time)}</strong>
                        <span>hs</span>
                      </div>
                      <div className="specialist-booking-main">
                        <strong>{booking.patient_name || "Paciente sin nombre"}</strong>
                        <a href={`mailto:${booking.patient_email}`}>{booking.patient_email}</a>
                        <small>Reservado {formatDateTime(booking.created_at)}</small>
                      </div>
                      <span className={`specialist-status ${statusTone(booking.status)}`}>{statusLabel(booking.status)}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="account-empty-state">
                  <span className="account-empty-icon">H</span>
                  <h3>No tenes turnos para hoy</h3>
                  <p>Cuando haya reservas para la fecha actual, las vas a ver destacadas aca.</p>
                </div>
              )}
            </section>

            <section className="account-lower-grid" id="turnos">
              <div className="account-panel">
                <div className="account-panel-head">
                  <div>
                    <span className="account-icon is-blue">T</span>
                    <h2>Proximos turnos</h2>
                  </div>
                </div>
                {upcomingBookings.length ? (
                  <div className="account-appointment-list">
                    {upcomingBookings.map((booking) => (
                      <article className="account-appointment-card" key={booking.id}>
                        <span className="account-avatar small">{initialsFromName(booking.patient_name || booking.patient_email)}</span>
                        <div>
                          <strong>{booking.patient_name || "Paciente sin nombre"}</strong>
                          <a href={`mailto:${booking.patient_email}`}>{booking.patient_email}</a>
                          <small>Reservado {formatDateTime(booking.created_at)}</small>
                        </div>
                        <div>
                          <strong>{formatDate(booking.appointment_slots?.slot_date)}</strong>
                          <span>{formatTime(booking.appointment_slots?.slot_time)} hs</span>
                          <small className={`specialist-status ${statusTone(booking.status)}`}>{statusLabel(booking.status)}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="account-empty-state">
                    <span className="account-empty-icon">T</span>
                    <h3>No tenes turnos proximos</h3>
                    <p>Cuando una persona reserve con vos, el turno aparecera aca.</p>
                  </div>
                )}
              </div>

              <div className="account-panel" id="calendario">
                <div className="account-panel-head">
                  <div>
                    <span className="account-icon is-green">G</span>
                    <h2>Google Calendar</h2>
                  </div>
                </div>
                <div className="specialist-calendar-card">
                  <strong>
                    {!isCalendarConfigured
                      ? "Google Calendar pendiente de configurar"
                      : calendarConnection?.google_calendar_connected_at
                        ? "Calendario conectado"
                        : "Conectar calendario"}
                  </strong>
                  <p>
                    {!isCalendarConfigured
                      ? "Faltan las variables GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en Vercel para habilitar la conexion."
                      : calendarConnection?.google_calendar_connected_at
                      ? `Los nuevos turnos se intentaran cargar en ${calendarConnection.google_calendar_email || "tu calendario principal"}.`
                      : "Conecta tu cuenta de Google para que LUMEN cree eventos automaticamente cuando recibas reservas."}
                  </p>
                  {!isCalendarConfigured ? (
                    <span className="account-secondary-action">Esperando configuracion</span>
                  ) : calendarConnection?.google_calendar_connected_at ? (
                    <form action="/especialista/google/disconnect" method="post">
                      <button className="account-secondary-action" type="submit">Desconectar Google Calendar</button>
                    </form>
                  ) : (
                    <a className="account-primary-action" href="/especialista/google/connect">Conectar Google Calendar</a>
                  )}
                </div>
                <div className="specialist-recent-list">
                  <h3>Ultimas reservas recibidas</h3>
                  {recentBookings.length ? recentBookings.map((booking) => (
                    <article key={booking.id}>
                      <span className={`specialist-status ${statusTone(booking.status)}`}>{statusLabel(booking.status)}</span>
                      <strong>{booking.patient_name || booking.patient_email || "Paciente"}</strong>
                      <small>
                        {formatDate(booking.appointment_slots?.slot_date)} - {formatTime(booking.appointment_slots?.slot_time)} hs
                      </small>
                    </article>
                  )) : (
                    <p className="muted">Todavia no recibiste reservas.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="account-lower-grid">
              <div className="account-panel">
                <div className="account-panel-head">
                  <div>
                    <span className="account-icon is-orange">H</span>
                    <h2>Historial</h2>
                  </div>
                </div>
                {pastBookings.length ? (
                  <div className="account-history-list">
                    {pastBookings.map((booking) => (
                      <article key={booking.id}>
                        <span>{statusLabel(booking.status)}</span>
                        <strong>{booking.patient_name || booking.patient_email || "Paciente"}</strong>
                        <small>
                          {formatDate(booking.appointment_slots?.slot_date)} - {formatTime(booking.appointment_slots?.slot_time)} hs - reservado {formatDateTime(booking.created_at)}
                        </small>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="account-empty-state">
                    <span className="account-empty-icon">H</span>
                    <h3>Todavia no hay historial</h3>
                    <p>Los turnos pasados o cancelados van a quedar listados aca.</p>
                  </div>
                )}
              </div>

              <div className="account-panel profile-panel" id="perfil">
                <div className="account-panel-head">
                  <div>
                    <span className="account-icon is-purple">P</span>
                    <h2>Perfil profesional</h2>
                  </div>
                </div>
                <dl className="account-profile-grid">
                  <div>
                    <span>Nombre</span>
                    <strong>{specialist.name}</strong>
                  </div>
                  <div>
                    <span>Profesion</span>
                    <strong>{specialist.role || "Sin cargar"}</strong>
                  </div>
                  <div>
                    <span>Matricula</span>
                    <strong>{specialist.professional_license || "Sin cargar"}</strong>
                  </div>
                  <div>
                    <span>Email profesional</span>
                    <strong>{specialist.professional_email || profile?.email || "Sin cargar"}</strong>
                  </div>
                </dl>
              </div>
            </section>
          </>
        )}
      </div>
    </AccountDashboardShell>
  );
}
