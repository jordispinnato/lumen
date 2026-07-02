import "./globals.css";
import { createSupabaseServerClient } from "../lib/supabase/server";
import SiteNav from "./SiteNav";
import PWARegister from "./PWARegister";

export const metadata = {
  title: "LUMEN | Plataforma interdisciplinaria",
  description: "Orientación profesional, formación y recursos para transformar información en acciones concretas.",
};

export default async function RootLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  let isAdmin = false;
  let isSpecialist = false;

  if (userData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

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
  }

  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icons/lumen-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/lumen-icon.svg" />
        <meta name="application-name" content="LUMEN" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="LUMEN" />
        <meta name="theme-color" content="#0b4a53" />
      </head>
      <body>
        <PWARegister />
        <header className="site-header">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true" />
            <span>LUMEN</span>
          </a>
          <SiteNav isAdmin={isAdmin} isSpecialist={isSpecialist} isLoggedIn={Boolean(userData.user)} />
        </header>
        {children}
        <footer className="site-footer">
          <div>
            <a className="brand" href="/">
              <span className="brand-mark" aria-hidden="true" />
              <span>LUMEN</span>
            </a>
            <p className="muted">Cursos, turnos online y recursos terapéuticos para acompañar tu bienestar.</p>
          </div>
          <nav aria-label="Navegación del pie">
            <strong>Navegación</strong>
            <a href="/quienes-somos">Quiénes somos</a>
            <a href="/cursos">Cursos</a>
            <a href="/catalogo">Catálogo</a>
            <a href="/turnos">Turnos</a>
          </nav>
          <nav aria-label="Legal">
            <strong>Legal</strong>
            <a href="#">Términos y condiciones</a>
            <a href="#">Política de privacidad</a>
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
