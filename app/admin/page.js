import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";

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
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("id,slug,title,summary,description,cover_image_url,intro_video_url,instructor,level,total_duration,category,price,status,featured,display_order,learning_outcomes,audience,requirements,faq,created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("course_modules")
      .select("id,title,description,position,status,courses:course_id (id,title,slug)")
      .order("position", { ascending: true }),
    supabase.from("profiles").select("id,full_name,email,role,created_at").order("created_at", { ascending: false }),
    supabase
      .from("enrollments")
      .select("id,created_at,profiles:user_id (id,full_name,email),courses:course_id (id,title,slug)")
      .order("created_at", { ascending: false }),
    supabase
      .from("lessons")
      .select("id,title,description,video_url,duration_minutes,position,status,is_preview,objectives,courses:course_id (id,title,slug),course_modules:module_id (id,title)")
      .order("position", { ascending: true }),
    supabase
      .from("course_materials")
      .select("id,title,file_name,file_type,file_size,material_type,external_url,status,position,courses:course_id (id,title,slug),lessons:lesson_id (id,title)")
      .order("position", { ascending: true }),
    supabase
      .from("appointment_specialists")
      .select("id,name,role,professional_license,focus,short_bio,education,years_experience,duration_minutes,session,price,status,display_order,slug,photo_url,created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("appointment_slots")
      .select("id,slot_date,slot_time,status,appointment_specialists:specialist_id (id,name)")
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true }),
    supabase
      .from("appointment_bookings")
      .select("id,patient_email,patient_name,status,created_at,appointment_specialists:specialist_id (name),appointment_slots:slot_id (slot_date,slot_time)")
      .order("created_at", { ascending: false }),
    supabase
      .from("catalog_products")
      .select("id,title,product_type,category,summary,price,stock,status,digital_url,digital_file_name,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("catalog_orders")
      .select("id,customer_email,customer_name,product_type,amount,status,created_at,shipping_province,shipping_city,shipping_postal_code,shipping_street,shipping_number,catalog_products:product_id (title)")
      .order("created_at", { ascending: false }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const bookings = appointmentBookings || [];
  const todayBookings = bookings.filter((booking) => booking.appointment_slots?.slot_date === today);
  const futureBookings = bookings
    .filter((booking) => booking.appointment_slots?.slot_date >= today && booking.status !== "cancelled")
    .sort((a, b) => bookingSortValue(a).localeCompare(bookingSortValue(b)));
  const latestBookings = bookings.slice(0, 5);
  const activeProfessionals = (specialists || []).filter((specialist) => specialist.status === "active");
  const inactiveProfessionals = (specialists || []).filter((specialist) => specialist.status === "inactive");
  const publishedCourses = (courses || []).filter((course) => course.status === "published");
  const draftCourses = (courses || []).filter((course) => course.status === "draft");
  const activeProducts = (catalogProducts || []).filter((product) => product.status === "published");
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
    productsWithoutStock.length ? `${productsWithoutStock.length} productos fisicos publicados sin stock.` : "",
    draftCourses.length ? `${draftCourses.length} cursos en borrador.` : "",
    inactiveProfessionals.length ? `${inactiveProfessionals.length} profesionales inactivos.` : "",
    orphanBookings.length ? `${orphanBookings.length} reservas sin profesional asociado.` : "",
  ].filter(Boolean);

  return (
    <main className="section">
      <div className="dashboard-shell">
        <div className="section-head">
          <p className="eyebrow">Panel admin</p>
          <h1>Gestión LUMEN</h1>
          <p className="lead">
            Bienvenido al panel de administracion de LUMEN. Gestiona turnos, profesionales, cursos, catalogo y contenidos desde un solo lugar.
          </p>
          {params?.error ? <p className="notice error">{params.error}</p> : null}
          {params?.message ? <p className="notice success">{params.message}</p> : null}
        </div>

        <section className="admin-dashboard" id="dashboard">
          <div className="admin-metrics-grid">
            <MetricCard label="Turnos de hoy" value={todayBookings.length} helper="Reservas para la fecha actual" href="#turnos" />
            <MetricCard label="Proximos turnos" value={futureBookings.length} helper="Reservas futuras confirmadas" href="#turnos" />
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
            <DashboardList title="Proximos turnos" emptyText="No hay turnos proximos registrados.">
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

            <DashboardList title="Ultimas reservas" emptyText="Todavia no hay reservas creadas.">
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

            <DashboardList title="Ultimos usuarios registrados" emptyText="Todavia no hay usuarios registrados.">
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

            <DashboardList title="Cursos recientes" emptyText="Todavia no hay cursos cargados.">
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

            <DashboardList title="Productos recientes" emptyText="Todavia no hay productos cargados.">
              {recentProducts.length ? (
                <div className="admin-dashboard-items">
                  {recentProducts.map((product) => (
                    <article key={product.id}>
                      <strong>{product.title}</strong>
                      <span>{product.product_type === "digital" ? "Digital" : "Fisico"} - {formatPrice(product.price)}</span>
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

        <nav className="admin-tabs" aria-label="Secciones admin">
          <a href="#dashboard">Dashboard</a>
          <a href="#turnos">Turnos</a>
          <a href="#catalogo">Catalogo</a>
          <a href="#cursos">Cursos</a>
          <a href="#contenido">Contenido</a>
          <a href="#inscripciones">Inscripciones</a>
        </nav>

        <section className="admin-section" id="turnos">
          <div className="admin-section-head">
            <p className="eyebrow">Turnos</p>
            <h2>Especialistas, disponibilidad y reservas</h2>
          </div>

        <div className="admin-layout">
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
                    <small>{specialist.focus || "Sin enfoque cargado"}</small>
                  </div>
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

        <section className="panel spaced-panel">
          <h2>Reservas confirmadas</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Especialista</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointmentBookings?.length ? appointmentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.patient_name || booking.patient_email}</td>
                  <td>{booking.appointment_specialists?.name}</td>
                  <td>{booking.appointment_slots?.slot_date ? new Date(`${booking.appointment_slots.slot_date}T00:00:00`).toLocaleDateString("es-AR") : ""}</td>
                  <td>{booking.appointment_slots?.slot_time?.slice(0, 5)}</td>
                  <td>{booking.status}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">Todavia no hay reservas confirmadas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        </section>

        <section className="admin-section" id="catalogo">
          <div className="admin-section-head">
            <p className="eyebrow">Catalogo</p>
            <h2>Productos fisicos y digitales</h2>
          </div>

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
                Archivo digital opcional
                <input
                  name="digitalFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.zip"
                />
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
                  <small>
                    {product.status} - {product.category}
                    {product.product_type === "digital" && product.digital_file_name ? ` - Archivo: ${product.digital_file_name}` : ""}
                    {product.product_type === "digital" && !product.digital_file_name && product.digital_url ? " - URL cargada" : ""}
                  </small>
                </article>
              )) : (
                <p className="muted">Todavia no hay productos cargados.</p>
              )}
            </div>
          </section>
        </div>

        <section className="panel spaced-panel">
          <h2>Solicitudes de compra</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Total</th>
                <th>Envio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {catalogOrders?.length ? catalogOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.customer_name || order.customer_email}</td>
                  <td>{order.catalog_products?.title}</td>
                  <td>{order.product_type === "digital" ? "Digital" : "Fisico"}</td>
                  <td>{formatPrice(order.amount)}</td>
                  <td>
                    {order.product_type === "physical"
                      ? `${order.shipping_street || ""} ${order.shipping_number || ""}, ${order.shipping_city || ""}, ${order.shipping_province || ""} (${order.shipping_postal_code || ""})`
                      : "Entrega digital"}
                  </td>
                  <td>{order.status}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6">Todavia no hay solicitudes de compra.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        </section>

        <section className="admin-section" id="cursos">
          <div className="admin-section-head">
            <p className="eyebrow">Cursos</p>
            <h2>Constructor academico</h2>
          </div>

        <div className="admin-layout spaced-panel">
          <section className="panel">
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
                Descripcion completa
                <textarea name="description" rows="5" placeholder="Descripcion larga para la landing del curso" />
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

          <section className="panel">
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
                Descripcion
                <textarea name="description" rows="3" placeholder="Breve descripcion del modulo" />
              </label>
              <button className="button" type="submit">Guardar modulo</button>
            </form>
          </section>
        </div>

        <div className="admin-layout spaced-panel">
          <section className="panel">
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
                Descripcion
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
          <section className="panel">
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
        </section>

        <section className="admin-section" id="contenido">
          <div className="admin-section-head">
            <p className="eyebrow">Contenido</p>
            <h2>Materiales y lecciones cargadas</h2>
          </div>

        <div className="admin-layout spaced-panel">
          <section className="panel">
            <h2>Modulos cargados</h2>
            <div className="compact-list">
              {courseModules?.length ? courseModules.map((moduleItem) => (
                <article key={moduleItem.id}>
                  <strong>{moduleItem.position}. {moduleItem.title}</strong>
                  <span>{moduleItem.courses?.title}</span>
                  <small>{moduleItem.status} - {moduleItem.description || "Sin descripcion"}</small>
                </article>
              )) : (
                <p className="muted">Todavia no hay modulos cargados.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <h2>Materiales cargados</h2>
            <div className="compact-list">
              {materials?.length ? materials.map((material) => (
                <article key={material.id}>
                  <strong>{material.position}. {material.title}</strong>
                  <span>{material.courses?.title}{material.lessons?.title ? ` - ${material.lessons.title}` : ""}</span>
                  <small>{material.status} - {material.material_type} - {material.file_name || material.external_url || "Sin archivo"}</small>
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
                  <span>{lesson.courses?.title}{lesson.course_modules?.title ? ` - ${lesson.course_modules.title}` : ""}</span>
                  <small>{lesson.status} - {lesson.duration_minutes || 0} min - {lesson.video_url || "Sin video"}</small>
                </article>
              )) : (
                <p className="muted">Todavía no hay lecciones cargadas.</p>
              )}
            </div>
          </section>
        </div>
        </section>

        <section className="panel spaced-panel" id="inscripciones">
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
                  <td>
                    <form className="inline-actions" action="/admin/courses/action" method="post">
                      <input name="courseId" type="hidden" value={course.id} />
                      <button name="action" value={course.status === "published" ? "unpublish" : "publish"} type="submit">
                        {course.status === "published" ? "Despublicar" : "Publicar"}
                      </button>
                      <button name="action" value="duplicate" type="submit">Duplicar</button>
                      <button name="action" value="archive" type="submit">Archivar</button>
                      <button name="action" value="delete" type="submit">Eliminar</button>
                    </form>
                  </td>
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
