import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoCourses, formatPrice, normalizeCourse } from "@/lib/courses";

export function generateStaticParams() {
  return demoCourses.map((course) => ({ slug: course.slug }));
}

export default async function CourseDetailPage({ params }) {
  const routeParams = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("slug,title,summary,price,status")
    .eq("slug", routeParams.slug)
    .eq("status", "published")
    .maybeSingle();
  const course = data
    ? normalizeCourse(data)
    : demoCourses.find((item) => item.slug === routeParams.slug);

  if (!course) {
    notFound();
  }

  return (
    <main className="section">
      <div className="section-head">
        <p className="eyebrow">{course.type}</p>
        <h1>{course.title}</h1>
        <p className="lead">{course.summary}</p>
        <p className="price">{formatPrice(course.price)}</p>
        <div className="actions">
          <a className="button" href={`/checkout?curso=${course.slug}`}>Comprar con Mercado Pago</a>
          <a className="secondary-button" href={`/transferencia?curso=${course.slug}`}>Pagar por transferencia</a>
        </div>
      </div>

      <div className="grid">
        <article className="card">
          <h3>Contenido</h3>
          <p>Videos, actividades y materiales descargables dentro del aula.</p>
        </article>
        <article className="card">
          <h3>Acompañamiento</h3>
          <p>Posibilidad de sumar orientación profesional personalizada.</p>
        </article>
        <article className="card">
          <h3>Acceso</h3>
          <p>Se habilita automáticamente cuando el pago queda aprobado.</p>
        </article>
      </div>
    </main>
  );
}
