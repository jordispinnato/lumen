import "./globals.css";
import { createSupabaseServerClient } from "../lib/supabase/server";
import SiteNav from "./SiteNav";

export const metadata = {
  title: "LUMEN | Plataforma interdisciplinaria",
  description: "Orientacion profesional, formacion y recursos para transformar informacion en acciones concretas.",
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
          <div>
            <a className="brand" href="/">
              <span className="brand-mark" aria-hidden="true" />
              <span>LUMEN</span>
            </a>
            <p className="muted">Cursos, turnos online y recursos terapeuticos para acompanar tu bienestar.</p>
          </div>
          <nav aria-label="Navegacion del pie">
            <strong>Navegacion</strong>
            <a href="/quienes-somos">Quienes somos</a>
            <a href="/cursos">Cursos</a>
            <a href="/catalogo">Catalogo</a>
            <a href="/turnos">Turnos</a>
          </nav>
          <nav aria-label="Legal">
            <strong>Legal</strong>
            <a href="#">Terminos y condiciones</a>
            <a href="#">Politica de privacidad</a>
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
