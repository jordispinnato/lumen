import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import { applyReadReceipts, EmptyState, AccountIcon } from "../mi-cuenta/accountShared";

function initialsFromName(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export const metadata = {
  title: "Carrito | LUMEN",
};

export default async function CarritoPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/carrito");
  }

  const [
    { data: profile },
    { data: notifications },
    { data: messages },
    { data: cartItems },
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
      .from("user_notification_reads")
      .select("item_type,item_id")
      .eq("user_id", userData.user.id),
  ]);

  const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
  const notificationList = applyReadReceipts(notifications || [], receiptSet, "notification");
  const messageList = applyReadReceipts(messages || [], receiptSet, "message");
  const pendingAccountAlerts =
    notificationList.filter((item) => !item.read_at).length + messageList.filter((item) => !item.read_at).length;
  const profileName = profile?.full_name || userData.user.user_metadata?.full_name || "";
  const displayName = profileName || userData.user.email;
  const avatarInitials = initialsFromName(displayName);
  const cartItemList = cartItems || [];
  const cartTotal = cartItemList.reduce(
    (sum, item) => sum + (item.catalog_products?.price || 0) * item.quantity,
    0
  );

  return (
    <AccountDashboardShell
      navItems={[{ href: "/mi-cuenta", icon: "I", label: "Volver a Mi Espacio" }]}
      displayName={displayName}
      avatarInitials={avatarInitials}
      isAdmin={profile?.role === "admin"}
      notificationCount={pendingAccountAlerts}
      notifications={notificationList}
      messages={messageList}
    >
      <div className="account-dashboard">
        {params?.message ? <p className="notice success">{params.message}</p> : null}
        {params?.error ? <p className="notice error">{params.error}</p> : null}

        <section className="account-hero">
          <div>
            <span className="account-page-kicker">Mi cuenta</span>
            <h1>Carrito</h1>
          </div>
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
                  <small>
                    Precio unitario: {formatPrice(item.catalog_products?.price || 0)} · Cantidad: {item.quantity} · Subtotal: {formatPrice((item.catalog_products?.price || 0) * item.quantity)}
                  </small>
                  <a className="account-secondary-action" href={`/catalogo/${item.catalog_products?.id}`}>Ver producto</a>
                  <form action="/catalogo/cart/update" method="post">
                    <input name="cartItemId" type="hidden" value={item.id} />
                    <input name="quantity" type="number" min="1" step="1" defaultValue={item.quantity} />
                    <button className="account-secondary-action" type="submit">Actualizar</button>
                  </form>
                  <form action="/catalogo/cart/remove" method="post">
                    <input name="cartItemId" type="hidden" value={item.id} />
                    <button className="account-secondary-action" type="submit">Quitar</button>
                  </form>
                </article>
              ))}
              <article>
                <strong>Total del carrito</strong>
                <small>{formatPrice(cartTotal)}</small>
              </article>
            </div>
          ) : (
            <EmptyState title="Tu carrito esta vacio" text="Agrega productos o recursos desde el catalogo para prepararlos antes de comprar." href="/catalogo" action="Explorar catalogo" />
          )}
        </section>
      </div>
    </AccountDashboardShell>
  );
}
