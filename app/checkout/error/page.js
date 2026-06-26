export default function CheckoutErrorPage() {
  return (
    <main className="section">
      <div className="form-card">
        <p className="eyebrow">Pago no completado</p>
        <h1>No pudimos confirmar el pago</h1>
        <p className="muted">Podés intentar nuevamente o elegir transferencia manual.</p>
        <a className="button" href="/cursos">Volver a cursos</a>
      </div>
    </main>
  );
}
