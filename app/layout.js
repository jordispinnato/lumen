import "./globals.css";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { getCartQuantityTotal } from "../lib/cart";
import SiteNav from "./SiteNav";
import PWARegister from "./PWARegister";
import LumenIsotipo from "./components/LumenIsotipo";
import LumenLogotipo from "./components/LumenLogotipo";
import { neulis } from "./fonts/neulis";
import { sourceSans } from "./fonts/sourceSans";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://espaciolumen.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "LUMEN | Plataforma interdisciplinaria",
  description: "Orientación profesional, formación y recursos para transformar información en acciones concretas.",
  openGraph: {
    title: "LUMEN | Plataforma interdisciplinaria",
    description: "Orientación profesional, formación y recursos para transformar información en acciones concretas.",
    url: siteUrl,
    siteName: "LUMEN",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LUMEN" }],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMEN | Plataforma interdisciplinaria",
    description: "Orientación profesional, formación y recursos para transformar información en acciones concretas.",
    images: ["/og-image.png"],
  },
};

function applyReadReceipts(items, receiptSet, itemType) {
  return (items || []).map((item) => ({
    ...item,
    read_at: item.read_at || (receiptSet.has(`${itemType}:${item.id}`) ? "read" : null),
  }));
}

export default async function RootLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  let isAdmin = false;
  let isSpecialist = false;
  let displayName = "";
  let unreadNotifications = 0;
  let unreadMessages = 0;
  let notificationPreview = [];
  let messagePreview = [];
  let cartCount = 0;

  if (userData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,email,role")
      .eq("id", userData.user.id)
      .maybeSingle();

    displayName = profile?.full_name || userData.user.user_metadata?.full_name || userData.user.email || "Usuario LUMEN";
    isAdmin = profile?.role === "admin";
    isSpecialist = profile?.role === "specialist";

    if (!isSpecialist) {
      const { data: linkedSpecialist } = await supabase
        .from("appointment_specialists")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      isSpecialist = Boolean(linkedSpecialist);
    }

    const [
      { data: notificationCountRows },
      { data: messageCountRows },
      cartQuantityTotal,
      { data: notificationRows },
      { data: messageRows },
      { data: readReceipts },
    ] = await Promise.all([
      supabase
        .from("user_notifications")
        .select("id,read_at")
        .or(`user_id.eq.${userData.user.id},user_id.is.null`)
        .limit(200),
      supabase
        .from("user_messages")
        .select("id,read_at")
        .or(`user_id.eq.${userData.user.id},user_id.is.null`)
        .limit(200),
      getCartQuantityTotal(supabase, userData.user.id),
      supabase
        .from("user_notifications")
        .select("id,title,body,href,notification_type,read_at,created_at")
        .or(`user_id.eq.${userData.user.id},user_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("user_messages")
        .select("id,subject,body,message_type,read_at,created_at")
        .or(`user_id.eq.${userData.user.id},user_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("user_notification_reads")
        .select("item_type,item_id")
        .eq("user_id", userData.user.id),
    ]);

    const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
    notificationPreview = applyReadReceipts(notificationRows || [], receiptSet, "notification");
    messagePreview = applyReadReceipts(messageRows || [], receiptSet, "message");
    unreadNotifications = applyReadReceipts(notificationCountRows || [], receiptSet, "notification").filter((item) => !item.read_at).length;
    unreadMessages = applyReadReceipts(messageCountRows || [], receiptSet, "message").filter((item) => !item.read_at).length;
    cartCount = cartQuantityTotal;
  }

  return (
    <html lang="es" className={`${neulis.variable} ${sourceSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icons/lumen-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="application-name" content="LUMEN" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="LUMEN" />
        <meta name="theme-color" content="#11383F" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#11383F" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
        <PWARegister />
        <header className="site-header">
          <a className="brand" href="/" aria-label="Ir al inicio de LUMEN">
            <LumenLogotipo className="brand-logotipo" />
          </a>
          <SiteNav
            cartCount={cartCount}
            displayName={displayName}
            email={userData.user?.email}
            isAdmin={isAdmin}
            isSpecialist={isSpecialist}
            isLoggedIn={Boolean(userData.user)}
            unreadMessages={unreadMessages}
            unreadNotifications={unreadNotifications}
            notificationPreview={notificationPreview}
            messagePreview={messagePreview}
          />
        </header>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <footer className="site-footer">
          <div>
            <a className="brand" href="/" aria-label="Ir al inicio de LUMEN">
              <LumenIsotipo className="brand-mark" />
              <LumenLogotipo className="brand-logotipo" />
            </a>
            <p className="muted">Cursos, turnos online y recursos terapéuticos para acompañar tu bienestar.</p>
          </div>
          <nav aria-label="Navegación del pie">
            <strong>Navegación</strong>
            <a href="/quienes-somos">Quiénes somos</a>
            <a href="/cursos">Cursos</a>
            <a href="/catalogo">Catálogo</a>
            <a href="/turnos">Consultas profesionales</a>
            <a href="/contacto">Contacto</a>
          </nav>
          <nav aria-label="Legal">
            <strong>Legal</strong>
            <a href="/terminos-condiciones">Términos y condiciones</a>
            <a href="/politica-privacidad">Política de privacidad</a>
          </nav>
          <nav aria-label="Redes sociales">
            <strong>Seguinos</strong>
            <span>Instagram</span>
            <span>Facebook</span>
          </nav>
        </footer>
      </body>
    </html>
  );
}
