import "./globals.css";
import { createSupabaseServerClient } from "../lib/supabase/server";
import SiteNav from "./SiteNav";

export const metadata = {
  title: "LUMEN | Plataforma interdisciplinaria",
  description: "Orientación profesional, formación y recursos para transformar información en acciones concretas.",
};

export default async function RootLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  let isAdmin = false;

  if (userData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    isAdmin = profile?.role === "admin";
  }

  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true" />
            <span>LUMEN</span>
          </a>
          <SiteNav isAdmin={isAdmin} isLoggedIn={Boolean(userData.user)} />
        </header>
        {children}
        <footer className="site-footer">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true" />
            <span>LUMEN</span>
          </a>
          <p className="muted">Claridad en momentos de incertidumbre.</p>
        </footer>
      </body>
    </html>
  );
}
