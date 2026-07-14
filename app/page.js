import { createSupabaseServerClient } from "../lib/supabase/server";
import { demoCourses, formatPrice, normalizeCourse } from "../lib/courses";
import { demoProducts, getProductTypeLabel } from "../lib/catalog";

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
  const [{ data: userData }, { data: courseData }, { data: specialists }, { data: products }] = await Promise.all([
    supabase.auth.getUser(),
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

  const courses = courseData?.length ? courseData.map(normalizeCourse) : demoCourses;
  const productCards = products?.length ? products : demoProducts.slice(0, 3);
  const isLoggedIn = Boolean(userData.user);

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">Plataforma interdisciplinaria online</p>
          <h1>Un espacio para aprender, acompanarte y sentirte mejor</h1>
          <p className="lead">
            Cursos, consultas online y recursos terapeuticos para acompanar tu bienestar personal y profesional.
          </p>
          <div className="landing-actions">
            <a className="button" href="/cursos">Explorar cursos</a>
            <a className="secondary-button" href="/turnos">Reservar consulta</a>
          </div>
        </div>
      </section>

      <section className="landing-feature-grid" aria-label="Accesos principales">
        <article className="landing-feature-card">
          <h2>Cursos</h2>
          <p>Aprende a tu ritmo con contenidos disenados por profesionales.</p>
          <a className="secondary-button" href="/cursos">Ver cursos</a>
        </article>
        <article className="landing-feature-card">
          <h2>Consultas profesionales</h2>
          <p>Reserva una consulta online con especialistas de manera simple y clara.</p>
          <a className="secondary-button" href="/turnos">Reservar consulta</a>
        </article>
        <article className="landing-feature-card">
          <h2>Catalogo</h2>
          <p>Recursos fisicos y digitales para bienestar, educacion y practica clinica.</p>
          <a className="secondary-button" href="/catalogo">Ver catalogo</a>
        </article>
      </section>

      <section className="landing-section landing-section--marfil">
        <div className="landing-section-head centered">
          <p className="eyebrow">Como funciona</p>
          <h2>Un recorrido simple para empezar.</h2>
        </div>
        <div className="landing-steps">
          {[
            ["1", "Registrate", "Crea tu cuenta gratis en pocos pasos."],
            ["2", "Explora", "Descubri cursos, recursos y profesionales."],
            ["3", "Reserva o accede", "Elegi consulta, curso o recurso segun tu necesidad."],
            ["4", "Comenza", "Inicia tu camino de crecimiento y bienestar."],
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
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">Profesionales destacados</p>
            <h2>Acompanamiento profesional, cercano y online.</h2>
          </div>
          <a className="secondary-button" href="/turnos">Ver consultas</a>
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
                <p>{specialist.focus || specialist.short_bio || "Perfil profesional preparado para acompanar procesos de bienestar."}</p>
                <a className="secondary-button" href={specialist.slug ? `/profesionales/${specialist.slug}` : "/turnos"}>Ver perfil</a>
              </article>
            ))}
          </div>
        ) : (
          <div className="ds-empty-state">
            <span aria-hidden="true">+</span>
            <h3>Pronto vas a ver profesionales destacados</h3>
            <p>El equipo de LUMEN se mostrara aca cuando los perfiles esten publicados.</p>
          </div>
        )}
      </section>

      <section className="landing-section landing-section--marfil">
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">Cursos destacados</p>
            <h2>Aprendizaje online para procesos reales.</h2>
          </div>
          <a className="secondary-button" href="/cursos">Ver todos</a>
        </div>
        <div className="landing-card-grid">
          {courses.map((course) => (
            <article className="landing-course-card" key={course.slug}>
              <span className="ds-badge is-published">{course.category || course.type}</span>
              <h3>{course.title}</h3>
              <p>{course.summary}</p>
              <small>{course.totalDuration || course.duration}</small>
              <strong>{formatPrice(course.price)}</strong>
              <a className="secondary-button" href={`/cursos/${course.slug}`}>Ver curso</a>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--blanco">
        <div className="landing-section-head">
          <div>
            <p className="eyebrow">Recursos destacados</p>
            <h2>Herramientas para acompanar el bienestar cotidiano.</h2>
          </div>
          <a className="secondary-button" href="/catalogo">Ver catalogo</a>
        </div>
        <div className="landing-card-grid">
          {productCards.map((product) => {
            const productUrl = String(product.id || "").startsWith("demo-") ? "/catalogo" : `/catalogo/${product.id}`;

            return (
              <article className="landing-resource-card" key={product.id}>
                <span className="ds-badge">{getProductTypeLabel(product.product_type)}</span>
                <h3>{product.title}</h3>
                <p>{product.summary}</p>
                <a className="secondary-button" href={productUrl}>Ver recurso</a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="landing-final-cta">
        <div>
          <p className="eyebrow">Empeza hoy</p>
          <h2>Empeza tu recorrido en LUMEN</h2>
          <p>Creamos un espacio simple para aprender, reservar consultas y acceder a recursos de bienestar.</p>
        </div>
        <div className="landing-actions">
          {isLoggedIn ? (
            <a className="button" href="/mi-cuenta">Ir a Mi Espacio</a>
          ) : (
            <a className="button" href="/registro">Crear cuenta</a>
          )}
          <a className="secondary-button" href="/turnos">Reservar consulta</a>
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
