import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("es-AR");
}

function formatTime(value) {
  return value?.slice(0, 5) || "";
}

function EmptyState({ title, text, href, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p className="muted">{text}</p>
      {href ? <a className="secondary-button" href={href}>{action}</a> : null}
    </div>
  );
}

export default async function MiCuentaPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: profile },
    { data: bookings },
    { data: enrollments },
    { data: digitalOrders },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,role,created_at")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase
      .from("appointment_bookings")
      .select(`
        id,
        status,
        patient_name,
        patient_email,
        created_at,
        appointment_specialists:specialist_id (
          name,
          session,
          price
        ),
        appointment_slots:slot_id (
          slot_date,
          slot_time
        )
      `)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("enrollments")
      .select("id,created_at,courses:course_id (id,slug,title,summary,price,status)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("catalog_orders")
      .select(`
        id,
        status,
        amount,
        created_at,
        catalog_products:product_id (
          id,
          title,
          summary,
          product_type,
          digital_file_name,
          digital_url
        )
      `)
      .eq("user_id", userData.user.id)
      .eq("product_type", "digital")
      .order("created_at", { ascending: false }),
  ]);

  const upcomingBookings = (bookings || [])
    .filter((booking) => booking.appointment_slots?.slot_date >= today && booking.status !== "cancelled")
    .sort((a, b) => {
      const aValue = `${a.appointment_slots?.slot_date || ""} ${a.appointment_slots?.slot_time || ""}`;
      const bValue = `${b.appointment_slots?.slot_date || ""} ${b.appointment_slots?.slot_time || ""}`;
      return aValue.localeCompare(bValue);
    });
  const pastBookings = (bookings || [])
    .filter((booking) => booking.appointment_slots?.slot_date < today || booking.status === "cancelled")
    .sort((a, b) => {
      const aValue = `${a.appointment_slots?.slot_date || ""} ${a.appointment_slots?.slot_time || ""}`;
      const bValue = `${b.appointment_slots?.slot_date || ""} ${b.appointment_slots?.slot_time || ""}`;
      return bValue.localeCompare(aValue);
    });
  const nextBooking = upcomingBookings[0];
  const approvedDigitalOrders = (digitalOrders || []).filter((order) => order.status === "paid" || order.status === "delivered");
  const displayName = profile?.full_name || userData.user.email;
  const courseIds = (enrollments || []).map((enrollment) => enrollment.courses?.id).filter(Boolean);
  const [{ data: enrolledLessons }, { data: courseProgress }] = courseIds.length
    ? await Promise.all([
        supabase
          .from("lessons")
          .select("id,course_id,title,status")
          .in("course_id", courseIds)
          .eq("status", "published"),
        supabase
          .from("lesson_progress")
          .select("course_id,lesson_id,completed_at,last_viewed_at,lessons:lesson_id (title)")
          .eq("user_id", userData.user.id)
          .in("course_id", courseIds),
      ])
    : [{ data: [] }, { data: [] }];
  const lessonsByCourse = new Map();
  const progressByCourse = new Map();

  (enrolledLessons || []).forEach((lesson) => {
    lessonsByCourse.set(lesson.course_id, [...(lessonsByCourse.get(lesson.course_id) || []), lesson]);
  });

  (courseProgress || []).forEach((item) => {
    progressByCourse.set(item.course_id, [...(progressByCourse.get(item.course_id) || []), item]);
  });

  function getCourseProgress(courseId) {
    const lessons = lessonsByCourse.get(courseId) || [];
    const progress = progressByCourse.get(courseId) || [];
    const completed = new Set(progress.filter((item) => item.completed_at).map((item) => item.lesson_id));
    const lastViewed = [...progress]
      .filter((item) => item.last_viewed_at)
      .sort((a, b) => String(b.last_viewed_at).localeCompare(String(a.last_viewed_at)))[0];
    const total = lessons.length;

    return {
      total,
      completed: completed.size,
      percent: total ? Math.round((completed.size / total) * 100) : 0,
      lastLessonId: lastViewed?.lesson_id || lessons[0]?.id || "",
      lastLessonTitle: lastViewed?.lessons?.title || lessons[0]?.title || "Primera clase",
    };
  }

  return (
    <main className="section">
      <div className="dashboard-shell">
        <div className="section-head">
          <p className="eyebrow">Mi cuenta</p>
          <h1>Hola, {displayName}</h1>
          <p className="lead">Tu espacio privado para revisar turnos, cursos, recursos y datos de perfil.</p>
        </div>

        <nav className="account-tabs" aria-label="Secciones de mi cuenta">
          <a href="#inicio">Inicio</a>
          <a href="#turnos">Mis turnos</a>
          <a href="#cursos">Mis cursos</a>
          <a href="#recursos">Mis recursos</a>
          <a href="#perfil">Mi perfil</a>
        </nav>

        <section className="account-section" id="inicio">
          <div className="account-grid">
            <article className="panel account-highlight">
              <p className="eyebrow">Proximo turno</p>
              {nextBooking ? (
                <>
                  <h2>{nextBooking.appointment_specialists?.name}</h2>
                  <p className="muted">
                    {formatDate(nextBooking.appointment_slots?.slot_date)} a las {formatTime(nextBooking.appointment_slots?.slot_time)}
                  </p>
                  <span className="status-pill">{nextBooking.status}</span>
                </>
              ) : (
                <EmptyState
                  title="Todavia no tenes turnos reservados"
                  text="Cuando reserves una consulta, el proximo turno va a aparecer aca."
                  href="/turnos"
                  action="Reservar turno"
                />
              )}
            </article>

            <div className="account-actions">
              <a className="quick-card" href="/turnos">
                <strong>Reservar nuevo turno</strong>
                <span>Elegir especialista y horario.</span>
              </a>
              <a className="quick-card" href="#cursos">
                <strong>Mis cursos</strong>
                <span>{enrollments?.length || 0} cursos habilitados.</span>
              </a>
              <a className="quick-card" href="/catalogo">
                <strong>Catalogo</strong>
                <span>Explorar recursos fisicos y digitales.</span>
              </a>
              <a className="quick-card" href="#recursos">
                <strong>Mis recursos</strong>
                <span>{approvedDigitalOrders.length} recursos disponibles.</span>
              </a>
            </div>
          </div>
        </section>

        <section className="account-section" id="turnos">
          <div className="admin-section-head">
            <p className="eyebrow">Mis turnos</p>
            <h2>Proximos turnos</h2>
          </div>
          {upcomingBookings.length ? (
            <div className="account-list">
              {upcomingBookings.map((booking) => (
                <article className="panel account-row" key={booking.id}>
                  <div>
                    <p className="eyebrow">{booking.status}</p>
                    <h3>{booking.appointment_specialists?.name}</h3>
                    <p className="muted">{booking.appointment_specialists?.session || "Consulta online"}</p>
                  </div>
                  <div>
                    <strong>{formatDate(booking.appointment_slots?.slot_date)}</strong>
                    <span>{formatTime(booking.appointment_slots?.slot_time)}</span>
                  </div>
                  <div>
                    <strong>{formatPrice(booking.appointment_specialists?.price || 0)}</strong>
                    <span>Precio de referencia</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No tenes turnos proximos" text="Podes reservar un nuevo turno cuando lo necesites." href="/turnos" action="Reservar turno" />
          )}

          <div className="admin-section-head spaced-panel">
            <h2>Historial</h2>
          </div>
          {pastBookings.length ? (
            <div className="account-list">
              {pastBookings.map((booking) => (
                <article className="panel account-row" key={booking.id}>
                  <div>
                    <p className="eyebrow">{booking.status}</p>
                    <h3>{booking.appointment_specialists?.name}</h3>
                  </div>
                  <div>
                    <strong>{formatDate(booking.appointment_slots?.slot_date)}</strong>
                    <span>{formatTime(booking.appointment_slots?.slot_time)}</span>
                  </div>
                  <div>
                    <strong>{booking.appointment_specialists?.session || "Consulta online"}</strong>
                    <span>{formatPrice(booking.appointment_specialists?.price || 0)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">Todavia no hay turnos en el historial.</p>
          )}
        </section>

        <section className="account-section" id="cursos">
          <div className="admin-section-head">
            <p className="eyebrow">Mis cursos</p>
            <h2>Cursos habilitados</h2>
          </div>
          {enrollments?.length ? (
            <div className="grid">
              {enrollments.map((enrollment) => (
                (() => {
                  const courseProgress = getCourseProgress(enrollment.courses?.id);
                  const continueUrl = enrollment.courses?.slug
                    ? `/aula?curso=${enrollment.courses.slug}${courseProgress.lastLessonId ? `&lesson=${courseProgress.lastLessonId}` : ""}`
                    : "/aula";

                  return (
                    <article className="card account-course-card" key={enrollment.id}>
                      <p className="eyebrow">Acceso habilitado</p>
                      <h3>{enrollment.courses?.title}</h3>
                      <p>{enrollment.courses?.summary}</p>
                      <div className="progress-panel compact">
                        <div>
                          <strong>{courseProgress.percent}%</strong>
                          <span>{courseProgress.completed} de {courseProgress.total} clases completadas</span>
                        </div>
                        <div className="progress-bar">
                          <span style={{ width: `${courseProgress.percent}%` }} />
                        </div>
                      </div>
                      <p className="muted">Ultima clase: {courseProgress.lastLessonTitle}</p>
                      <p className="muted">Inscripto el {formatDateTime(enrollment.created_at)}</p>
                      <div className="actions">
                        <a className="button" href={continueUrl}>Continuar</a>
                        {enrollment.courses?.slug ? (
                          <a className="secondary-button" href={`/cursos/${enrollment.courses.slug}`}>Ver detalle</a>
                        ) : null}
                      </div>
                    </article>
                  );
                })()
              ))}
            </div>
          ) : (
            <EmptyState title="Todavia no tenes cursos habilitados" text="Cuando compres o te habiliten un curso, lo vas a ver en esta seccion." href="/cursos" action="Explorar cursos" />
          )}
        </section>

        <section className="account-section" id="recursos">
          <div className="admin-section-head">
            <p className="eyebrow">Mis recursos</p>
            <h2>Recursos digitales</h2>
          </div>
          {approvedDigitalOrders.length ? (
            <div className="grid">
              {approvedDigitalOrders.map((order) => (
                <article className="card" key={order.id}>
                  <p className="eyebrow">{order.status}</p>
                  <h3>{order.catalog_products?.title}</h3>
                  <p>{order.catalog_products?.summary}</p>
                  <p className="muted">
                    {order.catalog_products?.digital_file_name || order.catalog_products?.digital_url || "Recurso pendiente de descarga"}
                  </p>
                  <p className="price">{formatPrice(order.amount)}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Todavia no tenes recursos digitales disponibles"
              text="Cuando compres un recurso digital y el pago este aprobado, va a aparecer aca."
              href="/catalogo"
              action="Ir al catalogo"
            />
          )}
        </section>

        <section className="account-section" id="perfil">
          <div className="admin-section-head">
            <p className="eyebrow">Mi perfil</p>
            <h2>Datos de cuenta</h2>
          </div>
          <section className="panel profile-panel">
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{userData.user.email}</dd>
              </div>
              <div>
                <dt>Nombre</dt>
                <dd>{profile?.full_name || "Sin nombre cargado"}</dd>
              </div>
              <div>
                <dt>Rol</dt>
                <dd>{profile?.role || "student"}</dd>
              </div>
              <div>
                <dt>Fecha de creacion</dt>
                <dd>{formatDateTime(profile?.created_at || userData.user.created_at)}</dd>
              </div>
            </dl>
            <p className="muted">Por ahora esta informacion es de solo lectura.</p>
          </section>
        </section>
      </div>
    </main>
  );
}
