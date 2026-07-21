import Link from "next/link";
import LumenLogotipo from "../components/LumenLogotipo";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;
  const nextPath = typeof params?.next === "string" ? params.next : "";
  const registerHref = nextPath ? `/registro?next=${encodeURIComponent(nextPath)}` : "/registro";

  return (
    <main className="section">
      <Link href="/" className="auth-brand" aria-label="Ir al inicio de LUMEN">
        <LumenLogotipo />
      </Link>
      <form className="form-card" action="/auth/login" method="post">
        <p className="eyebrow">Acceso privado</p>
        <h1>Ingresar</h1>
        <input type="hidden" name="next" value={nextPath} />
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Contrasena
          <input type="password" name="password" required />
        </label>
        <button className="button" type="submit">Ingresar</button>
        {error ? <p className="notice error">{error}</p> : null}
        {message ? <p className="notice success">{message}</p> : null}
        <p className="muted">¿No tenés cuenta? <Link href={registerHref}>Crear cuenta</Link></p>
      </form>
    </main>
  );
}
