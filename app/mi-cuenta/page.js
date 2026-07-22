import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import AccountDashboardShell from "./AccountDashboardShell";
import AppIcon from "../components/AppIcon";
import {
  ACCOUNT_NAV_ITEMS,
  applyReadReceipts,
  formatDate,
  formatTime,
  initialsFromName,
  getEnrollmentsWithProgress,
} from "./accountShared";
import { getCartQuantityTotal } from "../../lib/cart";

const ONBOARDING_STEPS = [
  {
    icon: "calendar",
    title: "Reservá tu primera consulta",
    text: "Elegí una profesional y coordiná un encuentro online cuando te quede cómodo.",
    href: "/turnos",
    action: "Ver especialistas",
  },
  {
    icon: "book-open",
    title: "Explorá los cursos disponibles",
    text: "Contenidos para avanzar a tu ritmo, desde cualquier dispositivo.",
    href: "/cursos",
    action: "Ver cursos",
  },
  {
    icon: "sparkles",
    title: "Completá tu perfil",
    text: "Así tus profesionales y certificados van a estar siempre al día.",
    href: "/configuracion",
    action: "Ir a Configuración",
  },
];

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
    { data: catalogOrders },
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
      .from("catalog_orders")
      .select("id")
      .eq("user_id", userData.user.id),
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
  const courseCards = await getEnrollmentsWithProgress(supabase, userData.user.id);

  const upcomingBookings = (bookings || [])
    .filter((booking) => booking.appointment_slots?.slot_date >= today && booking.status !== "cancelled")
    .sort((a, b) => {
      const aValue = `${a.appointment_slots?.slot_date || ""} ${a.appointment_slots?.slot_time || ""}`;
      const bValue = `${b.appointment_slots?.slot_date || ""} ${b.appointment_slots?.slot_time || ""}`;
      return aValue.localeCompare(bValue);
    });
  const nextBooking = upcomingBookings[0];
  const isConsultationToday = nextBooking?.appointment_slots?.slot_date === today;
  const consultationUrl = isConsultationToday ? process.env.ONLINE_CONSULTATION_URL : null;

  const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
  const notificationList = applyReadReceipts(notifications || [], receiptSet, "notification");
  const messageList = applyReadReceipts(messages || [], receiptSet, "message");
  const pendingAccountAlerts =
    notificationList.filter((item) => !item.read_at).length + messageList.filter((item) => !item.read_at).length;
  const featuredAccountNotice = [
    ...messageList.map((item) => ({
      id: `message-${item.id}`,
      label: item.message_type || "Mensaje",
      title: item.subject,
      body: item.body,
      date: item.created_at,
      href: "/mis-mensajes",
      unread: !item.read_at,
    })),
    ...notificationList.map((item) => ({
      id: `notification-${item.id}`,
      label: item.notification_type || "Notificación",
      title: item.title,
      body: item.body,
      date: item.created_at,
      href: item.href || "/mis-notificaciones",
      unread: !item.read_at,
    })),
  ]
    .filter((item) => item.unread)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];

  const profileName = profile?.full_name || userData.user.user_metadata?.full_name || "";
  const displayName = profileName || userData.user.email;
  const firstName = profileName?.split(" ")?.[0] || userData.user.email?.split("@")?.[0] || "LUMEN";
  const avatarInitials = initialsFromName(displayName);

  const hasAnyActivity = Boolean((bookings || []).length || courseCards.length || (catalogOrders || []).length);
  const nextCourse = courseCards.find((item) => item.progress.percent < 100) || courseCards[0];

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
        {params?.message ? <p className="notice success">{params.message}</p> : null}
        {params?.error ? <p className="notice error">{params.error}</p> : null}

        <section className="account-hero account-hero--home">
          <div className="account-hero-body">
            <span className="account-page-kicker">Mi Espacio</span>
            <h1>¡Hola, {firstName}!</h1>
            <p>Este es tu lugar para organizar consultas, cursos y recursos, a tu propio ritmo.</p>
          </div>
          {consultationUrl ? (
            <a className="account-consult-cta" href={consultationUrl} target="_blank" rel="noreferrer">
              <AppIcon name="video" size="sm" />
              Unirte a la consulta de hoy
            </a>
          ) : (
            <Link className="account-consult-cta" href="/turnos">
              <AppIcon name="calendar" size="sm" />
              Reservar consulta
            </Link>
          )}
        </section>

        {featuredAccountNotice ? (
          <section className="account-featured-notice is-unread">
            <span>{featuredAccountNotice.label}</span>
            <div>
              <h2>{featuredAccountNotice.title}</h2>
              {featuredAccountNotice.body ? <p>{featuredAccountNotice.body}</p> : null}
            </div>
            <Link href={featuredAccountNotice.href}>Revisar</Link>
          </section>
        ) : null}

        {!hasAnyActivity ? (
          <section className="account-panel">
            <div className="account-panel-head">
              <div>
                <AppIcon name="sparkles" />
                <h2>Empecemos por acá</h2>
              </div>
            </div>
            <div className="account-onboarding-checklist">
              {ONBOARDING_STEPS.map((step) => (
                <Link className="account-onboarding-item" href={step.href} key={step.title}>
                  <span aria-hidden="true"><AppIcon name={step.icon} size="sm" /></span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="account-lower-grid">
          <section className="account-panel">
            <div className="account-panel-head">
              <div>
                <AppIcon name="calendar" />
                <h2>Tu próxima consulta</h2>
              </div>
              <Link href="/mis-turnos">Ver mis turnos</Link>
            </div>
            {nextBooking ? (
              <article className="account-appointment-card">
                <span className="account-avatar small">{initialsFromName(nextBooking.appointment_specialists?.name)}</span>
                <div>
                  <strong>{nextBooking.appointment_specialists?.session || "Sesión individual"}</strong>
                  <span>{nextBooking.appointment_specialists?.name || "Profesional LUMEN"}</span>
                </div>
                <div>
                  <strong>{formatDate(nextBooking.appointment_slots?.slot_date)}</strong>
                  <span>{formatTime(nextBooking.appointment_slots?.slot_time)} hs</span>
                </div>
              </article>
            ) : (
              <p className="account-muted">No tenés turnos próximos. Podés reservar cuando lo necesites.</p>
            )}
          </section>

          <section className="account-panel">
            <div className="account-panel-head">
              <div>
                <AppIcon name="trending-up" />
                <h2>Tu proceso</h2>
              </div>
              <Link href="/mis-cursos">Ver mis cursos</Link>
            </div>
            {nextCourse ? (
              <>
                <strong>{nextCourse.course?.title}</strong>
                <div className="account-progress-row">
                  <div className="account-progress-track">
                    <span style={{ width: `${nextCourse.progress.percent}%` }} />
                  </div>
                  <strong>{nextCourse.progress.percent}%</strong>
                </div>
                <p className="account-muted">Última lección: {nextCourse.progress.lastLessonTitle}</p>
                <Link className="account-secondary-action" href={nextCourse.continueUrl}>Continuar</Link>
              </>
            ) : (
              <p className="account-muted">Todavía no tenés cursos habilitados.</p>
            )}
          </section>
        </div>
      </div>
    </AccountDashboardShell>
  );
}
