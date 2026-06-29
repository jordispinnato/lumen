import BookingPicker from "./BookingPicker";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export const metadata = {
  title: "Reservar turno | LUMEN",
  description: "Reserva de turnos para atencion psicologica online.",
};

export default async function TurnosPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
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

  return (
    <main className="section">
      <div className="dashboard-shell">
        <div className="section-head">
          <p className="eyebrow">Reservar turno</p>
          <h1>Atencion psicologica online.</h1>
          <p className="lead">
            Elegi una especialista, revisa los dias y horarios disponibles y deja preparada la reserva de tu consulta.
          </p>
          {params?.error ? <p className="notice error">{params.error}</p> : null}
        </div>

        {params?.success ? (
          <section className="panel booking-success">
            <p className="eyebrow">Reserva exitosa</p>
            <h2>Tu turno fue reservado correctamente.</h2>
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
              <a className="button" href="/mi-cuenta">Ir a Mi Cuenta</a>
              <a className="button secondary" href="/turnos">Reservar otro turno</a>
            </div>
          </section>
        ) : null}

        <BookingPicker
          initialSpecialistSlug={params?.especialista || ""}
          specialists={specialists || []}
          slots={slots || []}
          userEmail={userData.user?.email || ""}
        />
      </div>
    </main>
  );
}
