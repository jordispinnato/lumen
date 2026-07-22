import Link from "next/link";

export const ACCOUNT_NAV_ITEMS = [
  { href: "/mi-cuenta", icon: "home", label: "Inicio" },
  { href: "/mis-turnos", icon: "calendar", label: "Mis turnos" },
  { href: "/mis-cursos", icon: "book-open", label: "Mis cursos" },
  { href: "/mis-recursos", icon: "package", label: "Mis recursos" },
  { href: "/mis-notificaciones", icon: "bell", label: "Notificaciones" },
  { href: "/mis-mensajes", icon: "message-circle", label: "Mensajes" },
  { href: "/mis-certificados", icon: "award", label: "Certificados" },
];

export const ACCOUNT_RETURN_NAV_ITEM = [{ href: "/mi-cuenta", icon: "home", label: "Volver a Mi Espacio" }];

export function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("es-AR");
}

export function formatDate(value) {
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

export function formatTime(value) {
  return value?.slice(0, 5) || "";
}

export function initialsFromName(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export function getCourseState(progress) {
  if (progress.percent >= 100) {
    return "Completado";
  }

  if (progress.percent > 0) {
    return "En progreso";
  }

  return "Pendiente";
}

export function getCourseTone(progress) {
  if (progress.percent >= 100) {
    return "complete";
  }

  if (progress.percent > 0) {
    return "progress";
  }

  return "pending";
}

export function buildCourseCards(enrollments, lessons, lessonProgress) {
  const lessonsByCourse = new Map();
  const progressByCourse = new Map();

  (lessons || []).forEach((lesson) => {
    lessonsByCourse.set(lesson.course_id, [...(lessonsByCourse.get(lesson.course_id) || []), lesson]);
  });

  (lessonProgress || []).forEach((item) => {
    progressByCourse.set(item.course_id, [...(progressByCourse.get(item.course_id) || []), item]);
  });

  function getCourseProgress(courseId) {
    const courseLessons = lessonsByCourse.get(courseId) || [];
    const progress = progressByCourse.get(courseId) || [];
    const completed = new Set(progress.filter((item) => item.completed_at).map((item) => item.lesson_id));
    const lastViewed = [...progress]
      .filter((item) => item.last_viewed_at)
      .sort((a, b) => String(b.last_viewed_at).localeCompare(String(a.last_viewed_at)))[0];
    const total = courseLessons.length;

    return {
      total,
      completed: completed.size,
      percent: total ? Math.round((completed.size / total) * 100) : 0,
      lastLessonId: lastViewed?.lesson_id || courseLessons[0]?.id || "",
      lastLessonTitle: lastViewed?.lessons?.title || courseLessons[0]?.title || "Primera clase",
    };
  }

  return (enrollments || []).map((enrollment, index) => {
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
}

export async function getEnrollmentsWithProgress(supabase, userId) {
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id,created_at,courses:course_id (id,slug,title,summary,price,status)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const courseIds = (enrollments || []).map((enrollment) => enrollment.courses?.id).filter(Boolean);
  const [{ data: lessons }, { data: lessonProgress }] = courseIds.length
    ? await Promise.all([
        supabase
          .from("lessons")
          .select("id,course_id,title,status")
          .in("course_id", courseIds)
          .eq("status", "published"),
        supabase
          .from("lesson_progress")
          .select("course_id,lesson_id,completed_at,last_viewed_at,lessons:lesson_id (title)")
          .eq("user_id", userId)
          .in("course_id", courseIds),
      ])
    : [{ data: [] }, { data: [] }];

  return buildCourseCards(enrollments || [], lessons || [], lessonProgress || []);
}

export function EmptyState({ title, text, href, action }) {
  return (
    <div className="account-empty-state">
      <span className="account-empty-icon" aria-hidden="true">+</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {href ? <Link className="account-secondary-action" href={href}>{action}</Link> : null}
    </div>
  );
}

export function AccountIcon({ children, tone = "blue" }) {
  return <span className={`account-icon is-${tone}`} aria-hidden="true">{children}</span>;
}

export function applyReadReceipts(items, receiptSet, itemType) {
  return (items || []).map((item) => ({
    ...item,
    read_at: item.read_at || (receiptSet.has(`${itemType}:${item.id}`) ? "read" : null),
  }));
}

export function getOrderStatusLabel(status) {
  const labels = {
    pending_payment: "Pendiente de pago",
    paid: "Pagado",
    cancelled: "Cancelado",
    delivered: "Entregado",
  };

  return labels[status] || status || "Sin estado";
}

export function getOrderTypeLabel(type) {
  return type === "digital" ? "Digital" : "Físico";
}

export function getCoursePaymentStatusLabel(status) {
  const labels = {
    pending: "Pendiente",
    approved: "Pagado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
  };

  return labels[status] || status || "Sin estado";
}

export function getInvoiceStatusLabel(status) {
  const labels = {
    requested: "Solicitada",
    issued: "Emitida",
    cancelled: "Cancelada",
    not_requested: "No solicitada",
  };

  return labels[status] || "No solicitada";
}

export function getTaxConditionLabel(value) {
  const labels = {
    consumidor_final: "Consumidor final",
    monotributo: "Monotributo",
    responsable_inscripto: "Responsable inscripto",
    exento: "Exento",
  };

  return labels[value] || "Sin datos";
}

export function getShippingSummary(order) {
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

export function buildPurchaseRows(courseOrderList, catalogOrderList, invoiceRequestList) {
  const invoiceByCourseOrderId = new Map(
    invoiceRequestList.filter((item) => item.order_id).map((item) => [item.order_id, item])
  );
  const invoiceByCatalogOrderId = new Map(
    invoiceRequestList.filter((item) => item.catalog_order_id).map((item) => [item.catalog_order_id, item])
  );

  return [
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
        shippingSummary: getShippingSummary(order),
        href: order.catalog_products?.id ? `/catalogo/${order.catalog_products.id}` : "/catalogo",
      };
    }),
  ].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}
