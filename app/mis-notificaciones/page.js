import { redirect } from "next/navigation";
import AppIcon from "../components/AppIcon";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import { ACCOUNT_NAV_ITEMS, applyReadReceipts, formatDateTime, initialsFromName, EmptyState } from "../mi-cuenta/accountShared";
import { getCartQuantityTotal } from "../../lib/cart";

export const metadata = {
  title: "Notificaciones | LUMEN",
};

export default async function MisNotificacionesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/mis-notificaciones");
  }

  const [
    { data: profile },
    { data: notifications },
    { data: messages },
    { data: readReceipts },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name,email,role").eq("id", userData.user.id).maybeSingle(),
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
            <h1>Notificaciones</h1>
          </div>
        </section>

        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <AppIcon name="bell" />
              <h2>Todas tus notificaciones</h2>
            </div>
          </div>
          {notificationList.length ? (
            <div className="account-message-list">
              {notificationList.map((item) => (
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
            <EmptyState title="No tenés notificaciones" text="Cuando haya novedades de turnos, cursos o compras, van a aparecer acá." />
          )}
        </section>
      </div>
    </AccountDashboardShell>
  );
}
