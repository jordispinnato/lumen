export default function CheckoutPendingPage() {
  return (
    <main className="section">
      <div className="form-card">
        <p className="eyebrow">Pago pendiente</p>
        <h1>Estamos esperando la confirmación</h1>
        <p className="muted">El acceso se habilitará cuando Mercado Pago confirme la operación.</p>
        <a className="button" href="/aula">Ir al aula</a>
      </div>
    </main>
  );
}
