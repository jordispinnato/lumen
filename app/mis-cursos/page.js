import { redirect } from "next/navigation";
import Link from "next/link";
import AppIcon from "../components/AppIcon";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import {
  ACCOUNT_NAV_ITEMS,
  applyReadReceipts,
  initialsFromName,
  getEnrollmentsWithProgress,
  EmptyState,
} from "../mi-cuenta/accountShared";
import { getCartQuantityTotal } from "../../lib/cart";

export const metadata = {
  title: "Mis cursos | LUMEN",
};

const TABS = [
  { value: "todos", label: "Todos" },
  { value: "progreso", label: "En progreso" },
  { value: "completados", label: "Completados" },
  { value: "pendientes", label: "Pendientes" },
];

function matchesTab(item, tab) {
  if (tab === "progreso") {
    return item.tone === "progress";
  }

  if (tab === "completados") {
    return item.tone === "complete";
  }

  if (tab === "pendientes") {
    return item.tone === "pending";
  }

  return true;
}

export default async function MisCursosPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/mis-cursos");
  }

  const activeTab = TABS.some((tab) => tab.value === params?.estado) ? params.estado : "todos";

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
  const courseCards = await getEnrollmentsWithProgress(supabase, userData.user.id);
  const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
  const notificationList = applyReadReceipts(notifications || [], receiptSet, "notification");
  const messageList = applyReadReceipts(messages || [], receiptSet, "message");
  const pendingAccountAlerts =
    notificationList.filter((item) => !item.read_at).length + messageList.filter((item) => !item.read_at).length;
  const displayName = profile?.full_name || userData.user.user_metadata?.full_name || userData.user.email;
  const avatarInitials = initialsFromName(displayName);

  const visibleCourses = courseCards.filter((item) => matchesTab(item, activeTab));

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
            <h1>Mis cursos</h1>
          </div>
          <Link className="account-secondary-action" href="/cursos">Ver todos los cursos</Link>
        </section>

        {courseCards.length ? (
          <section className="account-panel">
            <div className="account-panel-head">
              <div>
                <AppIcon name="trending-up" />
                <h2>Tu recorrido</h2>
              </div>
            </div>
            <div className="account-journey-path" aria-hidden="true">
              {courseCards.map((item, index) => (
                <span key={item.id} style={{ display: "contents" }}>
                  <span className={`account-journey-step${item.progress.percent >= 100 ? " is-done" : ""}`}>
                    <span />
                  </span>
                  {index < courseCards.length - 1 ? (
                    <span className={`account-journey-connector${item.progress.percent >= 100 ? " is-done" : ""}`} />
                  ) : null}
                </span>
              ))}
            </div>
            <p className="account-muted">
              {courseCards.filter((item) => item.progress.percent >= 100).length} de {courseCards.length} cursos completados.
            </p>
          </section>
        ) : null}

        <section className="account-panel">
          <div className="account-panel-head">
            <div>
              <AppIcon name="book-open" />
              <h2>Tus cursos</h2>
            </div>
          </div>
          <div className="account-course-tabs" aria-label="Filtrar por estado">
            {TABS.map((tab) => (
              <Link
                className={tab.value === activeTab ? "is-active" : ""}
                href={tab.value === "todos" ? "/mis-cursos" : `/mis-cursos?estado=${tab.value}`}
                key={tab.value}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          {visibleCourses.length ? (
            <div className="account-course-grid">
              {visibleCourses.map((item) => (
                <article className={`account-course-card is-visual-${item.visual}`} key={item.id}>
                  <div className="account-course-media">
                    <span className={`account-course-status is-${item.tone}`}>{item.state}</span>
                  </div>
                  <div className="account-course-body">
                    <h3>{item.course?.title}</h3>
                    <p>{item.course?.summary || "Curso disponible en tu aula privada."}</p>
                    <div className="account-progress-row">
                      <div className="account-progress-track">
                        <span style={{ width: `${item.progress.percent}%` }} />
                      </div>
                      <strong>{item.progress.percent}%</strong>
                    </div>
                    <div className="account-course-meta">
                      <span>Última lección: {item.progress.lastLessonTitle}</span>
                      <span>{item.progress.completed} de {item.progress.total} clases</span>
                    </div>
                    <div className="account-course-actions">
                      <Link href={item.continueUrl}>Continuar</Link>
                      {item.progress.percent >= 100 ? <Link href="/mis-certificados">Ver certificado</Link> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No hay cursos en este estado"
              text="Cuando compres o te habiliten un curso, lo vas a ver en esta sección."
              href="/cursos"
              action="Explorar cursos"
            />
          )}
        </section>
      </div>
    </AccountDashboardShell>
  );
}
