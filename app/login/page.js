export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;

  return (
    <main className="section">
      <form className="form-card" action="/auth/login" method="post">
        <p className="eyebrow">Acceso privado</p>
        <h1>Ingresar</h1>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Contraseña
          <input type="password" name="password" required />
        </label>
        <button className="button" type="submit">Entrar al aula</button>
        {error ? <p className="notice error">{error}</p> : null}
        {message ? <p className="notice success">{message}</p> : null}
        <p className="muted">Este formulario ya está conectado a Supabase Auth.</p>
      </form>
    </main>
  );
}
