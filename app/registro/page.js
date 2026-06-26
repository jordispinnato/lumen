export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="section">
      <form className="form-card" action="/auth/register" method="post">
        <p className="eyebrow">Crear cuenta</p>
        <h1>Registro</h1>
        <label>
          Nombre
          <input type="text" name="name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Contraseña
          <input type="password" name="password" required minLength="8" />
        </label>
        <button className="button" type="submit">Crear cuenta</button>
        {error ? <p className="notice error">{error}</p> : null}
        <p className="muted">El registro ya usa Supabase Auth. Si la confirmación por email está activa, hay que revisar el correo.</p>
      </form>
    </main>
  );
}
