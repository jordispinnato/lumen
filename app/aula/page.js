import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";

export default async function ClassroomPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      courses (
        id,
        slug,
        title,
        summary,
        price,
        lessons (
          id,
          title,
          video_url,
          position
        )
      ),
      course_materials (
        id,
        title,
        file_path,
        file_name,
        file_type,
        position
      )
    `)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  const activeCourse = enrollments?.[0]?.courses;
  const lessons = activeCourse?.lessons?.sort((a, b) => a.position - b.position) || [];
  const materialsWithUrls = await Promise.all(
    (activeCourse?.course_materials || [])
      .sort((a, b) => a.position - b.position)
      .map(async (material) => {
        const { data: signed } = await supabase.storage
          .from("course-materials")
          .createSignedUrl(material.file_path, 60 * 10);

        return {
          ...material,
          signedUrl: signed?.signedUrl,
        };
      })
  );

  return (
    <main className="section">
      <div className="dashboard-shell">
        <div className="section-head">
          <p className="eyebrow">Aula privada</p>
          <h1>Mi aula</h1>
          <p className="lead">
            Sesión activa: {data.user.email}. Más adelante esta pantalla solo mostrará cursos comprados.
          </p>
          <form action="/auth/logout" method="post">
            <button className="secondary-button" type="submit">Cerrar sesión</button>
          </form>
        </div>

        {activeCourse ? (
          <div className="dashboard-grid">
            <aside className="sidebar">
              <h3>Mis cursos</h3>
              {enrollments.map((enrollment) => (
                <a className="course-link" href={`/cursos/${enrollment.courses.slug}`} key={enrollment.id}>
                  <strong>{enrollment.courses.title}</strong>
                  <span>{formatPrice(enrollment.courses.price)}</span>
                </a>
              ))}
            </aside>
            <section className="panel">
              <div className="video-box">Video del módulo</div>
              <h2>{activeCourse.title}</h2>
              <p className="muted">{activeCourse.summary}</p>
              <h3>Lecciones</h3>
              {lessons.length ? (
                <ul className="lesson-list">
                  {lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <div>
                        <strong>{lesson.title}</strong>
                        {lesson.video_url ? (
                          <a href={lesson.video_url} target="_blank" rel="noreferrer">
                            Abrir video
                          </a>
                        ) : null}
                      </div>
                      <span>{lesson.video_url ? "Disponible" : "Sin video todavía"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Este curso todavía no tiene lecciones cargadas.</p>
              )}
              <h3>Materiales descargables</h3>
              {materialsWithUrls.length ? (
                <ul className="lesson-list">
                  {materialsWithUrls.map((material) => (
                    <li key={material.id}>
                      <div>
                        <strong>{material.title}</strong>
                        {material.signedUrl ? (
                          <a href={material.signedUrl} target="_blank" rel="noreferrer">
                            Descargar {material.file_name}
                          </a>
                        ) : null}
                      </div>
                      <span>{material.file_type || "Archivo"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Este curso todavía no tiene materiales descargables.</p>
              )}
            </section>
          </div>
        ) : (
          <section className="panel">
            <h2>Todavía no tenés cursos habilitados</h2>
            <p className="muted">
              Cuando una compra o inscripción sea aprobada, el curso aparecerá en esta aula.
            </p>
            <a className="button" href="/cursos">Ver cursos</a>
          </section>
        )}
      </div>
    </main>
  );
}
