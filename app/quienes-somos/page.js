import { createSupabaseServerClient } from "../../lib/supabase/server";

export const metadata = {
  title: "Quienes somos | LUMEN",
  description: "Conoce el espacio LUMEN y el equipo profesional.",
};

function getInitials(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export default async function QuienesSomosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: specialists } = await supabase
    .from("appointment_specialists")
    .select("id,name,role,professional_license,focus,short_bio,photo_url,slug,status,display_order")
    .eq("status", "active")
    .order("display_order", { ascending: true });

  return (
    <main className="landing-page">
      <section className="about-hero">
        <p className="eyebrow">LUMEN</p>
        <h1>Quienes somos</h1>
        <p className="lead">
          LUMEN es un espacio interdisciplinario en construccion, pensado para acercar acompanamiento profesional,
          formacion online y recursos terapeuticos de una manera clara, calida y accesible.
        </p>
      </section>

      <section className="landing-section">
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">Nuestro equipo</p>
            <h2>Profesionales que acompanan procesos.</h2>
          </div>
          <a className="secondary-button" href="/turnos">Reservar turno</a>
        </div>

        {specialists?.length ? (
          <div className="landing-card-grid">
            {specialists.map((specialist) => (
              <article className="landing-professional-card" key={specialist.id}>
                {specialist.photo_url ? (
                  <img alt="" src={specialist.photo_url} />
                ) : (
                  <span className="professional-avatar" aria-hidden="true">{getInitials(specialist.name)}</span>
                )}
                <div>
                  <h3>{specialist.name}</h3>
                  <p>{specialist.role || "Profesional LUMEN"}</p>
                  {specialist.professional_license ? <small>{specialist.professional_license}</small> : null}
                </div>
                <p>{specialist.short_bio || specialist.focus || "Perfil profesional preparado para acompanar procesos de bienestar."}</p>
                <a className="secondary-button" href={specialist.slug ? `/profesionales/${specialist.slug}` : "/turnos"}>Ver perfil</a>
              </article>
            ))}
          </div>
        ) : (
          <div className="ds-empty-state">
            <span aria-hidden="true">+</span>
            <h3>El equipo se mostrara proximamente</h3>
            <p>Cuando haya profesionales activos cargados en el sistema, sus perfiles van a aparecer en esta seccion.</p>
          </div>
        )}
      </section>
    </main>
  );
}
