import Link from "next/link";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { formatPrice, normalizeCourse } from "../lib/courses";
import { getProductTypeLabel } from "../lib/catalog";

function getInitials(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export default async function HomePage() {
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/";
  const supabase = await createSupabaseServerClient();
  const [{ data: courseData }, { data: specialists }, { data: products }] = await Promise.all([
    supabase
      .from("courses")
      .select("id,slug,title,summary,price,status,cover_image_url,instructor,level,total_duration,category,featured,display_order")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(3),
    supabase
      .from("appointment_specialists")
      .select("id,name,role,professional_license,focus,short_bio,photo_url,slug,status,display_order")
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .limit(3),
    supabase
      .from("catalog_products")
      .select("id,title,product_type,category,summary,price,status")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const courses = courseData?.length ? courseData.map(normalizeCourse) : [];
  const productCards = products?.length ? products : [];

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

      <section className="landing-feature-grid" aria-label="Accesos principales">
        <article className="landing-feature-card">
          <h2>Consultas profesionales</h2>
          <p>Elegí una especialista, revisá su disponibilidad y reservá una consulta online.</p>
          <Link className="secondary-button" href="/turnos">Reservar consulta</Link>
        </article>
        <article className="landing-feature-card">
          <h2>Cursos online</h2>
          <p>Accedé a contenidos asincrónicos y aprendé a tu ritmo.</p>
          <Link className="secondary-button" href="/cursos">Explorar cursos</Link>
        </article>
        <article className="landing-feature-card">
          <h2>Recursos</h2>
          <p>Encontrá materiales físicos y digitales para acompañar procesos personales, educativos o profesionales.</p>
          <Link className="secondary-button" href="/catalogo">Ver recursos</Link>
        </article>
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

      <section className="landing-section landing-section--blanco">
        <div className="landing-section-head centered">
          <p className="eyebrow">Confianza</p>
          <h2>Un espacio pensado para avanzar con confianza</h2>
        </div>
        <div className="landing-trust-grid">
          {[
            "Conocé a cada profesional antes de reservar",
            "Procesos claros de reserva y acceso",
            "Un área privada para organizar tu actividad",
            "Una experiencia online simple y acompañada",
          ].map((item) => (
            <article key={item}>
              <span aria-hidden="true">+</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--blanco">
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">Profesionales destacados</p>
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
                  {specialist.professional_license ? <small>{specialist.professional_license}</small> : null}
                </div>
                <p>{specialist.focus || specialist.short_bio || "Consultá su perfil para conocer su enfoque y disponibilidad."}</p>
                <Link className="secondary-button" href={specialist.slug ? `/profesionales/${specialist.slug}` : "/turnos"}>Ver perfil</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="ds-empty-state">
            <span aria-hidden="true">+</span>
            <h3>Los perfiles profesionales disponibles van a aparecer acá.</h3>
          </div>
        )}
      </section>

      <section className="landing-section landing-section--marfil">
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">Cursos destacados</p>
            <h2>Aprendizaje online para procesos reales.</h2>
          </div>
          <Link className="secondary-button" href="/cursos">Ver todos</Link>
        </div>
        {courses.length ? (
          <div className="landing-card-grid">
            {courses.map((course) => (
              <article className="landing-course-card" key={course.slug}>
                <span className="ds-badge is-published">{course.category || course.type}</span>
                <h3>{course.title}</h3>
                <p>{course.summary}</p>
                <small>{course.totalDuration || course.duration}</small>
                <strong>{formatPrice(course.price)}</strong>
                <Link className="secondary-button" href={`/cursos/${course.slug}`}>Ver curso</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="ds-empty-state">
            <span aria-hidden="true">+</span>
            <h3>Los próximos cursos disponibles van a aparecer acá.</h3>
          </div>
        )}
      </section>

      <section className="landing-section landing-section--blanco">
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">Recursos destacados</p>
            <h2>Herramientas para acompañar el bienestar cotidiano.</h2>
          </div>
          <Link className="secondary-button" href="/catalogo">Ver recursos</Link>
        </div>
        {productCards.length ? (
          <div className="landing-card-grid">
            {productCards.map((product) => {
              const productUrl = `/catalogo/${product.id}`;

              return (
                <article className="landing-resource-card" key={product.id}>
                  <span className="ds-badge">{getProductTypeLabel(product.product_type)}</span>
                  <h3>{product.title}</h3>
                  <p>{product.summary}</p>
                  <Link className="secondary-button" href={productUrl}>Ver recurso</Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="ds-empty-state">
            <span aria-hidden="true">+</span>
            <h3>Los próximos recursos disponibles van a aparecer acá.</h3>
          </div>
        )}
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

      <div className="landing-whatsapp-row">
        <a className="landing-whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
    </main>
  );
}
