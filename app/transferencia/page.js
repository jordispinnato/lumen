import { demoCourses, formatPrice } from "../../lib/courses";

export default async function TransferPage({ searchParams }) {
  const params = await searchParams;
  const course = demoCourses.find((item) => item.slug === params?.curso) || demoCourses[0];

  return (
    <main className="section">
      <section className="form-card">
        <p className="eyebrow">Transferencia manual</p>
        <h1>{course.title}</h1>
        <p className="lead">{formatPrice(course.price)}</p>
        <p className="muted">
          Alias: {process.env.NEXT_PUBLIC_BANK_ALIAS || "lumen.pagos"}
          <br />
          CBU: {process.env.NEXT_PUBLIC_BANK_CBU || "0000000000000000000000"}
        </p>
        <p className="muted">
          Realiza la transferencia por el importe indicado y luego envianos el comprobante desde la pagina de contacto.
          El equipo de LUMEN revisara el pago y te confirmara el acceso correspondiente.
        </p>
        <a className="button" href="/contacto">Enviar comprobante por contacto</a>
      </section>
    </main>
  );
}
