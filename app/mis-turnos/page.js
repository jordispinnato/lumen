import { redirect } from "next/navigation";
import Link from "next/link";
import ConfirmSubmitButton from "../components/ConfirmSubmitButton";
import AppIcon from "../components/AppIcon";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import {
  ACCOUNT_NAV_ITEMS,
  applyReadReceipts,
  formatDate,
  formatTime,
  initialsFromName,
  EmptyState,
} from "../mi-cuenta/accountShared";
import { getCartQuantityTotal } from "../../lib/cart";

export const metadata = {
  title: "Mis turnos | LUMEN",
};

export default async function MisTurnosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/mis-turnos");
  }

  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: profile },
    { data: bookings },
    { data: notifications },
    { data: messages },
    { data: readReceipts },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name,email,role").eq("id", userData.user.id).maybeSingle(),
    supabase
      .from("appointment_bookings")
      .select(`
        id,
        status,
        created_at,
        appointment_specialists:specialist_id (name, session),
        appointment_slots:slot_id (slot_date, slot_time)
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
            <h1>Mis turnos</h1>
          </div>
          <Link className="account-primary-action" href="/turnos">Reservar nuevo turno</Link>
        </section>

        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <AppIcon name="calendar" />
              <h2>Próximos turnos</h2>
            </div>
          </div>
          {upcomingBookings.length ? (
            <div className="account-appointment-list">
              {upcomingBookings.map((booking) => (
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
                      <Link href={`/turnos?reprogramar=${booking.id}`}>Reprogramar</Link>
                      <form action="/turnos/cancelar" method="post">
                        <input name="bookingId" type="hidden" value={booking.id} />
                        <input name="reason" type="hidden" value="Cancelado por el paciente desde Mi Espacio" />
                        <ConfirmSubmitButton
                          className="account-danger-action"
                          message="Seguro querés cancelar este turno?"
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
        </section>

        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <AppIcon name="clock" />
              <h2>Historial de turnos</h2>
            </div>
          </div>
          {pastBookings.length ? (
            <div className="account-history-list">
              {pastBookings.map((booking) => (
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
        </section>
      </div>
    </AccountDashboardShell>
  );
}
