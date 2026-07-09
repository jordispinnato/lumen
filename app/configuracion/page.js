import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import { applyReadReceipts, formatDateTime, AccountIcon } from "../mi-cuenta/accountShared";

export const metadata = {
  title: "Configuración | LUMEN",
};

function initialsFromName(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export default async function ConfiguracionPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/configuracion");
  }

  const [
    { data: profile },
    { data: notifications },
    { data: messages },
    { data: readReceipts },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,phone,role,created_at")
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

  const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
  const notificationList = applyReadReceipts(notifications || [], receiptSet, "notification");
  const messageList = applyReadReceipts(messages || [], receiptSet, "message");
  const pendingAccountAlerts =
    notificationList.filter((item) => !item.read_at).length + messageList.filter((item) => !item.read_at).length;
  const profileName = profile?.full_name || userData.user.user_metadata?.full_name || "";
  const profilePhone = profile?.phone || userData.user.user_metadata?.phone || "";
  const displayName = profileName || userData.user.email;
  const avatarInitials = initialsFromName(displayName);

  return (
    <AccountDashboardShell
      navItems={[]}
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
            <h1>Configuración</h1>
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
