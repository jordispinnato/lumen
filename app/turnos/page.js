import BookingPicker from "./BookingPicker";
import { appointmentDays, psychologySpecialists } from "../../lib/appointments";

export const metadata = {
  title: "Reservar turno | LUMEN",
  description: "Reserva de turnos para atencion psicologica online.",
};

export default function TurnosPage() {
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

        <BookingPicker specialists={psychologySpecialists} days={appointmentDays} />
      </div>
    </main>
  );
}
