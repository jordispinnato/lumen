import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase/server";
import AppIcon from "./components/AppIcon";

function getInitials(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

const TRUST_ITEMS = [
  "Conocé a cada profesional antes de reservar",
  "Procesos claros de reserva y acceso",
  "Un área privada para organizar tu actividad",
  "Una experiencia online simple y acompañada",
];

const FAQ_ITEMS = [
  {
    question: "¿Cuánto cuesta una consulta?",
    answer: "Cada profesional define su valor, y lo vas a ver antes de confirmar tu turno en el paso de reserva.",
  },
  {
    question: "¿Cómo es la consulta online?",
    answer: "Se hace por videollamada en el horario que reserves. El acceso te llega por email junto con la confirmación.",
  },
  {
    question: "¿Es confidencial?",
    answer: "Sí. Tu proceso queda entre vos y tu profesional, dentro de tu espacio privado en LUMEN.",
  },
  {
    question: "¿Puedo cancelar o reprogramar un turno?",
    answer: "Sí, desde tu Mi Espacio. Las condiciones específicas de cada caso se muestran antes de confirmar el cambio.",
  },
  {
    question: "¿Qué medios de pago aceptan?",
    answer: "Por ahora coordinamos el pago por transferencia. Vas a ver las instrucciones al finalizar tu reserva.",
  },
  {
    question: "¿Para quién es LUMEN?",
    answer: "Para adolescentes y adultos que buscan acompañamiento profesional. LUMEN no reemplaza servicios de urgencias ni crisis.",
  },
];

export default async function HomePage() {
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/";
  const supabase = await createSupabaseServerClient();
  const { data: specialists } = await supabase
    .from("appointment_specialists")
    .select("id,name,role,professional_license,focus,short_bio,photo_url,slug,status,display_order")
    .eq("status", "active")
    .order("display_order", { ascending: true })
    .limit(3);

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">Consultas, cursos y recursos online</p>
          <h1>Acompañamiento profesional para aprender, consultar y avanzar con claridad</h1>
          <p className="lead">
            LUMEN reúne consultas profesionales, cursos online y recursos seleccionados en un espacio simple, cuidado y fácil de gestionar.
          </p>
          <div className="landing-actions">
            <Link className="button" href="/turnos">Reservar consulta</Link>
            <Link className="secondary-button" href="/cursos">Explorar cursos</Link>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--marfil">
        <div className="landing-section-head centered">
          <p className="eyebrow">Confianza</p>
          <h2>Un espacio pensado para avanzar con confianza</h2>
        </div>
        <div className="landing-trust-grid">
          {TRUST_ITEMS.map((item) => (
            <article key={item}>
              <AppIcon name="check" size="md" />
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-feature-grid" aria-label="Accesos principales">
        <article className="landing-feature-card">
          <AppIcon name="calendar" size="lg" />
          <h2>Consultas profesionales</h2>
          <p>Elegí una especialista, revisá su disponibilidad y reservá una consulta online.</p>
          <Link className="secondary-button" href="/turnos">Reservar consulta</Link>
        </article>
        <article className="landing-feature-card">
          <AppIcon name="book-open" size="lg" />
          <h2>Cursos online</h2>
          <p>Accedé a contenidos asincrónicos y aprendé a tu ritmo.</p>
          <Link className="secondary-button" href="/cursos">Explorar cursos</Link>
        </article>
        <article className="landing-feature-card">
          <AppIcon name="package" size="lg" />
          <h2>Recursos</h2>
          <p>Encontrá materiales físicos y digitales para acompañar procesos personales, educativos o profesionales.</p>
          <Link className="secondary-button" href="/catalogo">Ver recursos</Link>
        </article>
      </section>

      <section className="landing-section landing-section--blanco">
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">Equipo profesional</p>
            <h2>Acompañamiento profesional, cercano y online.</h2>
          </div>
          <Link className="secondary-button" href="/turnos">Ver consultas</Link>
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
                  {specialist.professional_license ? (
                    <span className="credential-chip">
                      <AppIcon name="badge-check" size="sm" />
                      {specialist.professional_license}
                    </span>
                  ) : null}
                </div>
                <p>{specialist.focus || specialist.short_bio || "Consultá su perfil para conocer su enfoque y disponibilidad."}</p>
                <Link className="secondary-button" href={specialist.slug ? `/profesionales/${specialist.slug}` : "/turnos"}>Ver perfil</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="ds-empty-state">
            <AppIcon name="users" size="lg" />
            <h3>Los perfiles profesionales disponibles van a aparecer acá.</h3>
          </div>
        )}
      </section>

      <section className="landing-section landing-section--marfil">
        <div className="landing-section-head centered">
          <p className="eyebrow">Cómo funciona</p>
          <h2>Un recorrido simple, con todo en un mismo lugar</h2>
        </div>
        <div className="landing-steps">
          {[
            ["1", "Elegí el acompañamiento que necesitás", "Podés reservar una consulta, explorar cursos o buscar recursos."],
            ["2", "Reservá o accedé al contenido", "Revisá la información disponible y avanzá desde la plataforma."],
            ["3", "Gestioná tu actividad desde Mi Espacio", "Tus consultas, cursos, recursos y mensajes quedan organizados en tu área privada."],
          ].map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--blanco" aria-label="Preguntas frecuentes">
        <div className="landing-section-head centered">
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2>Lo que necesitás saber antes de empezar</h2>
        </div>
        <div className="landing-faq">
          {FAQ_ITEMS.map((item) => (
            <details className="landing-faq-item" key={item.question}>
              <summary>
                <span>{item.question}</span>
                <AppIcon name="chevron-down" className="landing-faq-caret" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-final-cta">
        <div>
          <p className="eyebrow">Empezá por el camino que necesitás</p>
          <h2>Reservá una consulta o explorá los cursos disponibles</h2>
          <p>LUMEN te ayuda a ordenar tu próximo paso con acompañamiento profesional, aprendizaje online y recursos seleccionados.</p>
        </div>
        <div className="landing-actions">
          <Link className="button" href="/turnos">Reservar consulta</Link>
          <Link className="secondary-button" href="/cursos">Explorar cursos</Link>
        </div>
      </section>

      <a className="landing-whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Escribinos por WhatsApp">
        <img src="/assets/whatsapp.png" alt="" aria-hidden="true" />
      </a>
    </main>
  );
}
