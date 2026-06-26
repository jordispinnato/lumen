import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name,email")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <main className="section">
        <div className="form-card">
          <p className="eyebrow">Panel admin</p>
          <h1>Acceso restringido</h1>
          <p className="muted">
            Tu usuario está autenticado, pero todavía no tiene rol de administrador.
          </p>
        </div>
      </main>
    );
  }

  const [{ data: courses }, { data: profiles }, { data: enrollments }, { data: lessons }, { data: materials }] = await Promise.all([
    supabase.from("courses").select("id,slug,title,summary,price,status").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id,full_name,email,role").order("created_at", { ascending: false }),
    supabase
      .from("enrollments")
      .select("id,created_at,profiles:user_id (id,full_name,email),courses:course_id (id,title,slug)")
      .order("created_at", { ascending: false }),
    supabase
      .from("lessons")
      .select("id,title,video_url,position,courses:course_id (id,title,slug)")
      .order("position", { ascending: true }),
    supabase
      .from("course_materials")
      .select("id,title,file_name,file_type,file_size,position,courses:course_id (id,title,slug)")
      .order("position", { ascending: true }),
  ]);

  return (
    <main className="section">
      <div className="dashboard-shell">
        <div className="section-head">
          <p className="eyebrow">Panel admin</p>
          <h1>Gestión LUMEN</h1>
          <p className="lead">
            Administrá cursos e inscripciones manuales desde Supabase.
          </p>
          {params?.error ? <p className="notice error">{params.error}</p> : null}
          {params?.message ? <p className="notice success">{params.message}</p> : null}
        </div>

        <div className="admin-layout">
          <section className="panel">
            <h2>Crear o actualizar curso</h2>
            <form className="admin-form" action="/admin/courses/create" method="post">
              <label>
                Título
                <input name="title" required placeholder="Ej: Crianza y comunicación" />
              </label>
              <label>
                Precio en ARS
                <input name="price" type="number" min="0" step="1" required placeholder="39000" />
              </label>
              <label>
                Estado
                <select name="status" defaultValue="published">
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </select>
              </label>
              <label className="wide-field">
                Resumen
                <textarea name="summary" rows="4" required placeholder="Descripción breve del curso" />
              </label>
              <button className="button" type="submit">Guardar curso</button>
            </form>
          </section>

          <section className="panel">
            <h2>Agregar lección o video</h2>
            <form className="admin-form" action="/admin/lessons/create" method="post">
              <label>
                Curso
                <select name="courseId" required>
                  <option value="">Seleccionar curso</option>
                  {courses?.map((course) => (
                    <option value={course.id} key={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Orden
                <input name="position" type="number" min="1" step="1" required placeholder="1" />
              </label>
              <label className="wide-field">
                Título de la lección
                <input name="title" required placeholder="Ej: Módulo 1 · Introducción" />
              </label>
              <label className="wide-field">
                URL del video
                <input name="videoUrl" type="url" placeholder="https://vimeo.com/..." />
              </label>
              <button className="button" type="submit">Guardar lección</button>
            </form>
          </section>
        </div>

        <div className="admin-layout spaced-panel">
          <section className="panel">
            <h2>Subir material descargable</h2>
            <form className="admin-form" action="/admin/materials/create" method="post" encType="multipart/form-data">
              <label>
                Curso
                <select name="courseId" required>
                  <option value="">Seleccionar curso</option>
                  {courses?.map((course) => (
                    <option value={course.id} key={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Orden
                <input name="position" type="number" min="1" step="1" required placeholder="1" />
              </label>
              <label className="wide-field">
                Título del material
                <input name="title" required placeholder="Ej: Guía de trabajo en PDF" />
              </label>
              <label className="wide-field">
                Archivo
                <input
                  name="file"
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt"
                />
              </label>
              <button className="button" type="submit">Subir material</button>
            </form>
          </section>

          <section className="panel">
            <h2>Habilitar curso a un alumno</h2>
            <form className="admin-form" action="/admin/enrollments/create" method="post">
              <label>
                Usuario
                <select name="userId" required>
                  <option value="">Seleccionar usuario</option>
                  {profiles?.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.email || item.full_name || item.id}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Curso
                <select name="courseId" required>
                  <option value="">Seleccionar curso</option>
                  {courses?.map((course) => (
                    <option value={course.id} key={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button" type="submit">Habilitar acceso</button>
            </form>
          </section>
        </div>

        <div className="admin-layout spaced-panel">
          <section className="panel">
            <h2>Materiales cargados</h2>
            <div className="compact-list">
              {materials?.length ? materials.map((material) => (
                <article key={material.id}>
                  <strong>{material.position}. {material.title}</strong>
                  <span>{material.courses?.title}</span>
                  <small>{material.file_name}</small>
                </article>
              )) : (
                <p className="muted">Todavía no hay materiales cargados.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <h2>Lecciones cargadas</h2>
            <div className="compact-list">
              {lessons?.length ? lessons.map((lesson) => (
                <article key={lesson.id}>
                  <strong>{lesson.position}. {lesson.title}</strong>
                  <span>{lesson.courses?.title}</span>
                  <small>{lesson.video_url || "Sin video"}</small>
                </article>
              )) : (
                <p className="muted">Todavía no hay lecciones cargadas.</p>
              )}
            </div>
          </section>
        </div>

        <section className="panel spaced-panel">
          <h2>Cursos</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {courses?.map((course) => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{formatPrice(course.price)}</td>
                  <td>{course.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel spaced-panel">
          <h2>Inscripciones</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Curso</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {enrollments?.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td>{enrollment.profiles?.email || enrollment.profiles?.full_name || enrollment.profiles?.id}</td>
                  <td>{enrollment.courses?.title}</td>
                  <td>{new Date(enrollment.created_at).toLocaleDateString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
