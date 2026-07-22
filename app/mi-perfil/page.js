import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import { ACCOUNT_RETURN_NAV_ITEM, applyReadReceipts, EmptyState } from "../mi-cuenta/accountShared";
import { getCartQuantityTotal } from "../../lib/cart";

export const metadata = {
  title: "Mi Perfil | LUMEN",
};

function initialsFromName(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export default async function MiPerfilPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/mi-perfil");
  }

  const [
    { data: profile },
    { data: notifications },
    { data: messages },
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

  return (
    <AccountDashboardShell
      navItems={ACCOUNT_RETURN_NAV_ITEM}
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
            <span className="account-page-kicker">Mi cuenta</span>
            <h1>Mi Perfil</h1>
          </div>
        </section>

        <section className="account-panel" id="mi-perfil">
          <EmptyState
            title="Mi Perfil se implementará en una etapa posterior"
            text="Esta sección todavía no está disponible. Por ahora, tus datos personales se pueden editar desde Configuración."
            href="/configuracion"
            action="Ir a Configuración"
          />
        </section>
      </div>
    </AccountDashboardShell>
  );
}
