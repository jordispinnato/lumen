import Link from "next/link";

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;
  const nextPath = typeof params?.next === "string" ? params.next : "";
  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  return (
    <main className="section">
      <form className="form-card" action="/auth/register" method="post">
        <p className="eyebrow">Crear cuenta</p>
        <h1>Registro</h1>
        <input type="hidden" name="next" value={nextPath} />
        <label>
          Nombre
          <input type="text" name="name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Contrasena
          <input type="password" name="password" required minLength="8" />
        </label>
        <button className="button" type="submit">Crear cuenta</button>
        {error ? <p className="notice error">{error}</p> : null}
        <p className="muted">¿Ya tenés cuenta? <Link href={loginHref}>Ingresar</Link></p>
      </form>
    </main>
  );
}
