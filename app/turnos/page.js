import BookingPicker from "./BookingPicker";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export const metadata = {
  title: "Reservar turno | LUMEN",
  description: "Reserva de turnos para atencion psicologica online.",
};

export default async function TurnosPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: specialists }, { data: slots }] = await Promise.all([
    supabase
      .from("appointment_specialists")
      .select("id,name,role,focus,session,price,status")
      .eq("status", "active")
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
        </div>

        <BookingPicker specialists={specialists || []} slots={slots || []} />
      </div>
    </main>
  );
}
