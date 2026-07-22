import BookingPicker from "./BookingPicker";
import Link from "next/link";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export const metadata = {
  title: "Consultas profesionales | LUMEN",
  description: "Consultas profesionales online con especialistas de LUMEN.",
};

export default async function TurnosPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: specialists }, { data: slots }] = await Promise.all([
    supabase
      .from("appointment_specialists")
      .select("id,name,role,professional_license,focus,short_bio,education,years_experience,duration_minutes,session,price,status,display_order,slug,photo_url")
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("appointment_slots")
      .select("id,specialist_id,slot_date,slot_time,status")
      .eq("status", "available")
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true }),
  ]);
  const rescheduleId = typeof params?.reprogramar === "string" ? params.reprogramar : "";
  const { data: rescheduleBooking } = userData.user && rescheduleId
    ? await supabase
        .from("appointment_bookings")
        .select(`
          id,
          status,
          specialist_id,
          appointment_specialists:specialist_id (
            name
          ),
          appointment_slots:slot_id (
            slot_date,
            slot_time
          )
        `)
        .eq("id", rescheduleId)
        .eq("user_id", userData.user.id)
        .maybeSingle()
    : { data: null };
  const canReschedule = Boolean(
    rescheduleBooking &&
    rescheduleBooking.status !== "cancelled" &&
    rescheduleBooking.appointment_slots?.slot_date >= today
  );

  return (
    <main className="section">
      <div className="dashboard-shell">
        <div className="section-head">
          <p className="eyebrow">Consultas profesionales</p>
          <h1>Elegi una especialista y reserva tu consulta online.</h1>
          <p className="lead">
            Conoce el enfoque de cada profesional, revisa los dias y horarios disponibles y deja preparada tu reserva.
          </p>
          {params?.error ? <p className="notice error">{params.error}</p> : null}
          {params?.message ? <p className="notice success">{params.message}</p> : null}
        </div>

        {rescheduleId && !canReschedule ? (
          <section className="panel booking-success">
            <p className="eyebrow">Reprogramar consulta</p>
            <h2>No se puede reprogramar esta consulta</h2>
            <p className="muted">La reserva no existe, no pertenece a tu cuenta, ya fue cancelada o corresponde a una fecha pasada.</p>
            <Link className="button secondary" href="/mis-turnos">Volver a Mi Espacio</Link>
          </section>
        ) : null}

        {canReschedule ? (
          <section className="panel booking-reschedule-banner">
            <p className="eyebrow">Reprogramar consulta</p>
            <h2>Elegi el nuevo dia y horario</h2>
            <p className="muted">
              Vas a cambiar tu consulta con {rescheduleBooking.appointment_specialists?.name || "la especialista"} del{" "}
              {new Date(`${rescheduleBooking.appointment_slots?.slot_date}T00:00:00`).toLocaleDateString("es-AR")} a las{" "}
              {String(rescheduleBooking.appointment_slots?.slot_time || "").slice(0, 5)} hs.
            </p>
          </section>
        ) : null}

        {params?.success ? (
          <section className="panel booking-success">
            <p className="eyebrow">Reserva exitosa</p>
            <h2>Tu consulta fue reservada correctamente.</h2>
            {params?.message ? <p className="muted">{params.message}</p> : null}
            <dl>
              {params?.specialist ? (
                <div>
                  <dt>Especialista</dt>
                  <dd>{params.specialist}</dd>
                </div>
              ) : null}
              {params?.date ? (
                <div>
                  <dt>Fecha</dt>
                  <dd>{new Date(`${params.date}T00:00:00`).toLocaleDateString("es-AR")}</dd>
                </div>
              ) : null}
              {params?.time ? (
                <div>
                  <dt>Hora</dt>
                  <dd>{String(params.time).slice(0, 5)}</dd>
                </div>
              ) : null}
              <div>
                <dt>Modalidad</dt>
                <dd>Online</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>Confirmado</dd>
              </div>
            </dl>
            <div className="actions">
              <Link className="button" href="/mi-cuenta">Ir a Mi Espacio</Link>
              <Link className="button secondary" href="/turnos">Reservar otra consulta</Link>
            </div>
          </section>
        ) : null}

        <BookingPicker
          initialSpecialistSlug={params?.especialista || ""}
          initialSpecialistId={canReschedule ? rescheduleBooking.specialist_id : ""}
          initialDate={typeof params?.fecha === "string" ? params.fecha : ""}
          initialSlotId={typeof params?.slot === "string" ? params.slot : ""}
          autoReview={params?.revisar === "1"}
          mode={canReschedule ? "reschedule" : "book"}
          rescheduleBookingId={canReschedule ? rescheduleBooking.id : ""}
          specialists={specialists || []}
          slots={slots || []}
          userEmail={userData.user?.email || ""}
        />
      </div>
    </main>
  );
}
