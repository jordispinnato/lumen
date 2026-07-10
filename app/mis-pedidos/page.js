import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import { applyReadReceipts, buildPurchaseRows, EmptyState, AccountIcon, formatDateTime } from "../mi-cuenta/accountShared";
import { getCartQuantityTotal } from "../../lib/cart";

function initialsFromName(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export const metadata = {
  title: "Mis pedidos | LUMEN",
};

export default async function MisPedidosPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/mis-pedidos");
  }

  const [
    { data: profile },
    { data: notifications },
    { data: messages },
    { data: catalogOrders },
    { data: courseOrders },
    { data: invoiceRequests },
    { data: readReceipts },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,role")
      .eq("id", userData.user.id)
      .maybeSingle(),
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
          product_type
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
      .from("invoice_requests")
      .select("id,order_id,catalog_order_id,purchase_type,status,invoice_number,invoice_file_url,requested_at,issued_at")
      .eq("user_id", userData.user.id)
      .order("requested_at", { ascending: false }),
    supabase
      .from("user_notification_reads")
      .select("item_type,item_id")
      .eq("user_id", userData.user.id),
  ]);

  const cartCount = await getCartQuantityTotal(supabase, userData.user.id);

  const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
  const notificationList = applyReadReceipts(notifications || [], receiptSet, "notification");
  const messageList = applyReadReceipts(messages || [], receiptSet, "message");
  const pendingAccountAlerts =
    notificationList.filter((item) => !item.read_at).length + messageList.filter((item) => !item.read_at).length;
  const profileName = profile?.full_name || userData.user.user_metadata?.full_name || "";
  const displayName = profileName || userData.user.email;
  const avatarInitials = initialsFromName(displayName);

  const purchaseRows = buildPurchaseRows(courseOrders || [], catalogOrders || [], invoiceRequests || []);
  const digitalRows = purchaseRows.filter((row) => row.type !== "Físico");
  const physicalRows = purchaseRows.filter((row) => row.type === "Físico");

  return (
    <AccountDashboardShell
      navItems={[{ href: "/mi-cuenta", icon: "I", label: "Volver a Mi Espacio" }]}
      displayName={displayName}
      avatarInitials={avatarInitials}
      isAdmin={profile?.role === "admin"}
      notificationCount={pendingAccountAlerts}
      notifications={notificationList}
      messages={messageList}
      cartCount={cartCount}
    >
      <div className="account-dashboard">
        {params?.message ? <p className="notice success">{params.message}</p> : null}
        {params?.error ? <p className="notice error">{params.error}</p> : null}

        <section className="account-hero">
          <div>
            <span className="account-page-kicker">Mi cuenta</span>
            <h1>Mis pedidos</h1>
          </div>
        </section>

        <div className="account-lower-grid">
          <section className="account-panel" id="pedidos-digitales">
            <div className="account-panel-head">
              <div>
                <AccountIcon tone="green">$</AccountIcon>
                <h2>Cursos y productos digitales</h2>
              </div>
            </div>
            {digitalRows.length ? (
              <div className="account-history-list">
                {digitalRows.map((purchase) => (
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

          <section className="account-panel" id="pedidos-fisicos">
            <div className="account-panel-head">
              <div>
                <AccountIcon tone="blue">P</AccountIcon>
                <h2>Productos físicos y envíos</h2>
              </div>
            </div>
            {physicalRows.length ? (
              <div className="account-history-list">
                {physicalRows.map((purchase) => (
                  <article key={purchase.id}>
                    <span>Pago: {purchase.paymentStatus}</span>
                    <strong>{purchase.title}</strong>
                    <small>
                      {purchase.type} · {formatPrice(purchase.amount)} · {formatDateTime(purchase.date)}
                    </small>
                    <small>{purchase.shippingSummary}</small>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Todavía no tenés pedidos" text="Cuando solicites un producto o recurso, el seguimiento va a aparecer acá." href="/catalogo" action="Explorar catálogo" />
            )}
          </section>
        </div>
      </div>
    </AccountDashboardShell>
  );
}
