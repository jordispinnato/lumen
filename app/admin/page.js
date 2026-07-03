import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";
import AdminCmsShell from "./AdminCmsShell";
import AdminConfirmButton from "./AdminConfirmButton";
import EntityTable from "./cms/EntityTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  return value?.slice(0, 5) || "Sin hora";
}

function getOrderStatusLabel(status) {
  const labels = {
    pending_payment: "Pendiente de pago",
    paid: "Pagado",
    cancelled: "Cancelado",
    delivered: "Entregado",
  };

  return labels[status] || status || "Sin estado";
}

function getOrderTypeLabel(type) {
  return type === "digital" ? "Digital" : "Físico";
}

function getProductTypeLabel(type) {
  return type === "digital" ? "Digital" : "Fisico";
}

function getProductAvailability(product) {
  if (product.product_type === "physical") {
    return Number(product.stock || 0) > 0 ? `Stock: ${product.stock}` : "Sin stock";
  }

  if (product.digital_file_name) {
    return `Archivo: ${product.digital_file_name}`;
  }

  if (product.digital_url) {
    return "URL digital cargada";
  }

  return "Sin archivo digital";
}

function getShippingSummary(order) {
  if (order.product_type !== "physical") {
    return "Entrega digital";
  }

  const address = [
    `${order.shipping_street || ""} ${order.shipping_number || ""}`.trim(),
    order.shipping_floor_apartment ? `Piso/depto ${order.shipping_floor_apartment}` : "",
    order.shipping_city,
    order.shipping_province,
    order.shipping_postal_code ? `CP ${order.shipping_postal_code}` : "",
  ].filter(Boolean);

  const base = address.length ? address.join(", ") : "Direccion pendiente";
  return order.shipping_phone ? `${base} - Tel: ${order.shipping_phone}` : base;
}

function buildAdminTimeOptions() {
  const options = [];

  for (let hour = 8; hour <= 20; hour += 1) {
    [0, 30].forEach((minute) => {
      if (hour === 20 && minute > 0) {
        return;
      }

      options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    });
  }

  return options;
}

function bookingSortValue(booking) {
  return `${booking.appointment_slots?.slot_date || ""} ${booking.appointment_slots?.slot_time || ""}`;
}

function MetricCard({ label, value, helper, href }) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </>
  );

  return href ? (
    <a className="admin-metric-card" href={href}>
      {content}
    </a>
  ) : (
    <article className="admin-metric-card">{content}</article>
  );
}

function DashboardList({ title, children, emptyText }) {
  return (
    <section className="panel admin-dashboard-list">
      <h2>{title}</h2>
      {children || <p className="muted">{emptyText}</p>}
    </section>
  );
}

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

  const dataSupabase = createSupabaseAdminClient() || supabase;

  const [
    { data: courses },
    { data: courseModules },
    { data: profiles },
    { data: enrollments },
    { data: lessons },
    { data: materials },
    { data: specialists },
    { data: appointmentSlots },
    { data: appointmentBookings },
    { data: catalogProducts },
    { data: catalogOrders },
    { data: specialistCalendarConnections },
  ] = await Promise.all([
    dataSupabase
      .from("courses")
      .select("id,slug,title,summary,description,cover_image_url,intro_video_url,instructor,level,total_duration,category,price,status,featured,display_order,learning_outcomes,audience,requirements,faq,created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    dataSupabase
      .from("course_modules")
      .select("id,title,description,position,status,courses:course_id (id,title,slug)")
      .order("position", { ascending: true }),
    dataSupabase.from("profiles").select("id,full_name,email,role,created_at").order("created_at", { ascending: false }),
    dataSupabase
      .from("enrollments")
      .select("id,user_id,course_id,created_at")
      .order("created_at", { ascending: false }),
    dataSupabase
      .from("lessons")
      .select("id,title,description,video_url,duration_minutes,position,status,is_preview,objectives,courses:course_id (id,title,slug),course_modules:module_id (id,title)")
      .order("position", { ascending: true }),
    dataSupabase
      .from("course_materials")
      .select("id,title,file_name,file_type,file_size,material_type,external_url,status,position,courses:course_id (id,title,slug),lessons:lesson_id (id,title)")
      .order("position", { ascending: true }),
    dataSupabase
      .from("appointment_specialists")
      .select("id,user_id,name,role,professional_license,professional_email,focus,short_bio,education,years_experience,duration_minutes,session,price,status,display_order,slug,photo_url,created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    dataSupabase
      .from("appointment_slots")
      .select("id,slot_date,slot_time,status,appointment_specialists:specialist_id (id,name)")
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true }),
    dataSupabase
      .from("appointment_bookings")
      .select("id,user_id,slot_id,patient_email,patient_name,status,created_at,appointment_specialists:specialist_id (name),appointment_slots:slot_id (slot_date,slot_time)")
      .order("created_at", { ascending: false }),
    dataSupabase
      .from("catalog_products")
      .select("id,title,product_type,category,summary,price,stock,status,digital_url,digital_file_name,digital_file_path,created_at")
      .order("created_at", { ascending: false }),
    dataSupabase
      .from("catalog_orders")
      .select("id,user_id,customer_email,customer_name,product_type,amount,status,created_at,shipping_province,shipping_city,shipping_postal_code,shipping_street,shipping_number,shipping_floor_apartment,shipping_phone,shipping_notes,catalog_products:product_id (title)")
      .order("created_at", { ascending: false }),
    dataSupabase
      .from("specialist_calendar_connections")
      .select("specialist_id,google_calendar_email,google_calendar_connected_at,calendar_sync_enabled"),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const adminTimeOptions = buildAdminTimeOptions();
  const adminWeekdays = [
    { value: "1", label: "Lun" },
    { value: "2", label: "Mar" },
    { value: "3", label: "Mié" },
    { value: "4", label: "Jue" },
    { value: "5", label: "Vie" },
    { value: "6", label: "Sáb" },
  ];
  const bookings = appointmentBookings || [];
  const todayBookings = bookings.filter((booking) => booking.appointment_slots?.slot_date === today);
  const futureBookings = bookings
    .filter((booking) => booking.appointment_slots?.slot_date >= today && booking.status !== "cancelled")
    .sort((a, b) => bookingSortValue(a).localeCompare(bookingSortValue(b)));
  const latestBookings = bookings.slice(0, 5);
  const activeProfessionals = (specialists || []).filter((specialist) => specialist.status === "active");
  const inactiveProfessionals = (specialists || []).filter((specialist) => specialist.status === "inactive");
  const profileOptions = (profiles || []).map((item) => ({
    id: item.id,
    label: item.full_name || item.email || item.id,
    email: item.email,
  }));
  const calendarConnectionBySpecialistId = new Map(
    (specialistCalendarConnections || []).map((connection) => [connection.specialist_id, connection])
  );
  const publishedCourses = (courses || []).filter((course) => course.status === "published");
  const draftCourses = (courses || []).filter((course) => course.status === "draft");
  const activeProducts = (catalogProducts || []).filter((product) => product.status === "published");
  const physicalProducts = (catalogProducts || []).filter((product) => product.product_type === "physical");
  const digitalProducts = (catalogProducts || []).filter((product) => product.product_type === "digital");
  const downloadableDigitalProducts = digitalProducts.filter((product) => product.digital_file_name || product.digital_file_path || product.digital_url);
  const pendingCatalogOrders = (catalogOrders || []).filter((order) => order.status === "pending_payment");
  const productsWithoutStock = (catalogProducts || []).filter((product) => {
    return product.product_type === "physical" && product.status === "published" && Number(product.stock || 0) <= 0;
  });
  const orphanBookings = bookings.filter((booking) => !booking.appointment_specialists?.name);
  const recentCourses = [...(courses || [])]
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
    .slice(0, 5);
  const recentProducts = (catalogProducts || []).slice(0, 5);
  const recentProfiles = (profiles || []).slice(0, 5);
  const alerts = [
    productsWithoutStock.length ? `${productsWithoutStock.length} productos físicos publicados sin stock.` : "",
    draftCourses.length ? `${draftCourses.length} cursos en borrador.` : "",
    inactiveProfessionals.length ? `${inactiveProfessionals.length} profesionales inactivos.` : "",
    orphanBookings.length ? `${orphanBookings.length} reservas sin profesional asociado.` : "",
  ].filter(Boolean);
  const bookingRows = bookings.map((booking) => ({
    id: booking.id,
    patient: booking.patient_name || booking.patient_email || "Paciente sin datos",
    professional: booking.appointment_specialists?.name || "Sin profesional",
    date: formatDate(booking.appointment_slots?.slot_date),
    time: formatTime(booking.appointment_slots?.slot_time),
    status: booking.status || "Sin estado",
  }));
  const bookingStatusOptions = [...new Set(bookingRows.map((row) => row.status))].map((value) => ({
    value,
    label: value,
  }));
  const catalogOrderRows = (catalogOrders || []).map((order) => ({
    id: order.id,
    customer: order.customer_name || order.customer_email || "Cliente sin datos",
    product: order.catalog_products?.title || "Producto",
    type: getOrderTypeLabel(order.product_type),
    amount: formatPrice(order.amount || 0),
    shipping: getShippingSummary(order),
    status: getOrderStatusLabel(order.status),
    date: formatDateTime(order.created_at),
    actions: [
      ...(order.status !== "pending_payment"
        ? [
            {
              label: "Marcar pendiente",
              endpoint: "/admin/catalog-orders/action",
              fields: { orderId: order.id, status: "pending_payment" },
              confirmTitle: "Actualizar pedido",
              confirmText: "El pedido volvera a pendiente de pago.",
            },
          ]
        : []),
      ...(order.status !== "paid"
        ? [
            {
              label: "Marcar pagado",
              endpoint: "/admin/catalog-orders/action",
              fields: { orderId: order.id, status: "paid" },
              confirmTitle: "Marcar pedido pagado",
              confirmText: "Si es digital, el recurso quedara disponible en Mi Cuenta.",
            },
          ]
        : []),
      ...(order.status !== "delivered"
        ? [
            {
              label: "Entregado",
              endpoint: "/admin/catalog-orders/action",
              fields: { orderId: order.id, status: "delivered" },
              confirmTitle: "Marcar pedido entregado",
              confirmText: "El pedido quedara como entregado.",
            },
          ]
        : []),
      ...(order.status !== "cancelled"
        ? [
            {
              label: "Cancelar",
              endpoint: "/admin/catalog-orders/action",
              fields: { orderId: order.id, status: "cancelled" },
              confirmTitle: "Cancelar pedido",
              confirmText: "El pedido quedara cancelado.",
            },
          ]
        : []),
    ],
  }));
  const catalogOrderStatusOptions = [...new Set(catalogOrderRows.map((row) => row.status))].map((value) => ({
    value,
    label: value,
  }));
  const courseRows = (courses || []).map((course) => ({
    id: course.id,
    title: course.title,
    price: formatPrice(course.price || 0),
    category: course.category || "Sin categoria",
    status: course.status || "Sin estado",
    actions: [
      {
        label: course.status === "published" ? "Despublicar" : "Publicar",
        endpoint: "/admin/courses/action",
        fields: {
          courseId: course.id,
          action: course.status === "published" ? "unpublish" : "publish",
        },
        confirmTitle: "Confirmar cambio de estado",
        confirmText: `Vas a ${course.status === "published" ? "despublicar" : "publicar"} este curso.`,
      },
      {
        label: "Duplicar",
        endpoint: "/admin/courses/action",
        fields: { courseId: course.id, action: "duplicate" },
        confirmTitle: "Duplicar curso",
        confirmText: "Se creara una copia en borrador.",
      },
      {
        label: "Archivar",
        endpoint: "/admin/courses/action",
        fields: { courseId: course.id, action: "archive" },
        confirmTitle: "Archivar curso",
        confirmText: "El curso quedara archivado.",
      },
      {
        label: "Eliminar",
        endpoint: "/admin/courses/action",
        fields: { courseId: course.id, action: "delete" },
        confirmTitle: "Eliminar curso",
        confirmText: "Esta accion eliminara el curso. Revisa antes de confirmar.",
      },
    ],
  }));
  const courseStatusOptions = [...new Set(courseRows.map((row) => row.status))].map((value) => ({
    value,
    label: value,
  }));
  const profileById = new Map((profiles || []).map((item) => [item.id, item]));
  const courseById = new Map((courses || []).map((course) => [course.id, course]));
  const enrollmentRows = (enrollments || []).map((enrollment) => ({
    id: enrollment.id,
    student: profileById.get(enrollment.user_id)?.email || profileById.get(enrollment.user_id)?.full_name || enrollment.user_id || "Alumno",
    course: enrollment.courses?.title || courseById.get(enrollment.course_id)?.title || "Curso",
    date: formatDateTime(enrollment.created_at),
  }));

  return (
    <AdminCmsShell adminName={profile?.full_name || profile?.email || userData.user.email} adminEmail={profile?.email || userData.user.email}>
      <div className="dashboard-shell admin-cms-inner">
        {params?.error || params?.message ? (
          <div className="admin-global-notice">
            {params?.error ? <p className="notice error">{params.error}</p> : null}
            {params?.message ? <p className="notice success">{params.message}</p> : null}
          </div>
        ) : null}

        <div className="section-head" data-admin-view="dashboard">
          <p className="eyebrow">Panel admin</p>
          <h1>Gestión LUMEN</h1>
          <p className="lead">
            Bienvenido al panel de administracion de LUMEN. Gestiona turnos, profesionales, cursos, catalogo y contenidos desde un solo lugar.
          </p>
        </div>

        <section className="admin-dashboard" id="dashboard" data-admin-view="dashboard">
          <div className="admin-metrics-grid">
            <MetricCard label="Turnos de hoy" value={todayBookings.length} helper="Reservas para la fecha actual" href="#turnos" />
            <MetricCard label="Próximos turnos" value={futureBookings.length} helper="Reservas futuras confirmadas" href="#turnos" />
            <MetricCard label="Profesionales activos" value={activeProfessionals.length} helper="Perfiles disponibles para reservar" href="#turnos" />
            <MetricCard label="Cursos publicados" value={publishedCourses.length} helper="Cursos visibles en la web" href="#cursos" />
            <MetricCard label="Inscripciones" value={enrollments?.length || 0} helper="Accesos habilitados a cursos" href="#inscripciones" />
            <MetricCard label="Productos activos" value={activeProducts.length} helper="Productos publicados del catalogo" href="#catalogo" />
            <MetricCard label="Solicitudes de compra" value={catalogOrders?.length || 0} helper="Pedidos registrados" href="#catalogo" />
            <MetricCard label="Usuarios registrados" value={profiles?.length || 0} helper="Perfiles creados" href="#inscripciones" />
          </div>

          <nav className="admin-quick-actions" aria-label="Accesos rapidos del dashboard">
            <a href="#turnos">Gestionar turnos</a>
            <a href="#turnos">Gestionar profesionales</a>
            <a href="#cursos">Gestionar cursos</a>
            <a href="#catalogo">Gestionar catalogo</a>
            <a href="#inscripciones">Ver inscripciones</a>
            <a href="#contenido">Ver contenido/materiales</a>
          </nav>

          <div className="admin-dashboard-grid">
            <DashboardList title="Próximos turnos" emptyText="No hay turnos próximos registrados.">
              {futureBookings.slice(0, 5).length ? (
                <div className="admin-dashboard-items">
                  {futureBookings.slice(0, 5).map((booking) => (
                    <article key={booking.id}>
                      <strong>{formatDate(booking.appointment_slots?.slot_date)} - {formatTime(booking.appointment_slots?.slot_time)}</strong>
                      <span>{booking.appointment_specialists?.name || "Sin profesional"}</span>
                      <small>{booking.patient_name || booking.patient_email || "Paciente sin datos"} - {booking.status}</small>
                    </article>
                  ))}
                </div>
              ) : null}
            </DashboardList>

            <DashboardList title="Últimas reservas" emptyText="Todavía no hay reservas creadas.">
              {latestBookings.length ? (
                <div className="admin-dashboard-items">
                  {latestBookings.map((booking) => (
                    <article key={booking.id}>
                      <strong>{booking.patient_name || booking.patient_email || "Paciente sin datos"}</strong>
                      <span>{booking.appointment_specialists?.name || "Sin profesional"}</span>
                      <small>{formatDateTime(booking.created_at)} - {booking.status}</small>
                    </article>
                  ))}
                </div>
              ) : null}
            </DashboardList>

            <DashboardList title="Últimos usuarios registrados" emptyText="Todavía no hay usuarios registrados.">
              {recentProfiles.length ? (
                <div className="admin-dashboard-items">
                  {recentProfiles.map((item) => (
                    <article key={item.id}>
                      <strong>{item.email || item.full_name || item.id}</strong>
                      <span>{item.role || "student"}</span>
                      <small>{formatDateTime(item.created_at)}</small>
                    </article>
                  ))}
                </div>
              ) : null}
            </DashboardList>

            <DashboardList title="Cursos recientes" emptyText="Todavía no hay cursos cargados.">
              {recentCourses.length ? (
                <div className="admin-dashboard-items">
                  {recentCourses.map((course) => (
                    <article key={course.id}>
                      <strong>{course.title}</strong>
                      <span>{course.status} - {formatPrice(course.price)}</span>
                      <small>{course.category || "Sin categoria"} - {formatDateTime(course.created_at)}</small>
                    </article>
                  ))}
                </div>
              ) : null}
            </DashboardList>

            <DashboardList title="Productos recientes" emptyText="Todavía no hay productos cargados.">
              {recentProducts.length ? (
                <div className="admin-dashboard-items">
                  {recentProducts.map((product) => (
                    <article key={product.id}>
                      <strong>{product.title}</strong>
                      <span>{product.product_type === "digital" ? "Digital" : "Físico"} - {formatPrice(product.price)}</span>
                      <small>{product.status} - {product.category || "Sin categoria"}</small>
                    </article>
                  ))}
                </div>
              ) : null}
            </DashboardList>

            <DashboardList title="Alertas simples" emptyText="No hay alertas importantes por ahora.">
              {alerts.length ? (
                <div className="admin-alert-list">
                  {alerts.map((alert) => (
                    <p key={alert}>{alert}</p>
                  ))}
                </div>
              ) : null}
            </DashboardList>
          </div>
        </section>

        <section className="admin-section" id="turnos" data-admin-view="turnos">
          <div className="admin-section-head">
            <p className="eyebrow">Turnos</p>
            <h2>Especialistas, disponibilidad y reservas</h2>
          </div>

        <div className="admin-layout">
          <span className="admin-anchor-target" id="profesionales" />
          <section className="panel">
            <h2>Crear o actualizar profesional</h2>
            <form className="admin-form" action="/admin/specialists/create" method="post" encType="multipart/form-data">
              <label>
                Nombre y apellido
                <input name="name" required placeholder="Ej: Lic. Valentina Rivas" />
              </label>
              <label>
                Profesion
                <input name="role" required defaultValue="Psicologia" />
              </label>
              <label>
                Matricula
                <input name="professionalLicense" placeholder="Ej: M.P. 12345" />
              </label>
              <label>
                Slug unico
                <input name="slug" placeholder="ej: valentina-rivas" />
              </label>
              <label>
                Foto de perfil
                <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
              </label>
              <label>
                Orden
                <input name="displayOrder" type="number" min="0" step="1" defaultValue="100" />
              </label>
              <label className="wide-field">
                Enfoque
                <textarea name="focus" rows="3" placeholder="Ej: Ansiedad, estres y acompanamiento en crisis" />
              </label>
              <label className="wide-field">
                Biografia corta
                <textarea name="shortBio" rows="3" placeholder="Texto breve para la card y el perfil publico" />
              </label>
              <label className="wide-field">
                Formacion
                <textarea name="education" rows="3" placeholder="Formacion relevante, si corresponde" />
              </label>
              <label>
                Anos de experiencia
                <input name="yearsExperience" type="number" min="0" step="1" placeholder="5" />
              </label>
              <label>
                Duracion en minutos
                <input name="durationMinutes" type="number" min="0" step="5" placeholder="50" />
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
              <label className="wide-field">
                Usuario vinculado
                <select name="userId" defaultValue="">
                  <option value="">Sin usuario vinculado</option>
                  {profileOptions.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wide-field">
                Email profesional para avisos
                <input name="professionalEmail" type="email" placeholder="especialista@lumen.com" />
              </label>
              <button className="button" type="submit">Guardar especialista</button>
            </form>
            <p className="muted">
              Si repetis un slug existente, el perfil se actualiza. Si no cargas foto nueva, conserva la foto actual.
            </p>
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
                Desde
                <input name="slotStartDate" type="date" required defaultValue={today} />
              </label>
              <label>
                Hasta
                <input name="slotEndDate" type="date" required defaultValue={today} />
              </label>
              <fieldset className="admin-fieldset wide-field">
                <legend>Días de atención</legend>
                <div className="admin-checkbox-grid compact">
                  {adminWeekdays.map((weekday) => (
                    <label className="check-field" key={weekday.value}>
                      <input name="weekdays" type="checkbox" value={weekday.value} defaultChecked={weekday.value !== "6"} />
                      {weekday.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="admin-fieldset wide-field">
                <legend>Horarios</legend>
                <div className="admin-checkbox-grid">
                  {adminTimeOptions.map((timeOption) => (
                    <label className="check-field" key={timeOption}>
                      <input name="slotTimes" type="checkbox" value={timeOption} />
                      {timeOption}
                    </label>
                  ))}
                </div>
                <p className="muted">Podés seleccionar varios horarios. Los sábados solo se guardan horarios hasta las 13:00.</p>
              </fieldset>
              <details className="wide-field admin-secondary-details">
                <summary>Cargar un solo horario</summary>
                <div className="admin-form nested-form">
                  <label>
                    Día
                    <input name="slotDate" type="date" defaultValue={today} />
                  </label>
                  <label>
                    Horario
                    <input name="slotTime" type="time" min="08:00" max="20:00" step="900" />
                  </label>
                </div>
              </details>
              <label>
                Estado
                <select name="status" defaultValue="available">
                  <option value="available">Disponible</option>
                  <option value="blocked">Bloqueado</option>
                  <option value="booked">Reservado</option>
                </select>
              </label>
              <button className="button" type="submit">Guardar horarios</button>
            </form>
            <p className="muted">
              Horarios permitidos: lunes a viernes de 08:00 a 20:00 y sábados de 08:00 a 13:00.
            </p>
          </section>
        </div>

        <div className="admin-layout spaced-panel">
          <section className="panel">
            <h2>Especialistas cargados</h2>
            <div className="professional-admin-list">
              {specialists?.length ? specialists.map((specialist) => (
                <article className="professional-admin-card" key={specialist.id}>
                  {specialist.photo_url ? (
                    <img alt="" src={specialist.photo_url} />
                  ) : (
                    <span className="professional-avatar" aria-hidden="true">{specialist.name?.slice(0, 1) || "L"}</span>
                  )}
                  <div>
                    <strong>{specialist.name}</strong>
                    <span>{specialist.role} - {formatPrice(specialist.price)}</span>
                    <small>
                      {specialist.status} - {specialist.professional_license || "Sin matricula"} - {specialist.slug || "Sin slug"}
                    </small>
                    <small>
                      Usuario: {profileOptions.find((item) => item.id === specialist.user_id)?.label || "Sin usuario vinculado"}
                    </small>
                    <small>
                      Calendar: {calendarConnectionBySpecialistId.get(specialist.id)?.google_calendar_connected_at
                        ? calendarConnectionBySpecialistId.get(specialist.id)?.google_calendar_email || "Conectado"
                        : "Sin conectar"}
                    </small>
                    <small>{specialist.focus || "Sin enfoque cargado"}</small>
                  </div>
                  <details className="admin-inline-editor">
                    <summary>Editar especialista</summary>
                    <form className="admin-form" action="/admin/specialists/create" method="post" encType="multipart/form-data">
                      <input name="specialistId" type="hidden" defaultValue={specialist.id} />
                      <label>
                        Nombre y apellido
                        <input name="name" required defaultValue={specialist.name || ""} />
                      </label>
                      <label>
                        Profesion
                        <input name="role" required defaultValue={specialist.role || "Psicologia"} />
                      </label>
                      <label>
                        Matricula
                        <input name="professionalLicense" defaultValue={specialist.professional_license || ""} />
                      </label>
                      <label>
                        Slug unico
                        <input name="slug" required defaultValue={specialist.slug || ""} />
                      </label>
                      <label>
                        Foto de perfil
                        <input name="photo" type="file" accept="image/png,image/jpeg,image/webp" />
                      </label>
                      <label>
                        Orden
                        <input name="displayOrder" type="number" min="0" step="1" defaultValue={specialist.display_order || 100} />
                      </label>
                      <label className="wide-field">
                        Enfoque
                        <textarea name="focus" rows="3" defaultValue={specialist.focus || ""} />
                      </label>
                      <label className="wide-field">
                        Biografia corta
                        <textarea name="shortBio" rows="3" defaultValue={specialist.short_bio || ""} />
                      </label>
                      <label className="wide-field">
                        Formacion
                        <textarea name="education" rows="3" defaultValue={specialist.education || ""} />
                      </label>
                      <label>
                        Anos de experiencia
                        <input name="yearsExperience" type="number" min="0" step="1" defaultValue={specialist.years_experience || ""} />
                      </label>
                      <label>
                        Duracion en minutos
                        <input name="durationMinutes" type="number" min="0" step="5" defaultValue={specialist.duration_minutes || ""} />
                      </label>
                      <label>
                        Sesion
                        <input name="session" required defaultValue={specialist.session || "Consulta online de 50 minutos"} />
                      </label>
                      <label>
                        Precio en ARS
                        <input name="price" type="number" min="0" step="1" required defaultValue={specialist.price || 0} />
                      </label>
                      <label>
                        Estado
                        <select name="status" defaultValue={specialist.status || "active"}>
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                        </select>
                      </label>
                      <label className="wide-field">
                        Usuario vinculado
                        <select name="userId" defaultValue={specialist.user_id || ""}>
                          <option value="">Sin usuario vinculado</option>
                          {profileOptions.map((item) => (
                            <option value={item.id} key={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="wide-field">
                        Email profesional para avisos
                        <input name="professionalEmail" type="email" defaultValue={specialist.professional_email || ""} />
                      </label>
                      <button className="button" type="submit">Guardar cambios</button>
                    </form>
                    <p className="muted">Si no cargás una foto nueva, se conserva la foto actual.</p>
                  </details>
                </article>
              )) : (
                <p className="muted">Todavía no hay especialistas cargados.</p>
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
                  <details className="admin-inline-editor">
                    <summary>Editar horario</summary>
                    <form className="admin-form" action="/admin/appointment-slots/create" method="post">
                      <input name="slotId" type="hidden" defaultValue={slot.id} />
                      <label className="wide-field">
                        Especialista
                        <select name="specialistId" required defaultValue={slot.appointment_specialists?.id || ""}>
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
                        <input name="slotDate" type="date" required defaultValue={slot.slot_date || ""} />
                      </label>
                      <label>
                        Horario
                        <input name="slotTime" type="time" min="08:00" max="20:00" step="900" required defaultValue={slot.slot_time?.slice(0, 5) || ""} />
                      </label>
                      <label>
                        Estado
                        <select name="status" defaultValue={slot.status || "available"}>
                          <option value="available">Disponible</option>
                          <option value="blocked">Bloqueado</option>
                          <option value="booked">Reservado</option>
                        </select>
                      </label>
                      <button className="button" type="submit">Guardar cambios</button>
                    </form>
                  </details>
                </article>
              )) : (
                <p className="muted">Todavía no hay horarios cargados.</p>
              )}
            </div>
          </section>
        </div>

        <section className="panel spaced-panel">
          <EntityTable
            title="Reservas confirmadas"
            description="Listado administrable de reservas creadas."
            columns={[
              { key: "patient", header: "Paciente" },
              { key: "professional", header: "Especialista" },
              { key: "date", header: "Fecha" },
              { key: "time", header: "Horario" },
              { key: "status", header: "Estado", type: "status" },
            ]}
            rows={bookingRows}
            filters={bookingStatusOptions.length ? [{ key: "status", label: "Estado", options: bookingStatusOptions }] : []}
            emptyTitle="Todavía no hay reservas confirmadas."
            emptyText="Cuando se registren turnos, van a aparecer aca."
            searchPlaceholder="Buscar por paciente, profesional o estado"
          />
        </section>
        </section>

        <section className="admin-section" id="catalogo" data-admin-view="catalogo">
          <div className="admin-section-head">
            <p className="eyebrow">Catálogo</p>
            <h2>Productos físicos y digitales</h2>
          </div>

          <div className="admin-catalog-summary">
            <article>
              <span>Productos publicados</span>
              <strong>{activeProducts.length}</strong>
            </article>
            <article>
              <span>Fisicos</span>
              <strong>{physicalProducts.length}</strong>
            </article>
            <article>
              <span>Digitales listos</span>
              <strong>{downloadableDigitalProducts.length}/{digitalProducts.length}</strong>
            </article>
            <article>
              <span>Pedidos pendientes</span>
              <strong>{pendingCatalogOrders.length}</strong>
            </article>
          </div>

          <span className="admin-anchor-target" id="productos" />
          <span className="admin-anchor-target" id="categorias" />
        <div className="admin-layout spaced-panel">
          <section className="panel">
            <h2>Cargar producto de catalogo</h2>
            <form className="admin-form" action="/admin/catalog-products/create" method="post" encType="multipart/form-data">
              <label>
                Nombre
                <input name="title" required placeholder="Ej: Kit de fidgets sensoriales" />
              </label>
              <label>
                Tipo
                <select name="productType" defaultValue="physical">
                  <option value="physical">Físico</option>
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
                Stock físico
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
                Archivo digital opcional
                <input
                  name="digitalFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.zip"
                />
              </label>
              <label className="wide-field">
                Descripción
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
                  <span>{product.product_type === "digital" ? "Digital" : "Físico"} - {formatPrice(product.price)}</span>
                  <small>
                    {product.status} - {product.category}
                    {product.product_type === "digital" && product.digital_file_name ? ` - Archivo: ${product.digital_file_name}` : ""}
                    {product.product_type === "digital" && !product.digital_file_name && product.digital_url ? " - URL cargada" : ""}
                  </small>
                  <small>{getProductTypeLabel(product.product_type)} - {getProductAvailability(product)}</small>
                  <div className="admin-inline-actions">
                    {product.status !== "published" ? (
                      <form action="/admin/catalog-products/action" method="post">
                        <input name="productId" type="hidden" value={product.id} />
                        <button name="action" value="publish" type="submit">Publicar</button>
                      </form>
                    ) : null}
                    {product.status !== "draft" ? (
                      <form action="/admin/catalog-products/action" method="post">
                        <input name="productId" type="hidden" value={product.id} />
                        <button name="action" value="draft" type="submit">Borrador</button>
                      </form>
                    ) : null}
                    {product.status !== "archived" ? (
                      <form action="/admin/catalog-products/action" method="post">
                        <input name="productId" type="hidden" value={product.id} />
                        <button name="action" value="archive" type="submit">Archivar</button>
                      </form>
                    ) : null}
                    <form action="/admin/catalog-products/action" method="post">
                      <input name="productId" type="hidden" value={product.id} />
                      <AdminConfirmButton name="action" value="delete" type="submit" message="Vas a eliminar este producto del catalogo.">
                        Eliminar
                      </AdminConfirmButton>
                    </form>
                  </div>
                  <details className="admin-inline-editor">
                    <summary>Editar producto</summary>
                    <form className="admin-form" action="/admin/catalog-products/create" method="post" encType="multipart/form-data">
                      <input name="productId" type="hidden" defaultValue={product.id} />
                      <label>
                        Nombre
                        <input name="title" required defaultValue={product.title || ""} />
                      </label>
                      <label>
                        Tipo
                        <select name="productType" defaultValue={product.product_type || "physical"}>
                          <option value="physical">Físico</option>
                          <option value="digital">Digital</option>
                        </select>
                      </label>
                      <label>
                        Categoria
                        <input name="category" required defaultValue={product.category || ""} />
                      </label>
                      <label>
                        Precio en ARS
                        <input name="price" type="number" min="0" step="1" required defaultValue={product.price || 0} />
                      </label>
                      <label>
                        Stock físico
                        <input name="stock" type="number" min="0" step="1" defaultValue={product.stock ?? ""} />
                      </label>
                      <label>
                        Estado
                        <select name="status" defaultValue={product.status || "published"}>
                          <option value="published">Publicado</option>
                          <option value="draft">Borrador</option>
                          <option value="archived">Archivado</option>
                        </select>
                      </label>
                      <label className="wide-field">
                        URL digital opcional
                        <input name="digitalUrl" type="url" defaultValue={product.digital_url || ""} />
                      </label>
                      <label className="wide-field">
                        Archivo digital opcional
                        <input
                          name="digitalFile"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.zip"
                        />
                      </label>
                      <label className="wide-field">
                        Descripción
                        <textarea name="summary" rows="4" defaultValue={product.summary || ""} />
                      </label>
                      <button className="button" type="submit">Guardar cambios</button>
                    </form>
                    <p className="muted">Si no subis un archivo nuevo, se conserva el archivo actual.</p>
                  </details>
                </article>
              )) : (
                <p className="muted">Todavía no hay productos cargados.</p>
              )}
            </div>
          </section>
        </div>

        <section className="panel spaced-panel" id="solicitudes">
          <EntityTable
            title="Solicitudes de compra"
            description="Pedidos registrados desde el catalogo."
            columns={[
              { key: "customer", header: "Cliente" },
              { key: "product", header: "Producto" },
              { key: "type", header: "Tipo" },
              { key: "amount", header: "Total" },
              { key: "shipping", header: "Envio" },
              { key: "date", header: "Fecha" },
              { key: "status", header: "Estado", type: "status" },
            ]}
            rows={catalogOrderRows}
            filters={[
              {
                key: "type",
                label: "Tipo",
                options: [
                  { value: "Físico", label: "Físico" },
                  { value: "Digital", label: "Digital" },
                ],
              },
              ...(catalogOrderStatusOptions.length ? [{ key: "status", label: "Estado", options: catalogOrderStatusOptions }] : []),
            ]}
            emptyTitle="Todavía no hay solicitudes de compra."
            emptyText="Cuando una persona solicite un producto, el pedido aparecera aca."
            searchPlaceholder="Buscar por cliente, producto o estado"
          />
        </section>
        </section>

        <section className="admin-section" id="cursos" data-admin-view="cursos modulos lecciones materiales usuarios">
          <div className="admin-section-head">
            <p className="eyebrow">Cursos</p>
            <h2>Constructor academico</h2>
          </div>

          <div className="admin-workflow-guide" data-admin-view="cursos modulos lecciones materiales">
            {[
              ["1", "Curso", "Crea la ficha principal, precio, portada y estado."],
              ["2", "Modulos", "Ordena el programa por bloques o etapas."],
              ["3", "Lecciones", "Agrega videos, duración, objetivos y vista previa."],
              ["4", "Materiales", "Sube PDFs, archivos o links asociados a curso/lección."],
            ].map(([step, title, text]) => (
              <article key={step}>
                <span>{step}</span>
                <strong>{title}</strong>
                <small>{text}</small>
              </article>
            ))}
          </div>

        <div className="admin-layout spaced-panel">
          <section className="panel" data-admin-view="cursos">
            <h2>Crear o actualizar curso</h2>
            <form className="admin-form" action="/admin/courses/create" method="post" encType="multipart/form-data">
              <label>
                Título
                <input name="title" required placeholder="Ej: Crianza y comunicación" />
              </label>
              <label>
                Slug
                <input name="slug" placeholder="ej: crianza-y-comunicacion" />
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
              <label>
                Instructor
                <input name="instructor" placeholder="Ej: Equipo LUMEN" />
              </label>
              <label>
                Nivel
                <input name="level" placeholder="Ej: Inicial" />
              </label>
              <label>
                Duracion total
                <input name="totalDuration" placeholder="Ej: 5 horas" />
              </label>
              <label>
                Categoria
                <input name="category" placeholder="Ej: Psicologia y bienestar" />
              </label>
              <label>
                Orden
                <input name="displayOrder" type="number" min="0" step="1" defaultValue="100" />
              </label>
              <label>
                Portada
                <input name="coverImage" type="file" accept="image/png,image/jpeg,image/webp" />
              </label>
              <label className="wide-field">
                Video de presentacion opcional
                <input name="introVideoUrl" type="url" placeholder="https://..." />
              </label>
              <label className="wide-field">
                Resumen
                <textarea name="summary" rows="4" required placeholder="Descripción breve del curso" />
              </label>
              <label className="wide-field">
                Descripción completa
                <textarea name="description" rows="5" placeholder="Descripción larga para la landing del curso" />
              </label>
              <label className="wide-field">
                Que aprendera
                <textarea name="learningOutcomes" rows="4" placeholder="Un punto por linea" />
              </label>
              <label className="wide-field">
                A quien esta dirigido
                <textarea name="audience" rows="4" placeholder="Un punto por linea" />
              </label>
              <label className="wide-field">
                Requisitos
                <textarea name="requirements" rows="3" placeholder="Un punto por linea" />
              </label>
              <label className="wide-field">
                Preguntas frecuentes
                <textarea name="faq" rows="3" placeholder="Estructura preparada para mas adelante" />
              </label>
              <label className="check-field wide-field">
                <input name="featured" type="checkbox" />
                Curso destacado
              </label>
              <button className="button" type="submit">Guardar curso</button>
            </form>
          </section>

          <section className="panel" data-admin-view="modulos">
            <span className="admin-anchor-target" id="modulos" />
            <h2>Crear o actualizar modulo</h2>
            <form className="admin-form" action="/admin/modules/create" method="post">
              <label className="wide-field">
                Modulo existente opcional
                <select name="moduleId">
                  <option value="">Crear modulo nuevo</option>
                  {courseModules?.map((moduleItem) => (
                    <option value={moduleItem.id} key={moduleItem.id}>
                      {moduleItem.courses?.title} - {moduleItem.title}
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
              <label>
                Orden
                <input name="position" type="number" min="0" step="1" required placeholder="1" />
              </label>
              <label>
                Estado
                <select name="status" defaultValue="published">
                  <option value="published">Publicado</option>
                  <option value="hidden">Oculto</option>
                </select>
              </label>
              <label className="wide-field">
                Titulo del modulo
                <input name="title" required placeholder="Ej: Modulo 1 - Fundamentos" />
              </label>
              <label className="wide-field">
                Descripción
                <textarea name="description" rows="3" placeholder="Breve descripcion del modulo" />
              </label>
              <button className="button" type="submit">Guardar modulo</button>
            </form>
          </section>
        </div>

        <section className="panel spaced-panel" data-admin-view="cursos">
          <h2>Cursos cargados</h2>
          <div className="compact-list">
            {courses?.length ? courses.map((course) => (
              <article key={course.id}>
                <strong>{course.title}</strong>
                <span>{formatPrice(course.price || 0)} - {course.category || "Sin categoria"}</span>
                <small>{course.status || "Sin estado"} - {course.slug || "Sin slug"}</small>
                <details className="admin-inline-editor">
                  <summary>Editar curso</summary>
                  <form className="admin-form" action="/admin/courses/create" method="post" encType="multipart/form-data">
                    <input name="courseId" type="hidden" defaultValue={course.id} />
                    <label>
                      Titulo
                      <input name="title" required defaultValue={course.title || ""} />
                    </label>
                    <label>
                      Slug
                      <input name="slug" required defaultValue={course.slug || ""} />
                    </label>
                    <label>
                      Precio en ARS
                      <input name="price" type="number" min="0" step="1" required defaultValue={course.price || 0} />
                    </label>
                    <label>
                      Estado
                      <select name="status" defaultValue={course.status || "draft"}>
                        <option value="published">Publicado</option>
                        <option value="draft">Borrador</option>
                        <option value="archived">Archivado</option>
                      </select>
                    </label>
                    <label>
                      Instructor
                      <input name="instructor" defaultValue={course.instructor || ""} />
                    </label>
                    <label>
                      Nivel
                      <input name="level" defaultValue={course.level || ""} />
                    </label>
                    <label>
                      Duracion total
                      <input name="totalDuration" defaultValue={course.total_duration || ""} />
                    </label>
                    <label>
                      Categoria
                      <input name="category" defaultValue={course.category || ""} />
                    </label>
                    <label>
                      Orden
                      <input name="displayOrder" type="number" min="0" step="1" defaultValue={course.display_order || 100} />
                    </label>
                    <label>
                      Portada
                      <input name="coverImage" type="file" accept="image/png,image/jpeg,image/webp" />
                    </label>
                    <label className="wide-field">
                      Video de presentacion opcional
                      <input name="introVideoUrl" type="url" defaultValue={course.intro_video_url || ""} />
                    </label>
                    <label className="wide-field">
                      Resumen
                      <textarea name="summary" rows="4" required defaultValue={course.summary || ""} />
                    </label>
                    <label className="wide-field">
                      Descripción completa
                      <textarea name="description" rows="5" defaultValue={course.description || ""} />
                    </label>
                    <label className="wide-field">
                      Que aprendera
                      <textarea name="learningOutcomes" rows="4" defaultValue={course.learning_outcomes || ""} />
                    </label>
                    <label className="wide-field">
                      A quien esta dirigido
                      <textarea name="audience" rows="4" defaultValue={course.audience || ""} />
                    </label>
                    <label className="wide-field">
                      Requisitos
                      <textarea name="requirements" rows="3" defaultValue={course.requirements || ""} />
                    </label>
                    <label className="wide-field">
                      Preguntas frecuentes
                      <textarea name="faq" rows="3" defaultValue={course.faq || ""} />
                    </label>
                    <label className="check-field wide-field">
                      <input name="featured" type="checkbox" defaultChecked={Boolean(course.featured)} />
                      Curso destacado
                    </label>
                    <button className="button" type="submit">Guardar cambios</button>
                  </form>
                  <p className="muted">Si no subis una portada nueva, se conserva la portada actual.</p>
                </details>
              </article>
            )) : (
              <p className="muted">Todavía no hay cursos cargados.</p>
            )}
          </div>
        </section>

        <div className="admin-layout spaced-panel">
          <section className="panel" data-admin-view="lecciones">
            <span className="admin-anchor-target" id="lecciones" />
            <h2>Agregar lección o video</h2>
            <form className="admin-form" action="/admin/lessons/create" method="post">
              <label className="wide-field">
                Leccion existente opcional
                <select name="lessonId">
                  <option value="">Crear leccion nueva</option>
                  {lessons?.map((lesson) => (
                    <option value={lesson.id} key={lesson.id}>
                      {lesson.courses?.title} - {lesson.title}
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
              <label>
                Modulo
                <select name="moduleId">
                  <option value="">Sin modulo</option>
                  {courseModules?.map((moduleItem) => (
                    <option value={moduleItem.id} key={moduleItem.id}>
                      {moduleItem.courses?.title} - {moduleItem.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Orden
                <input name="position" type="number" min="1" step="1" required placeholder="1" />
              </label>
              <label>
                Duracion en minutos
                <input name="durationMinutes" type="number" min="0" step="1" placeholder="20" />
              </label>
              <label>
                Estado
                <select name="status" defaultValue="published">
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                  <option value="hidden">Oculto</option>
                </select>
              </label>
              <label className="wide-field">
                Título de la lección
                <input name="title" required placeholder="Ej: Módulo 1 · Introducción" />
              </label>
              <label className="wide-field">
                Descripción
                <textarea name="description" rows="3" placeholder="Resumen de la clase" />
              </label>
              <label className="wide-field">
                URL del video
                <input name="videoUrl" type="url" placeholder="https://vimeo.com/..." />
              </label>
              <label className="wide-field">
                Objetivos
                <textarea name="objectives" rows="3" placeholder="Un objetivo por linea" />
              </label>
              <label className="check-field wide-field">
                <input name="isPreview" type="checkbox" />
                Clase con vista previa
              </label>
              <button className="button" type="submit">Guardar lección</button>
            </form>
          </section>
        </div>

        <div className="admin-layout spaced-panel">
          <section className="panel" data-admin-view="materiales">
            <span className="admin-anchor-target" id="materiales" />
            <h2>Subir material o link</h2>
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
                Leccion
                <select name="lessonId">
                  <option value="">Material general del curso</option>
                  {lessons?.map((lesson) => (
                    <option value={lesson.id} key={lesson.id}>
                      {lesson.courses?.title} - {lesson.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Orden
                <input name="position" type="number" min="1" step="1" required placeholder="1" />
              </label>
              <label>
                Tipo
                <select name="materialType" defaultValue="file">
                  <option value="file">Archivo</option>
                  <option value="pdf">PDF</option>
                  <option value="audio">Audio</option>
                  <option value="link">Link externo</option>
                </select>
              </label>
              <label>
                Estado
                <select name="status" defaultValue="published">
                  <option value="published">Publicado</option>
                  <option value="hidden">Oculto</option>
                </select>
              </label>
              <label className="wide-field">
                Título del material
                <input name="title" required placeholder="Ej: Guía de trabajo en PDF" />
              </label>
              <label className="wide-field">
                Link externo opcional
                <input name="externalUrl" type="url" placeholder="https://..." />
              </label>
              <label className="wide-field">
                Archivo opcional
                <input
                  name="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.mp3,.wav,.zip"
                />
              </label>
              <button className="button" type="submit">Subir material</button>
            </form>
          </section>

          <section className="panel" data-admin-view="usuarios">
            <span className="admin-anchor-target" id="usuarios" />
            <h2>Usuarios registrados</h2>
            <form className="admin-message-composer" action="/admin/messages/create" method="post">
              <div>
                <h3>Enviar mensaje a usuarios</h3>
                <p className="muted">Para promociones, avisos importantes o novedades generales. Aparece en Mi Espacio, seccion Mensajes.</p>
              </div>
              <label>
                Tipo
                <select name="messageType" defaultValue="promocion">
                  <option value="general">General</option>
                  <option value="promocion">Promocion</option>
                  <option value="curso">Curso</option>
                  <option value="catalogo">Catalogo</option>
                </select>
              </label>
              <label>
                Titulo
                <input name="subject" required placeholder="Ej: Nueva promocion disponible" />
              </label>
              <label className="wide-field">
                Mensaje
                <textarea name="body" rows="3" required placeholder="Escribi el mensaje que van a ver los usuarios." />
              </label>
              <button className="button" type="submit">Enviar a todos</button>
            </form>
            <div className="compact-list">
              {profiles?.length ? profiles.map((item) => {
                const userEnrollments = (enrollments || []).filter((enrollment) => enrollment.user_id === item.id);
                const userBookings = bookings.filter((booking) => booking.user_id === item.id || booking.patient_email === item.email);
                const userOrders = (catalogOrders || []).filter((order) => order.user_id === item.id || order.customer_email === item.email);
                const completedUserBookings = userBookings.filter((booking) => booking.status === "completed").length;
                const cancelledUserBookings = userBookings.filter((booking) => booking.status === "cancelled").length;
                const paidUserOrders = userOrders.filter((order) => order.status === "paid" || order.status === "delivered").length;

                return (
                  <article key={item.id}>
                    <strong>{item.full_name || item.email || "Usuario sin nombre"}</strong>
                    <span>{item.email || "Sin email visible"}</span>
                    <small>
                      Rol: {item.role || "student"} - Cursos: {userEnrollments.length} - Turnos: {userBookings.length} - Pedidos: {userOrders.length}
                    </small>
                    <details className="admin-inline-editor">
                      <summary>Administrar usuario</summary>
                      <div className="admin-user-summary">
                        <div>
                          <span>Cursos</span>
                          <strong>{userEnrollments.length}</strong>
                        </div>
                        <div>
                          <span>Turnos</span>
                          <strong>{userBookings.length}</strong>
                          <small>{completedUserBookings} realizados / {cancelledUserBookings} cancelados</small>
                        </div>
                        <div>
                          <span>Pedidos</span>
                          <strong>{userOrders.length}</strong>
                          <small>{paidUserOrders} pagos o entregados</small>
                        </div>
                      </div>
                      <form className="admin-form" action="/admin/users/update" method="post">
                        <input name="userId" type="hidden" defaultValue={item.id} />
                        <label>
                          Nombre
                          <input name="fullName" defaultValue={item.full_name || ""} placeholder="Nombre y apellido" />
                        </label>
                        <label>
                          Email
                          <input name="email" type="email" defaultValue={item.email || ""} placeholder="usuario@email.com" />
                        </label>
                        <label>
                          Rol
                          <select name="role" defaultValue={item.role || "student"}>
                            <option value="student">Estudiante</option>
                            <option value="specialist">Especialista</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>
                        <button className="button" type="submit">Guardar usuario</button>
                      </form>
                      <div className="admin-user-detail-grid">
                        <section>
                          <h3>Cursos habilitados</h3>
                          <form className="admin-mini-form" action="/admin/enrollments/create" method="post">
                            <input name="userId" type="hidden" value={item.id} />
                            <select name="courseId" required defaultValue="">
                              <option value="">Agregar curso</option>
                              {courses?.map((course) => (
                                <option value={course.id} key={course.id}>
                                  {course.title}
                                </option>
                              ))}
                            </select>
                            <button type="submit">Agregar</button>
                          </form>
                          {userEnrollments.length ? userEnrollments.map((enrollment) => (
                            <form className="admin-mini-row" action="/admin/enrollments/action" method="post" key={enrollment.id}>
                              <input name="enrollmentId" type="hidden" value={enrollment.id} />
                              <input name="action" type="hidden" value="delete" />
                              <span>{enrollment.courses?.title || courseById.get(enrollment.course_id)?.title || "Curso"}</span>
                              <AdminConfirmButton type="submit" message="Vas a quitar este curso del usuario.">
                                Quitar
                              </AdminConfirmButton>
                            </form>
                          )) : <p className="muted">Sin cursos habilitados.</p>}
                        </section>

                        <section>
                          <h3>Turnos</h3>
                          {userBookings.length ? userBookings.map((booking) => (
                            <form className="admin-mini-row" action="/admin/bookings/action" method="post" key={booking.id}>
                              <input name="bookingId" type="hidden" value={booking.id} />
                              <span>
                                {booking.appointment_specialists?.name || "Especialista"} - {formatDate(booking.appointment_slots?.slot_date)} {formatTime(booking.appointment_slots?.slot_time)}
                              </span>
                              <select name="status" defaultValue={booking.status || "confirmed"}>
                                <option value="confirmed">Confirmado</option>
                                <option value="cancelled">Cancelado</option>
                                <option value="completed">Realizado</option>
                              </select>
                              <button type="submit">Guardar</button>
                              <AdminConfirmButton name="action" value="delete" type="submit" message="Vas a eliminar este turno y liberar el horario.">
                                Eliminar
                              </AdminConfirmButton>
                            </form>
                          )) : <p className="muted">Sin turnos registrados.</p>}
                        </section>

                        <section>
                          <h3>Pedidos y recursos</h3>
                          {userOrders.length ? userOrders.map((order) => (
                            <form className="admin-mini-row" action="/admin/catalog-orders/action" method="post" key={order.id}>
                              <input name="orderId" type="hidden" value={order.id} />
                              <span>
                                {order.catalog_products?.title || "Producto"} - {formatPrice(order.amount || 0)}
                              </span>
                              <select name="status" defaultValue={order.status || "pending_payment"}>
                                <option value="pending_payment">Pendiente</option>
                                <option value="paid">Pagado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                              </select>
                              <button type="submit">Guardar</button>
                              <AdminConfirmButton name="action" value="delete" type="submit" message="Vas a eliminar este pedido del usuario.">
                                Eliminar
                              </AdminConfirmButton>
                            </form>
                          )) : <p className="muted">Sin pedidos registrados.</p>}
                        </section>
                      </div>
                    </details>
                  </article>
                );
              }) : (
                <p className="muted">Todavia no hay usuarios registrados.</p>
              )}
            </div>
          </section>

          <section className="panel" data-admin-view="usuarios inscripciones">
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
        </section>

        <section className="admin-section" id="contenido" data-admin-view="contenido modulos materiales lecciones">
          <div className="admin-section-head">
            <p className="eyebrow">Contenido</p>
            <h2>Materiales y lecciones cargadas</h2>
          </div>

        <div className="admin-layout spaced-panel">
          <section className="panel" data-admin-view="contenido modulos">
            <span className="admin-anchor-target" id="biblioteca" />
            <h2>Modulos cargados</h2>
            <div className="compact-list">
              {courseModules?.length ? courseModules.map((moduleItem) => (
                <article key={moduleItem.id}>
                  <strong>{moduleItem.position}. {moduleItem.title}</strong>
                  <span>{moduleItem.courses?.title}</span>
                  <small>{moduleItem.status} - {moduleItem.description || "Sin descripcion"}</small>
                  <details className="admin-inline-editor">
                    <summary>Editar modulo</summary>
                    <form className="admin-form" action="/admin/modules/create" method="post">
                      <input name="moduleId" type="hidden" defaultValue={moduleItem.id} />
                      <label>
                        Curso
                        <select name="courseId" required defaultValue={moduleItem.courses?.id || ""}>
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
                        <input name="position" type="number" min="0" step="1" required defaultValue={moduleItem.position || 0} />
                      </label>
                      <label>
                        Estado
                        <select name="status" defaultValue={moduleItem.status || "published"}>
                          <option value="published">Publicado</option>
                          <option value="hidden">Oculto</option>
                        </select>
                      </label>
                      <label className="wide-field">
                        Titulo del modulo
                        <input name="title" required defaultValue={moduleItem.title || ""} />
                      </label>
                      <label className="wide-field">
                        Descripción
                        <textarea name="description" rows="3" defaultValue={moduleItem.description || ""} />
                      </label>
                      <button className="button" type="submit">Guardar cambios</button>
                    </form>
                    <form className="admin-danger-form" action="/admin/modules/create" method="post">
                      <input name="moduleId" type="hidden" value={moduleItem.id} />
                      <input name="action" type="hidden" value="delete" />
                      <AdminConfirmButton type="submit" message="Vas a eliminar este modulo. Las lecciones asociadas quedaran sin modulo.">
                        Eliminar modulo
                      </AdminConfirmButton>
                    </form>
                  </details>
                </article>
              )) : (
                <p className="muted">Todavía no hay módulos cargados.</p>
              )}
            </div>
          </section>

          <section className="panel" data-admin-view="contenido materiales">
            <h2>Materiales cargados</h2>
            <div className="compact-list">
              {materials?.length ? materials.map((material) => (
                <article key={material.id}>
                  <strong>{material.position}. {material.title}</strong>
                  <span>{material.courses?.title}{material.lessons?.title ? ` - ${material.lessons.title}` : ""}</span>
                  <small>{material.status} - {material.material_type} - {material.file_name || material.external_url || "Sin archivo"}</small>
                  <details className="admin-inline-editor">
                    <summary>Editar material</summary>
                    <form className="admin-form" action="/admin/materials/create" method="post" encType="multipart/form-data">
                      <input name="materialId" type="hidden" defaultValue={material.id} />
                      <label>
                        Curso
                        <select name="courseId" required defaultValue={material.courses?.id || ""}>
                          <option value="">Seleccionar curso</option>
                          {courses?.map((course) => (
                            <option value={course.id} key={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Leccion
                        <select name="lessonId" defaultValue={material.lessons?.id || ""}>
                          <option value="">Material general del curso</option>
                          {lessons?.map((lesson) => (
                            <option value={lesson.id} key={lesson.id}>
                              {lesson.courses?.title} - {lesson.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Orden
                        <input name="position" type="number" min="1" step="1" required defaultValue={material.position || 1} />
                      </label>
                      <label>
                        Tipo
                        <select name="materialType" defaultValue={material.material_type || "file"}>
                          <option value="file">Archivo</option>
                          <option value="pdf">PDF</option>
                          <option value="audio">Audio</option>
                          <option value="link">Link externo</option>
                        </select>
                      </label>
                      <label>
                        Estado
                        <select name="status" defaultValue={material.status || "published"}>
                          <option value="published">Publicado</option>
                          <option value="hidden">Oculto</option>
                        </select>
                      </label>
                      <label className="wide-field">
                        Titulo del material
                        <input name="title" required defaultValue={material.title || ""} />
                      </label>
                      <label className="wide-field">
                        Link externo opcional
                        <input name="externalUrl" type="url" defaultValue={material.external_url || ""} />
                      </label>
                      <label className="wide-field">
                        Archivo opcional
                        <input
                          name="file"
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.mp3,.wav,.zip"
                        />
                      </label>
                      <button className="button" type="submit">Guardar cambios</button>
                    </form>
                    <form className="admin-danger-form" action="/admin/materials/create" method="post">
                      <input name="materialId" type="hidden" value={material.id} />
                      <input name="action" type="hidden" value="delete" />
                      <AdminConfirmButton type="submit" message="Vas a eliminar este material. Si tenia archivo, tambien se intentara quitar del storage.">
                        Eliminar material
                      </AdminConfirmButton>
                    </form>
                    <p className="muted">Si no subis un archivo nuevo, se conserva el archivo actual.</p>
                  </details>
                </article>
              )) : (
                <p className="muted">Todavía no hay materiales cargados.</p>
              )}
            </div>
          </section>

          <section className="panel" data-admin-view="contenido lecciones">
            <h2>Lecciones cargadas</h2>
            <div className="compact-list">
              {lessons?.length ? lessons.map((lesson) => (
                <article key={lesson.id}>
                  <strong>{lesson.position}. {lesson.title}</strong>
                  <span>{lesson.courses?.title}{lesson.course_modules?.title ? ` - ${lesson.course_modules.title}` : ""}</span>
                  <small>{lesson.status} - {lesson.duration_minutes || 0} min - {lesson.video_url || "Sin video"}</small>
                  <details className="admin-inline-editor">
                    <summary>Editar leccion</summary>
                    <form className="admin-form" action="/admin/lessons/create" method="post">
                      <input name="lessonId" type="hidden" defaultValue={lesson.id} />
                      <label>
                        Curso
                        <select name="courseId" required defaultValue={lesson.courses?.id || ""}>
                          <option value="">Seleccionar curso</option>
                          {courses?.map((course) => (
                            <option value={course.id} key={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Modulo
                        <select name="moduleId" defaultValue={lesson.course_modules?.id || ""}>
                          <option value="">Sin modulo</option>
                          {courseModules?.map((moduleItem) => (
                            <option value={moduleItem.id} key={moduleItem.id}>
                              {moduleItem.courses?.title} - {moduleItem.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Orden
                        <input name="position" type="number" min="1" step="1" required defaultValue={lesson.position || 1} />
                      </label>
                      <label>
                        Duracion en minutos
                        <input name="durationMinutes" type="number" min="0" step="1" defaultValue={lesson.duration_minutes || 0} />
                      </label>
                      <label>
                        Estado
                        <select name="status" defaultValue={lesson.status || "published"}>
                          <option value="published">Publicado</option>
                          <option value="draft">Borrador</option>
                          <option value="hidden">Oculto</option>
                        </select>
                      </label>
                      <label className="wide-field">
                        Titulo de la leccion
                        <input name="title" required defaultValue={lesson.title || ""} />
                      </label>
                      <label className="wide-field">
                        Descripción
                        <textarea name="description" rows="3" defaultValue={lesson.description || ""} />
                      </label>
                      <label className="wide-field">
                        URL del video
                        <input name="videoUrl" type="url" defaultValue={lesson.video_url || ""} />
                      </label>
                      <label className="wide-field">
                        Objetivos
                        <textarea name="objectives" rows="3" defaultValue={lesson.objectives || ""} />
                      </label>
                      <label className="check-field wide-field">
                        <input name="isPreview" type="checkbox" defaultChecked={Boolean(lesson.is_preview)} />
                        Clase con vista previa
                      </label>
                      <button className="button" type="submit">Guardar cambios</button>
                    </form>
                    <form className="admin-danger-form" action="/admin/lessons/create" method="post">
                      <input name="lessonId" type="hidden" value={lesson.id} />
                      <input name="action" type="hidden" value="delete" />
                      <AdminConfirmButton type="submit" message="Vas a eliminar esta leccion y sus accesos de progreso asociados.">
                        Eliminar leccion
                      </AdminConfirmButton>
                    </form>
                  </details>
                </article>
              )) : (
                <p className="muted">Todavía no hay lecciones cargadas.</p>
              )}
            </div>
          </section>
        </div>
        </section>

        <section className="panel spaced-panel" data-admin-view="cursos">
          <EntityTable
            title="Cursos"
            description="Gestion comun de cursos con acciones preparadas."
            columns={[
              { key: "title", header: "Titulo" },
              { key: "price", header: "Precio" },
              { key: "category", header: "Categoria" },
              { key: "status", header: "Estado", type: "status" },
            ]}
            rows={courseRows}
            filters={courseStatusOptions.length ? [{ key: "status", label: "Estado", options: courseStatusOptions }] : []}
            emptyTitle="Todavía no existen cursos."
            emptyText="Crea un curso desde el constructor academico."
            searchPlaceholder="Buscar cursos"
          />
        </section>

        <section className="panel spaced-panel" id="inscripciones" data-admin-view="inscripciones usuarios">
          <EntityTable
            title="Inscripciones"
            description="Accesos habilitados a cursos."
            columns={[
              { key: "student", header: "Alumno" },
              { key: "course", header: "Curso" },
              { key: "date", header: "Fecha" },
            ]}
            rows={enrollmentRows}
            emptyTitle="Todavía no hay inscripciones."
            emptyText="Cuando habilites un curso a un alumno, se vera aca."
            searchPlaceholder="Buscar alumno o curso"
          />
        </section>

        <section className="panel spaced-panel" id="configuracion" data-admin-view="configuracion">
          <p className="eyebrow">Configuración</p>
          <h2>Configuración del CMS</h2>
          <p className="muted">
            Esta area queda preparada para futuras opciones administrativas, como pagos, emails, reportes y configuracion avanzada.
          </p>
        </section>
      </div>
    </AdminCmsShell>
  );
}
