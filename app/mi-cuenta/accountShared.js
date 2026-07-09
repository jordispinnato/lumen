export function formatDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("es-AR");
}

export function EmptyState({ title, text, href, action }) {
  return (
    <div className="account-empty-state">
      <span className="account-empty-icon" aria-hidden="true">+</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {href ? <a className="account-secondary-action" href={href}>{action}</a> : null}
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
