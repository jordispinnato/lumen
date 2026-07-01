import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";
import AccountDashboardShell from "./AccountDashboardShell";

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

function initialsFromName(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

function EmptyState({ title, text, href, action }) {
  return (
    <div className="account-empty-state">
      <span className="account-empty-icon" aria-hidden="true">+</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {href ? <a className="account-secondary-action" href={href}>{action}</a> : null}
    </div>
  );
}

function AccountIcon({ children, tone = "blue" }) {
  return <span className={`account-icon is-${tone}`} aria-hidden="true">{children}</span>;
}

function StatCard({ icon, tone, label, value, helper, href, action }) {
  const content = (
    <>
      <AccountIcon tone={tone}>{icon}</AccountIcon>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper ? <small>{helper}</small> : null}
      </div>
      {action ? <em>{action}</em> : null}
    </>
  );

  return href ? (
    <a className="account-stat-card" href={href}>{content}</a>
  ) : (
    <article className="account-stat-card">{content}</article>
  );
}

function getCourseState(progress) {
  if (progress.percent >= 100) {
    return "Completado";
  }

  if (progress.percent > 0) {
    return "En progreso";
  }

  return "Pendiente";
}

function getCourseTone(progress) {
  if (progress.percent >= 100) {
    return "complete";
  }

  if (progress.percent > 0) {
    return "progress";
  }

  return "pending";
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
  const firstName = profile?.full_name?.split(" ")?.[0] || userData.user.email?.split("@")?.[0] || "LUMEN";
  const avatarInitials = initialsFromName(displayName);
  const courseIds = (enrollments || []).map((enrollment) => enrollment.courses?.id).filter(Boolean);
  const [{ data: enrolledLessons }, { data: lessonProgress }] = courseIds.length
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

  (lessonProgress || []).forEach((item) => {
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

  const courseCards = (enrollments || []).map((enrollment, index) => {
    const progress = getCourseProgress(enrollment.courses?.id);
    const continueUrl = enrollment.courses?.slug
      ? `/aula?curso=${enrollment.courses.slug}${progress.lastLessonId ? `&lesson=${progress.lastLessonId}` : ""}`
      : "/aula";

    return {
      id: enrollment.id,
      course: enrollment.courses,
      progress,
      state: getCourseState(progress),
      tone: getCourseTone(progress),
      continueUrl,
      enrolledAt: enrollment.created_at,
      visual: index % 3,
    };
  });
  const averageProgress = courseCards.length
    ? Math.round(courseCards.reduce((total, item) => total + item.progress.percent, 0) / courseCards.length)
    : 0;
  const recentActivity = [
    ...courseCards.slice(0, 3).map((item) => ({
      id: `course-${item.id}`,
      icon: "C",
      text: `Tenés acceso al curso ${item.course?.title || "Curso"}`,
      date: item.enrolledAt,
    })),
    ...upcomingBookings.slice(0, 2).map((booking) => ({
      id: `booking-${booking.id}`,
      icon: "T",
      text: `Reservaste un turno con ${booking.appointment_specialists?.name || "un profesional"}`,
      date: booking.created_at,
    })),
    ...approvedDigitalOrders.slice(0, 2).map((order) => ({
      id: `resource-${order.id}`,
      icon: "R",
      text: `Tenés disponible el recurso ${order.catalog_products?.title || "digital"}`,
      date: order.created_at,
    })),
  ]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 4);

  const navItems = [
    { href: "#inicio", icon: "I", label: "Inicio" },
    { href: "#turnos", icon: "T", label: "Mis turnos" },
    { href: "#cursos", icon: "C", label: "Mis cursos" },
    { href: "#recursos", icon: "R", label: "Mis recursos" },
    { href: "#pedidos", icon: "P", label: "Mis pedidos" },
    { href: "#certificados", icon: "D", label: "Certificados" },
    { href: "#configuracion", icon: "S", label: "Configuración" },
  ];

  return (
    <AccountDashboardShell navItems={navItems} displayName={displayName} avatarInitials={avatarInitials} isAdmin={profile?.role === "admin"}>
        <div className="account-dashboard" id="inicio">
          <section className="account-hero">
            <div>
              <span className="account-page-kicker">Mi Espacio</span>
              <h1>¡Hola, {firstName}!</h1>
              <p>Bienvenido a tu espacio personal. Aca tenes un resumen de tu actividad.</p>
            </div>
            <a className="account-primary-action" href="/turnos">Reservar turno</a>
          </section>

          <section className="account-stats-grid" aria-label="Resumen de Mi Espacio">
            <StatCard
              icon="T"
              tone="blue"
              label="Próximo turno"
              value={nextBooking ? formatDate(nextBooking.appointment_slots?.slot_date) : "Sin turnos"}
              helper={nextBooking ? `${formatTime(nextBooking.appointment_slots?.slot_time)} hs` : "Reserva cuando quieras"}
              href="#turnos"
              action="Ver detalles"
            />
            <StatCard
              icon="C"
              tone="purple"
              label="Cursos activos"
              value={courseCards.length}
              helper={courseCards.length === 1 ? "curso habilitado" : "cursos habilitados"}
              href="#cursos"
              action="Ver mis cursos"
            />
            <StatCard
              icon="%"
              tone="green"
              label="Progreso promedio"
              value={`${averageProgress}%`}
              helper="Sobre cursos habilitados"
              href="#cursos"
              action="Ver progreso"
            />
            <StatCard
              icon="R"
              tone="orange"
              label="Recursos descargados"
              value={approvedDigitalOrders.length}
              helper="Recursos digitales disponibles"
              href="#recursos"
              action="Ver recursos"
            />
          </section>

          <section className="account-panel account-courses-panel" id="cursos">
            <div className="account-panel-head">
              <div>
                <AccountIcon tone="purple">C</AccountIcon>
                <h2>Mis cursos</h2>
              </div>
              <a href="/cursos">Ver todos los cursos</a>
            </div>
            <div className="account-course-tabs" aria-label="Estados de cursos">
              <span className="is-active">Todos</span>
              <span>En progreso</span>
              <span>Completados</span>
              <span>Pendientes</span>
            </div>
            {courseCards.length ? (
              <div className="account-course-grid">
                {courseCards.map((item) => (
                  <article className={`account-course-card is-visual-${item.visual}`} key={item.id}>
                    <div className="account-course-media">
                      <span className={`account-course-status is-${item.tone}`}>{item.state}</span>
                    </div>
                    <div className="account-course-body">
                      <h3>{item.course?.title}</h3>
                      <p>{item.course?.summary || "Curso disponible en tu aula privada."}</p>
                      <div className="account-progress-row">
                        <div className="account-progress-track">
                          <span style={{ width: `${item.progress.percent}%` }} />
                        </div>
                        <strong>{item.progress.percent}%</strong>
                      </div>
                      <div className="account-course-meta">
                      <span>Última lección: {item.progress.lastLessonTitle}</span>
                        <span>{item.progress.completed} de {item.progress.total} clases</span>
                      </div>
                      <div className="account-course-actions">
                        <a href={item.continueUrl}>Continuar</a>
                        {item.progress.percent >= 100 ? <a href="#certificados">Ver certificado</a> : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Todavía no tenés cursos habilitados"
                text="Cuando compres o te habiliten un curso, lo vas a ver en esta sección."
                href="/cursos"
                action="Explorar cursos"
              />
            )}
          </section>

          <div className="account-lower-grid">
            <section className="account-panel" id="turnos">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="blue">T</AccountIcon>
                  <h2>Próximos turnos</h2>
                </div>
                <a href="/turnos">Ver todos</a>
              </div>
              {upcomingBookings.length ? (
                <div className="account-appointment-list">
                  {upcomingBookings.slice(0, 3).map((booking) => (
                    <article className="account-appointment-card" key={booking.id}>
                      <span className="account-avatar small">{initialsFromName(booking.appointment_specialists?.name)}</span>
                      <div>
                        <strong>{booking.appointment_specialists?.session || "Sesión individual"}</strong>
                        <span>{booking.appointment_specialists?.name || "Profesional LUMEN"}</span>
                      </div>
                      <div>
                        <strong>{formatDate(booking.appointment_slots?.slot_date)}</strong>
                        <span>{formatTime(booking.appointment_slots?.slot_time)} hs</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="No tenés turnos próximos" text="Podés reservar un nuevo turno cuando lo necesites." href="/turnos" action="Reservar turno" />
              )}
              <a className="account-wide-action" href="/turnos">Reservar nuevo turno</a>

              <div className="account-subsection">
                <h3>Historial de turnos</h3>
                {pastBookings.length ? (
                  <div className="account-history-list">
                    {pastBookings.slice(0, 4).map((booking) => (
                      <article key={booking.id}>
                        <span>{booking.status}</span>
                        <strong>{booking.appointment_specialists?.name || "Profesional"}</strong>
                        <small>{formatDate(booking.appointment_slots?.slot_date)} · {formatTime(booking.appointment_slots?.slot_time)} hs</small>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="account-muted">Todavía no hay turnos en el historial.</p>
                )}
              </div>
            </section>

            <section className="account-panel">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="green">A</AccountIcon>
                  <h2>Actividad reciente</h2>
                </div>
                <a href="#inicio">Ver actividad</a>
              </div>
              {recentActivity.length ? (
                <div className="account-activity-list">
                  {recentActivity.map((item) => (
                    <article key={item.id}>
                      <AccountIcon tone="blue">{item.icon}</AccountIcon>
                      <p>{item.text}</p>
                      <span>{formatDateTime(item.date)}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="Todavía no hay actividad reciente" text="A medida que uses la plataforma, tus movimientos importantes van a aparecer acá." />
              )}
            </section>
          </div>

          <section className="account-panel" id="recursos">
            <div className="account-panel-head">
              <div>
                <AccountIcon tone="orange">R</AccountIcon>
                <h2>Mis recursos</h2>
              </div>
              <a href="/catalogo">Ir al catálogo</a>
            </div>
            {approvedDigitalOrders.length ? (
              <div className="account-resource-grid">
                {approvedDigitalOrders.map((order) => (
                  <article className="account-resource-card" key={order.id}>
                    <span>{order.status}</span>
                    <h3>{order.catalog_products?.title}</h3>
                    <p>{order.catalog_products?.summary || "Recurso digital disponible en tu cuenta."}</p>
                    <small>{order.catalog_products?.digital_file_name || order.catalog_products?.digital_url || "Recurso pendiente de descarga"}</small>
                    <strong>{formatPrice(order.amount)}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Todavía no tenés recursos digitales disponibles"
                text="Cuando compres un recurso digital y el pago esté aprobado, va a aparecer acá."
                href="/catalogo"
                action="Ir al catálogo"
              />
            )}
          </section>

          <div className="account-lower-grid">
            <section className="account-panel" id="pedidos">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="blue">P</AccountIcon>
                  <h2>Mis pedidos</h2>
                </div>
              </div>
              {(digitalOrders || []).length ? (
                <div className="account-history-list">
                  {(digitalOrders || []).map((order) => (
                    <article key={order.id}>
                      <span>{order.status}</span>
                      <strong>{order.catalog_products?.title || "Pedido"}</strong>
                      <small>{formatPrice(order.amount)} · {formatDateTime(order.created_at)}</small>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="Todavía no tenés pedidos" text="Cuando solicites un producto o recurso, el seguimiento va a aparecer acá." href="/catalogo" action="Explorar catálogo" />
              )}
            </section>

            <section className="account-panel" id="certificados">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="purple">D</AccountIcon>
                  <h2>Certificados</h2>
                </div>
              </div>
              <EmptyState
                title="Certificados en preparacion"
                text="Cuando un curso tenga certificado habilitado y lo completes, vas a poder verlo desde aca."
              />
            </section>
          </div>

          <section className="account-panel" id="configuracion">
            <div className="account-panel-head">
              <div>
                <AccountIcon tone="green">S</AccountIcon>
                <h2>Configuración</h2>
              </div>
            </div>
            <div className="account-profile-grid">
              <div>
                <span>Email</span>
                <strong>{userData.user.email}</strong>
              </div>
              <div>
                <span>Nombre</span>
                <strong>{profile?.full_name || "Sin nombre cargado"}</strong>
              </div>
              <div>
                <span>Rol</span>
                <strong>{profile?.role || "student"}</strong>
              </div>
              <div>
                <span>Fecha de creación</span>
                <strong>{formatDateTime(profile?.created_at || userData.user.created_at)}</strong>
              </div>
            </div>
            <p className="account-muted">Por ahora esta información es de solo lectura.</p>
          </section>
        </div>
    </AccountDashboardShell>
  );
}
