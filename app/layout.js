import "./globals.css";
import { createSupabaseServerClient } from "../lib/supabase/server";

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
          <nav className="site-nav" aria-label="Principal">
            <a href="/turnos">Turnos</a>
            <a href="/cursos">Cursos</a>
            <a href="/aula">Aula</a>
            {isAdmin ? <a href="/admin">Admin</a> : null}
            {userData.user ? (
              <form action="/auth/logout" method="post">
                <button className="nav-button" type="submit">Salir</button>
              </form>
            ) : (
              <>
                <a href="/login">Ingresar</a>
                <a className="button" href="/registro">Crear cuenta</a>
              </>
            )}
          </nav>
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
