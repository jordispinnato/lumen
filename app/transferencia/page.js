import { demoCourses, formatPrice } from "@/lib/courses";

export default async function TransferPage({ searchParams }) {
  const params = await searchParams;
  const course = demoCourses.find((item) => item.slug === params?.curso) || demoCourses[0];

  return (
    <main className="section">
      <form className="form-card">
        <p className="eyebrow">Transferencia manual</p>
        <h1>{course.title}</h1>
        <p className="lead">{formatPrice(course.price)}</p>
        <p className="muted">
          Alias: {process.env.NEXT_PUBLIC_BANK_ALIAS || "lumen.pagos"}
          <br />
          CBU: {process.env.NEXT_PUBLIC_BANK_CBU || "0000000000000000000000"}
        </p>
        <label>
          Email de la cuenta
          <input type="email" name="email" required />
        </label>
        <label>
          Mensaje o número de comprobante
          <textarea name="message" rows="4" />
        </label>
        <button className="button" type="button">Enviar comprobante</button>
        <p className="muted">Luego esto guardará una solicitud para aprobar desde el panel admin.</p>
      </form>
    </main>
  );
}
