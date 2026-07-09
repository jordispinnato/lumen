import { redirect } from "next/navigation";
import ConfirmSubmitButton from "../components/ConfirmSubmitButton";
import BillingDetailsForm from "../components/BillingDetailsForm";
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

function applyReadReceipts(items, receiptSet, itemType) {
  return (items || []).map((item) => ({
    ...item,
    read_at: item.read_at || (receiptSet.has(`${itemType}:${item.id}`) ? "read" : null),
  }));
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

function getCoursePaymentStatusLabel(status) {
  const labels = {
    pending: "Pendiente",
    approved: "Pagado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
  };

  return labels[status] || status || "Sin estado";
}

function getInvoiceStatusLabel(status) {
  const labels = {
    requested: "Solicitada",
    issued: "Emitida",
    cancelled: "Cancelada",
    not_requested: "No solicitada",
  };

  return labels[status] || "No solicitada";
}

function getTaxConditionLabel(value) {
  const labels = {
    consumidor_final: "Consumidor final",
    monotributo: "Monotributo",
    responsable_inscripto: "Responsable inscripto",
    exento: "Exento",
  };

  return labels[value] || "Sin datos";
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

  return address.length ? address.join(", ") : "Dirección pendiente";
}

export default async function MiCuentaPage({ searchParams }) {
  const params = await searchParams;
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
    { data: catalogOrders },
    { data: notifications },
    { data: messages },
    { data: cartItems },
    { data: courseOrders },
    { data: billingProfile },
    { data: invoiceRequests },
    { data: readReceipts },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,phone,role,created_at")
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
        product_type,
        status,
        amount,
        created_at,
        shipping_province,
        shipping_city,
        shipping_postal_code,
        shipping_street,
        shipping_number,
        shipping_floor_apartment,
        catalog_products:product_id (
          id,
          title,
          summary,
          product_type,
          digital_file_name,
          digital_file_path,
          digital_url
        )
      `)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_notifications")
      .select("id,title,body,href,notification_type,read_at,created_at")
      .or(`user_id.eq.${userData.user.id},user_id.is.null`)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_messages")
      .select("id,subject,body,message_type,read_at,created_at")
      .or(`user_id.eq.${userData.user.id},user_id.is.null`)
      .order("created_at", { ascending: false }),
    supabase
      .from("catalog_cart_items")
      .select(`
        id,
        quantity,
        created_at,
        catalog_products:product_id (
          id,
          title,
          summary,
          product_type,
          price
        )
      `)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id,status,amount,created_at,courses:course_id (id,slug,title)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("billing_profiles")
      .select("buyer_type,legal_name,tax_id,tax_condition,billing_email,fiscal_address,province,city,postal_code")
      .eq("user_id", userData.user.id)
      .eq("is_default", true)
      .maybeSingle(),
    supabase
      .from("invoice_requests")
      .select("id,order_id,catalog_order_id,purchase_type,status,invoice_number,invoice_file_url,requested_at,issued_at")
      .eq("user_id", userData.user.id)
      .order("requested_at", { ascending: false }),
    supabase
      .from("user_notification_reads")
      .select("item_type,item_id")
      .eq("user_id", userData.user.id),
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
  const catalogOrderList = catalogOrders || [];
  const courseOrderList = courseOrders || [];
  const invoiceRequestList = invoiceRequests || [];
  const invoiceByCourseOrderId = new Map(invoiceRequestList.filter((item) => item.order_id).map((item) => [item.order_id, item]));
  const invoiceByCatalogOrderId = new Map(invoiceRequestList.filter((item) => item.catalog_order_id).map((item) => [item.catalog_order_id, item]));
  const purchaseRows = [
    ...courseOrderList.map((order) => {
      const invoice = invoiceByCourseOrderId.get(order.id);

      return {
        id: `course-${order.id}`,
        purchaseKey: `course:${order.id}`,
        type: "Curso",
        title: order.courses?.title || "Curso LUMEN",
        date: order.created_at,
        amount: order.amount || 0,
        paymentStatus: getCoursePaymentStatusLabel(order.status),
        invoiceStatus: getInvoiceStatusLabel(invoice?.status),
        invoiceNumber: invoice?.invoice_number,
        canRequestInvoice: order.status === "approved" && !invoice,
        href: order.courses?.slug ? `/aula?curso=${order.courses.slug}` : "/aula",
      };
    }),
    ...catalogOrderList.map((order) => {
      const invoice = invoiceByCatalogOrderId.get(order.id);

      return {
        id: `catalog-${order.id}`,
        purchaseKey: `catalog:${order.id}`,
        type: getOrderTypeLabel(order.product_type),
        title: order.catalog_products?.title || "Producto LUMEN",
        date: order.created_at,
        amount: order.amount || 0,
        paymentStatus: getOrderStatusLabel(order.status),
        invoiceStatus: getInvoiceStatusLabel(invoice?.status),
        invoiceNumber: invoice?.invoice_number,
        canRequestInvoice: ["paid", "delivered"].includes(order.status) && !invoice,
        href: order.catalog_products?.id ? `/catalogo/${order.catalog_products.id}` : "/catalogo",
      };
    }),
  ].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const invoiceEligiblePurchases = purchaseRows.filter((purchase) => purchase.canRequestInvoice);
  const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
  const notificationList = applyReadReceipts(notifications || [], receiptSet, "notification");
  const messageList = applyReadReceipts(messages || [], receiptSet, "message");
  const cartItemList = cartItems || [];
  const pendingAccountAlerts =
    notificationList.filter((item) => !item.read_at).length + messageList.filter((item) => !item.read_at).length;
  const featuredAccountNotice = [
    ...messageList.map((item) => ({
      id: `message-${item.id}`,
      label: item.message_type || "Mensaje",
      title: item.subject,
      body: item.body,
      date: item.created_at,
      href: "#mensajes",
      unread: !item.read_at,
    })),
    ...notificationList.map((item) => ({
      id: `notification-${item.id}`,
      label: item.notification_type || "Notificacion",
      title: item.title,
      body: item.body,
      date: item.created_at,
      href: item.href || "#notificaciones",
      unread: !item.read_at,
    })),
  ]
    .sort((a, b) => {
      if (a.unread !== b.unread) {
        return a.unread ? -1 : 1;
      }

      return String(b.date || "").localeCompare(String(a.date || ""));
    })[0];
  const digitalOrders = catalogOrderList.filter((order) => order.product_type === "digital");
  const approvedDigitalOrders = digitalOrders.filter((order) => order.status === "paid" || order.status === "delivered");
  const profileName = profile?.full_name || userData.user.user_metadata?.full_name || "";
  const profilePhone = profile?.phone || userData.user.user_metadata?.phone || "";
  const displayName = profileName || userData.user.email;
  const firstName = profileName?.split(" ")?.[0] || userData.user.email?.split("@")?.[0] || "LUMEN";
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
    { href: "#compras", icon: "$", label: "Mis compras" },
    { href: "#facturacion", icon: "F", label: "Facturacion" },
    { href: "#carrito", icon: "K", label: "Carrito" },
    { href: "#notificaciones", icon: "N", label: "Notificaciones" },
    { href: "#mensajes", icon: "M", label: "Mensajes" },
    { href: "#certificados", icon: "D", label: "Certificados" },
    { href: "#configuracion", icon: "S", label: "Configuración" },
  ];

  return (
    <AccountDashboardShell
      navItems={navItems}
      displayName={displayName}
      avatarInitials={avatarInitials}
      isAdmin={profile?.role === "admin"}
      notificationCount={pendingAccountAlerts}
      notifications={notificationList}
      messages={messageList}
    >
        <div className="account-dashboard" id="inicio">
          {params?.message ? <p className="notice success">{params.message}</p> : null}
          {params?.error ? <p className="notice error">{params.error}</p> : null}

          <section className="account-hero">
            <div>
              <span className="account-page-kicker">Mi Espacio</span>
              <h1>¡Hola, {firstName}!</h1>
              <p>Bienvenido a tu espacio personal. Aca tenes un resumen de tu actividad.</p>
            </div>
            <a className="account-primary-action" href="/turnos">Reservar turno</a>
          </section>

          {featuredAccountNotice ? (
            <section className={`account-featured-notice${featuredAccountNotice.unread ? " is-unread" : ""}`}>
              <span>{featuredAccountNotice.label}</span>
              <div>
                <h2>{featuredAccountNotice.title}</h2>
                {featuredAccountNotice.body ? <p>{featuredAccountNotice.body}</p> : null}
              </div>
              <a href={featuredAccountNotice.href}>Revisar</a>
            </section>
          ) : null}

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
                        <div className="account-appointment-actions">
                          <a href={`/turnos?reprogramar=${booking.id}`}>Reprogramar</a>
                          <form action="/turnos/cancelar" method="post">
                            <input name="bookingId" type="hidden" value={booking.id} />
                            <input name="reason" type="hidden" value="Cancelado por el paciente desde Mi Espacio" />
                            <ConfirmSubmitButton
                              className="account-danger-action"
                              message="Seguro queres cancelar este turno?"
                              type="submit"
                            >
                              Cancelar
                            </ConfirmSubmitButton>
                          </form>
                        </div>
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
                    {order.catalog_products?.digital_file_name || order.catalog_products?.digital_url ? (
                      <a className="account-secondary-action" href={`/catalogo/resources/${order.id}/download`}>
                        Descargar recurso
                      </a>
                    ) : (
                      <small>La descarga está en preparación.</small>
                    )}
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
            <section className="account-panel" id="compras">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="green">$</AccountIcon>
                  <h2>Mis compras</h2>
                </div>
              </div>
              {purchaseRows.length ? (
                <div className="account-history-list">
                  {purchaseRows.map((purchase) => (
                    <article key={purchase.id}>
                      <span>{purchase.type}</span>
                      <strong>{purchase.title}</strong>
                      <small>
                        {formatPrice(purchase.amount)} - {formatDateTime(purchase.date)}
                      </small>
                      <small>Pago: {purchase.paymentStatus}</small>
                      <small>
                        Factura: {purchase.invoiceStatus}
                        {purchase.invoiceNumber ? ` - ${purchase.invoiceNumber}` : ""}
                      </small>
                      <a className="account-secondary-action" href={purchase.href}>Ver compra</a>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="Todavia no tenes compras" text="Cuando compres cursos, servicios o recursos, el historial va a aparecer aca." href="/cursos" action="Explorar cursos" />
              )}
            </section>

            <section className="account-panel" id="pedidos">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="blue">P</AccountIcon>
                  <h2>Mis pedidos</h2>
                </div>
              </div>
              {catalogOrderList.length ? (
                <div className="account-history-list">
                  {catalogOrderList.map((order) => (
                    <article key={order.id}>
                      <span>{getOrderStatusLabel(order.status)}</span>
                      <strong>{order.catalog_products?.title || "Pedido"}</strong>
                      <small>
                        {getOrderTypeLabel(order.product_type)} · {formatPrice(order.amount)} · {formatDateTime(order.created_at)}
                      </small>
                      <small>{getShippingSummary(order)}</small>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="Todavía no tenés pedidos" text="Cuando solicites un producto o recurso, el seguimiento va a aparecer acá." href="/catalogo" action="Explorar catálogo" />
              )}
            </section>

            <section className="account-panel" id="carrito">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="orange">K</AccountIcon>
                  <h2>Carrito</h2>
                </div>
                <a href="/catalogo">Ir al catalogo</a>
              </div>
              {cartItemList.length ? (
                <div className="account-history-list">
                  {cartItemList.map((item) => (
                    <article key={item.id}>
                      <span>{item.catalog_products?.product_type === "digital" ? "Digital" : "Fisico"}</span>
                      <strong>{item.catalog_products?.title || "Producto"}</strong>
                      <small>Cantidad: {item.quantity} Â· {formatPrice((item.catalog_products?.price || 0) * item.quantity)}</small>
                      <a className="account-secondary-action" href={`/catalogo/${item.catalog_products?.id}`}>Ver producto</a>
                      <form action="/catalogo/cart/remove" method="post">
                        <input name="cartItemId" type="hidden" value={item.id} />
                        <button className="account-secondary-action" type="submit">Quitar</button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="Tu carrito esta vacio" text="Agrega productos o recursos desde el catalogo para prepararlos antes de comprar." href="/catalogo" action="Explorar catalogo" />
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

          <div className="account-lower-grid">
            <section className="account-panel" id="notificaciones">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="blue">N</AccountIcon>
                  <h2>Notificaciones</h2>
                </div>
              </div>
              {notificationList.length ? (
                <div className="account-message-list">
                  {notificationList.slice(0, 8).map((item) => (
                    <article className={item.read_at ? "" : "is-unread"} key={item.id}>
                      <span>{item.notification_type}</span>
                      <strong>{item.title}</strong>
                      {item.body ? <p>{item.body}</p> : null}
                      <small>{formatDateTime(item.created_at)}</small>
                      {item.href ? <a href={item.href}>Abrir</a> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="No tenes notificaciones" text="Cuando haya novedades de turnos, cursos o compras, van a aparecer aca." />
              )}
            </section>

            <section className="account-panel" id="mensajes">
              <div className="account-panel-head">
                <div>
                  <AccountIcon tone="purple">M</AccountIcon>
                  <h2>Mensajes</h2>
                </div>
              </div>
              {messageList.length ? (
                <div className="account-message-list">
                  {messageList.slice(0, 8).map((item) => (
                    <article className={item.read_at ? "" : "is-unread"} key={item.id}>
                      <span>{item.message_type}</span>
                      <strong>{item.subject}</strong>
                      {item.body ? <p>{item.body}</p> : null}
                      <small>{formatDateTime(item.created_at)}</small>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="No tenes mensajes" text="Las promociones, avisos importantes y comunicaciones de LUMEN se van a ver aca." />
              )}
            </section>
          </div>

          <section className="account-panel" id="facturacion">
            <div className="account-panel-head">
              <div>
                <AccountIcon tone="orange">F</AccountIcon>
                <h2>Facturacion</h2>
              </div>
            </div>
            <div className="account-profile-grid">
              <div>
                <span>Nombre / razon social</span>
                <strong>{billingProfile?.legal_name || "Sin datos cargados"}</strong>
              </div>
              <div>
                <span>DNI / CUIL / CUIT</span>
                <strong>{billingProfile?.tax_id || "Sin datos cargados"}</strong>
              </div>
              <div>
                <span>Condicion fiscal</span>
                <strong>{getTaxConditionLabel(billingProfile?.tax_condition)}</strong>
              </div>
              <div>
                <span>Email de facturacion</span>
                <strong>{billingProfile?.billing_email || userData.user.email}</strong>
              </div>
            </div>
            <div className="account-settings-grid is-wide">
              <BillingDetailsForm
                billingProfile={billingProfile}
                userEmail={userData.user.email}
                returnTo="/mi-cuenta#facturacion"
                submitLabel="Guardar datos de facturacion"
                intro="Estos datos quedan guardados para futuras compras. La factura siempre se solicita despues del pago."
              />
              <div className="account-settings-card">
                <h3>Solicitar factura de una compra</h3>
                <p>Si ya guardaste tus datos fiscales, podes pedir factura para una compra pagada.</p>
                {billingProfile && invoiceEligiblePurchases.length ? (
                  <form className="billing-quick-request" action="/mi-cuenta/billing/request" method="post">
                    <input name="buyerType" type="hidden" value={billingProfile.buyer_type || "person"} />
                    <input name="legalName" type="hidden" value={billingProfile.legal_name || ""} />
                    <input name="taxId" type="hidden" value={billingProfile.tax_id || ""} />
                    <input name="taxCondition" type="hidden" value={billingProfile.tax_condition || "consumidor_final"} />
                    <input name="billingEmail" type="hidden" value={billingProfile.billing_email || userData.user.email || ""} />
                    <input name="fiscalAddress" type="hidden" value={billingProfile.fiscal_address || ""} />
                    <input name="province" type="hidden" value={billingProfile.province || ""} />
                    <input name="city" type="hidden" value={billingProfile.city || ""} />
                    <input name="postalCode" type="hidden" value={billingProfile.postal_code || ""} />
                    <input name="returnTo" type="hidden" value="/mi-cuenta#facturacion" />
                    <label>
                      Compra
                      <select name="purchaseKey" required>
                        <option value="">Seleccionar compra</option>
                        {invoiceEligiblePurchases.map((purchase) => (
                          <option value={purchase.purchaseKey} key={purchase.id}>
                            {purchase.title} - {formatPrice(purchase.amount)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="account-secondary-action" type="submit">Solicitar factura</button>
                  </form>
                ) : (
                  <p className="muted">
                    {billingProfile ? "No hay compras pagadas pendientes de factura." : "Primero guarda tus datos fiscales."}
                  </p>
                )}
              </div>
              <div className="account-settings-card">
                <h3>Estado de facturas</h3>
                <p>Por ahora LUMEN registra la solicitud y permite al admin marcarla como emitida. Mas adelante aca se puede integrar AFIP/ARCA o un generador automatico de comprobantes.</p>
                {invoiceRequestList.length ? (
                  <div className="account-message-list">
                    {invoiceRequestList.slice(0, 4).map((invoice) => (
                      <article key={invoice.id}>
                        <span>{getInvoiceStatusLabel(invoice.status)}</span>
                        <strong>{invoice.purchase_type === "course" ? "Curso" : "Catalogo"}</strong>
                        <small>{formatDateTime(invoice.requested_at)}</small>
                        {invoice.invoice_number ? <small>Numero: {invoice.invoice_number}</small> : null}
                        {invoice.invoice_file_url ? <a href={invoice.invoice_file_url}>Ver comprobante</a> : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Todavia no solicitaste facturas.</p>
                )}
              </div>
            </div>
          </section>

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
                <strong>{profileName || "Sin nombre cargado"}</strong>
              </div>
              <div>
                <span>Telefono</span>
                <strong>{profilePhone || "Sin telefono cargado"}</strong>
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
            <div className="account-settings-grid">
              <form className="account-settings-card" action="/mi-cuenta/profile/update" method="post">
                <h3>Datos personales</h3>
                <label>
                  Nombre y apellido
                  <input name="fullName" defaultValue={profileName} placeholder="Tu nombre" />
                </label>
                <label>
                  Telefono
                  <input name="phone" defaultValue={profilePhone} placeholder="Ej: 11 1234 5678" />
                </label>
                <button className="account-primary-action" type="submit">Guardar cambios</button>
              </form>

              <form className="account-settings-card" action="/mi-cuenta/security/email" method="post">
                <h3>Cambiar email</h3>
                <p>Te vamos a enviar un email de confirmacion a la nueva direccion antes de aplicar el cambio.</p>
                <label>
                  Nuevo email
                  <input name="newEmail" type="email" placeholder="nuevo@email.com" required />
                </label>
                <button className="account-secondary-action" type="submit">Enviar confirmacion</button>
              </form>

              <form className="account-settings-card" action="/mi-cuenta/security/password" method="post">
                <h3>Cambiar contrasena</h3>
                <p>Por seguridad, te enviamos un enlace al email actual para iniciar el cambio.</p>
                <button className="account-secondary-action" type="submit">Enviar enlace seguro</button>
              </form>
            </div>
          </section>
        </div>
    </AccountDashboardShell>
  );
}
