import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { formatPrice } from "../../../lib/courses";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: specialist } = await supabase
    .from("appointment_specialists")
    .select("name,role,short_bio")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!specialist) {
    return {
      title: "Profesional | LUMEN",
    };
  }

  return {
    title: `${specialist.name} | LUMEN`,
    description: specialist.short_bio || specialist.role || "Profesional LUMEN",
  };
}

export default async function ProfessionalPage({ params }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: specialist } = await supabase
    .from("appointment_specialists")
    .select("id,name,role,professional_license,focus,short_bio,education,years_experience,duration_minutes,session,price,status,slug,photo_url")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!specialist) {
    notFound();
  }

  return (
    <main className="section">
      <div className="dashboard-shell">
        <article className="professional-detail">
          <div className="professional-detail-media">
            {specialist.photo_url ? (
              <img alt="" src={specialist.photo_url} />
            ) : (
              <span className="professional-avatar large" aria-hidden="true">{specialist.name?.slice(0, 1) || "L"}</span>
            )}
          </div>

          <div className="professional-detail-body">
            <p className="eyebrow">Profesional LUMEN</p>
            <h1>{specialist.name}</h1>
            <div className="professional-detail-tags">
              {specialist.role ? <span>{specialist.role}</span> : null}
              {specialist.professional_license ? <span>{specialist.professional_license}</span> : null}
              <span>Modalidad online</span>
            </div>

            {specialist.short_bio ? <p className="lead">{specialist.short_bio}</p> : null}

            <div className="professional-info-grid">
              {specialist.focus ? (
                <section className="panel">
                  <p className="eyebrow">Enfoque</p>
                  <p>{specialist.focus}</p>
                </section>
              ) : null}
              {specialist.education ? (
                <section className="panel">
                  <p className="eyebrow">Formacion</p>
                  <p>{specialist.education}</p>
                </section>
              ) : null}
              {specialist.years_experience ? (
                <section className="panel">
                  <p className="eyebrow">Experiencia</p>
                  <p>{specialist.years_experience} anos de experiencia</p>
                </section>
              ) : null}
              <section className="panel">
                <p className="eyebrow">Consulta</p>
                <p>{specialist.session}</p>
                {specialist.duration_minutes ? <p className="muted">{specialist.duration_minutes} minutos</p> : null}
              </section>
            </div>

            <div className="professional-cta panel">
              <div>
                <p className="eyebrow">Valor de la consulta</p>
                <strong>{formatPrice(specialist.price)}</strong>
              </div>
              <a className="button" href={`/turnos?especialista=${specialist.slug}`}>Reservar turno</a>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
