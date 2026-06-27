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

  const [
    { data: courses },
    { data: profiles },
    { data: enrollments },
    { data: lessons },
    { data: materials },
    { data: specialists },
    { data: appointmentSlots },
    { data: catalogProducts },
  ] = await Promise.all([
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
    supabase
      .from("appointment_specialists")
      .select("id,name,role,focus,session,price,status,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("appointment_slots")
      .select("id,slot_date,slot_time,status,appointment_specialists:specialist_id (id,name)")
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true }),
    supabase
      .from("catalog_products")
      .select("id,title,product_type,category,summary,price,stock,status,created_at")
      .order("created_at", { ascending: false }),
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
            <h2>Cargar especialista</h2>
            <form className="admin-form" action="/admin/specialists/create" method="post">
              <label>
                Nombre
                <input name="name" required placeholder="Ej: Lic. Valentina Rivas" />
              </label>
              <label>
                Rol
                <input name="role" required defaultValue="Psicologia" />
              </label>
              <label className="wide-field">
                Enfoque
                <textarea name="focus" rows="3" placeholder="Ej: Ansiedad, estres y acompanamiento en crisis" />
              </label>
              <label>
                Sesion
                <input name="session" required defaultValue="Consulta online de 50 minutos" />
              </label>
              <label>
                Precio en ARS
                <input name="price" type="number" min="0" step="1" required placeholder="18000" />
              </label>
              <label>
                Estado
                <select name="status" defaultValue="active">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </label>
              <button className="button" type="submit">Guardar especialista</button>
            </form>
          </section>

          <section className="panel">
            <h2>Cargar horarios disponibles</h2>
            <form className="admin-form" action="/admin/appointment-slots/create" method="post">
              <label className="wide-field">
                Especialista
                <select name="specialistId" required>
                  <option value="">Seleccionar especialista</option>
                  {specialists?.map((specialist) => (
                    <option value={specialist.id} key={specialist.id}>
                      {specialist.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Dia
                <input name="slotDate" type="date" required />
              </label>
              <label>
                Horario
                <input name="slotTime" type="time" min="08:00" max="20:00" step="900" required />
              </label>
              <label>
                Estado
                <select name="status" defaultValue="available">
                  <option value="available">Disponible</option>
                  <option value="blocked">Bloqueado</option>
                  <option value="booked">Reservado</option>
                </select>
              </label>
              <button className="button" type="submit">Guardar horario</button>
            </form>
            <p className="muted">
              Horarios permitidos: lunes a viernes de 08:00 a 20:00 y sabados de 08:00 a 13:00.
            </p>
          </section>
        </div>

        <div className="admin-layout spaced-panel">
          <section className="panel">
            <h2>Especialistas cargados</h2>
            <div className="compact-list">
              {specialists?.length ? specialists.map((specialist) => (
                <article key={specialist.id}>
                  <strong>{specialist.name}</strong>
                  <span>{specialist.role} - {formatPrice(specialist.price)}</span>
                  <small>{specialist.status} - {specialist.focus || "Sin enfoque cargado"}</small>
                </article>
              )) : (
                <p className="muted">Todavia no hay especialistas cargados.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <h2>Horarios cargados</h2>
            <div className="compact-list">
              {appointmentSlots?.length ? appointmentSlots.map((slot) => (
                <article key={slot.id}>
                  <strong>{slot.appointment_specialists?.name || "Especialista"} - {slot.slot_time?.slice(0, 5)}</strong>
                  <span>{new Date(`${slot.slot_date}T00:00:00`).toLocaleDateString("es-AR")}</span>
                  <small>{slot.status}</small>
                </article>
              )) : (
                <p className="muted">Todavia no hay horarios cargados.</p>
              )}
            </div>
          </section>
        </div>

        <div className="admin-layout spaced-panel">
          <section className="panel">
            <h2>Cargar producto de catalogo</h2>
            <form className="admin-form" action="/admin/catalog-products/create" method="post">
              <label>
                Nombre
                <input name="title" required placeholder="Ej: Kit de fidgets sensoriales" />
              </label>
              <label>
                Tipo
                <select name="productType" defaultValue="physical">
                  <option value="physical">Fisico</option>
                  <option value="digital">Digital</option>
                </select>
              </label>
              <label>
                Categoria
                <input name="category" required placeholder="Ej: Regulacion sensorial" />
              </label>
              <label>
                Precio en ARS
                <input name="price" type="number" min="0" step="1" required placeholder="12000" />
              </label>
              <label>
                Stock fisico
                <input name="stock" type="number" min="0" step="1" placeholder="8" />
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
                URL digital opcional
                <input name="digitalUrl" type="url" placeholder="https://..." />
              </label>
              <label className="wide-field">
                Descripcion
                <textarea name="summary" rows="4" placeholder="Breve descripcion del producto o recurso" />
              </label>
              <button className="button" type="submit">Guardar producto</button>
            </form>
          </section>

          <section className="panel">
            <h2>Productos cargados</h2>
            <div className="compact-list">
              {catalogProducts?.length ? catalogProducts.map((product) => (
                <article key={product.id}>
                  <strong>{product.title}</strong>
                  <span>{product.product_type === "digital" ? "Digital" : "Fisico"} - {formatPrice(product.price)}</span>
                  <small>{product.status} - {product.category}</small>
                </article>
              )) : (
                <p className="muted">Todavia no hay productos cargados.</p>
              )}
            </div>
          </section>
        </div>

        <div className="admin-layout spaced-panel">
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
