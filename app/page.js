import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoCourses, formatPrice, normalizeCourse } from "@/lib/courses";

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
            Orientación profesional, formación y recursos para transformar información en acciones concretas.
          </p>
          <div className="actions">
            <a className="button" href="/cursos">Explorar cursos</a>
            <a className="secondary-button" href="/registro">Crear cuenta</a>
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="Datos principales">
        <div>
          <strong>Academia</strong>
          <span>Cursos, charlas y talleres con acceso privado.</span>
        </div>
        <div>
          <strong>Aula online</strong>
          <span>Videos y lecciones habilitados por usuario.</span>
        </div>
        <div>
          <strong>Admin real</strong>
          <span>Carga de cursos, alumnos, lecciones y accesos.</span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Ecosistema LUMEN</p>
          <h2>Atención, academia, recursos y acompañamiento en un mismo lugar.</h2>
          <p className="muted">
            Una base preparada para crecer con usuarios reales, pagos, aula privada y gestión de contenidos.
          </p>
        </div>
        <div className="grid">
          {courses.map((course) => (
            <article className="card" key={course.slug}>
              <p className="eyebrow">{course.type}</p>
              <h3>{course.title}</h3>
              <p>{course.summary}</p>
              <p className="muted">
                {course.audience} · {course.duration}
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
