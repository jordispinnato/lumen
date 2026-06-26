import { demoCourses, formatPrice } from "@/lib/courses";

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  const course = demoCourses.find((item) => item.slug === params?.curso) || demoCourses[0];

  return (
    <main className="section">
      <div className="form-card">
        <p className="eyebrow">Checkout</p>
        <h1>{course.title}</h1>
        <p className="lead">{formatPrice(course.price)}</p>
        <p className="muted">
          En producción, este botón creará una preferencia de pago y enviará al alumno a Mercado Pago Checkout Pro.
        </p>
        <form action="/api/mercadopago/create-preference" method="post">
          <input type="hidden" name="courseSlug" value={course.slug} />
          <button className="button" type="submit">Pagar con Mercado Pago</button>
        </form>
      </div>
    </main>
  );
}
