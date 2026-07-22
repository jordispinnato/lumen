import { redirect } from "next/navigation";
import Link from "next/link";
import AppIcon from "../components/AppIcon";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import { ACCOUNT_NAV_ITEMS, applyReadReceipts, initialsFromName, EmptyState } from "../mi-cuenta/accountShared";
import { getCartQuantityTotal } from "../../lib/cart";

export const metadata = {
  title: "Mis recursos | LUMEN",
};

export default async function MisRecursosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/mis-recursos");
  }

  const [
    { data: profile },
    { data: catalogOrders },
    { data: notifications },
    { data: messages },
    { data: readReceipts },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name,email,role").eq("id", userData.user.id).maybeSingle(),
    supabase
      .from("catalog_orders")
      .select(`
        id,
        product_type,
        status,
        amount,
        created_at,
        catalog_products:product_id (id, title, summary, digital_file_name, digital_url)
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
    supabase.from("user_notification_reads").select("item_type,item_id").eq("user_id", userData.user.id),
  ]);

  const cartCount = await getCartQuantityTotal(supabase, userData.user.id);
  const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
  const notificationList = applyReadReceipts(notifications || [], receiptSet, "notification");
  const messageList = applyReadReceipts(messages || [], receiptSet, "message");
  const pendingAccountAlerts =
    notificationList.filter((item) => !item.read_at).length + messageList.filter((item) => !item.read_at).length;
  const displayName = profile?.full_name || userData.user.user_metadata?.full_name || userData.user.email;
  const avatarInitials = initialsFromName(displayName);

  const approvedDigitalOrders = (catalogOrders || []).filter(
    (order) => order.product_type === "digital" && (order.status === "paid" || order.status === "delivered")
  );

  return (
    <AccountDashboardShell
      navItems={ACCOUNT_NAV_ITEMS}
      displayName={displayName}
      avatarInitials={avatarInitials}
      isAdmin={profile?.role === "admin"}
      notificationCount={pendingAccountAlerts}
      notifications={notificationList}
      messages={messageList}
      cartCount={cartCount}
    >
      <div className="account-dashboard">
        <section className="account-hero">
          <div>
            <span className="account-page-kicker">Mi Espacio</span>
            <h1>Mis recursos</h1>
          </div>
          <Link className="account-secondary-action" href="/catalogo">Ir al catálogo</Link>
        </section>

        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <AppIcon name="package" />
              <h2>Recursos digitales</h2>
            </div>
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
      </div>
    </AccountDashboardShell>
  );
}
