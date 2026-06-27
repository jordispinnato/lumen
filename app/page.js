import { createSupabaseServerClient } from "../lib/supabase/server";
import { demoCourses, formatPrice, normalizeCourse } from "../lib/courses";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("slug,title,summary,price,status")
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(3);
  const courses = data?.length ? data.map(normalizeCourse) : demoCourses;

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Plataforma interdisciplinaria online</p>
          <h1>Claridad para avanzar.</h1>
          <p className="lead">
            Atencion psicologica, formacion y recursos para transformar informacion en acciones concretas.
          </p>
          <div className="actions">
            <a className="button" href="/turnos">Reservar turno</a>
            <a className="button" href="/cursos">Explorar cursos</a>
            <a className="secondary-button" href="/catalogo">Catalogo online</a>
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="Accesos principales">
        <div>
          <strong>Turnos</strong>
          <span>Atencion psicologica online con dias y horarios disponibles.</span>
        </div>
        <div>
          <strong>Cursos</strong>
          <span>Formacion asincronica con videos, bibliografia y materiales.</span>
        </div>
        <div>
          <strong>Catalogo</strong>
          <span>Recursos fisicos y digitales para bienestar y practica clinica.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Accesos principales</p>
          <h2>Tres caminos simples para encontrar lo que necesitas.</h2>
          <p className="muted">
            La pagina de inicio organiza LUMEN en turnos, cursos y catalogo para que cada persona llegue rapido a su objetivo.
          </p>
        </div>
        <div className="grid">
          <article className="card feature-card">
            <p className="eyebrow">Atencion psicologica</p>
            <h3>Reservar turno</h3>
            <p>Selecciona especialista, dia y horario disponible para una consulta online.</p>
            <div className="actions">
              <a className="button" href="/turnos">Ver disponibilidad</a>
            </div>
          </article>
          <article className="card feature-card">
            <p className="eyebrow">Academia online</p>
            <h3>Explorar cursos</h3>
            <p>Accede a cursos asincronicos con videos, bibliografia y material complementario.</p>
            <div className="actions">
              <a className="button" href="/cursos">Ver cursos</a>
            </div>
          </article>
          <article className="card feature-card" id="catalogo">
            <p className="eyebrow">Recursos terapeuticos</p>
            <h3>Catalogo online</h3>
            <p>Productos fisicos y recursos digitales para terapeutas, familias y bienestar cotidiano.</p>
            <div className="actions">
              <a className="button" href="/catalogo">Ver catalogo</a>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Cursos destacados</p>
          <h2>Aprendizaje online para acompanar procesos reales.</h2>
          <p className="muted">
            Cursos asincronicos con acceso privado, lecciones en video y materiales complementarios.
          </p>
        </div>
        <div className="grid">
          {courses.map((course) => (
            <article className="card" key={course.slug}>
              <p className="eyebrow">{course.type}</p>
              <h3>{course.title}</h3>
              <p>{course.summary}</p>
              <p className="muted">
                {course.audience} - {course.duration}
              </p>
              <p className="price">{formatPrice(course.price)}</p>
              <div className="actions">
                <a className="button" href={`/cursos/${course.slug}`}>Ver curso</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
