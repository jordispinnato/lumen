import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demoCourses, formatPrice, normalizeCourse } from "@/lib/courses";

export default async function CoursesPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("slug,title,summary,price,status")
    .eq("status", "published")
    .order("created_at", { ascending: true });
  const courses = data?.length ? data.map(normalizeCourse) : demoCourses;

  return (
    <main className="section">
      <div className="section-head">
        <p className="eyebrow">Academia LUMEN</p>
        <h1>Cursos disponibles</h1>
        <p className="lead">
          Estos cursos se leen desde Supabase. Si la base está vacía, la web muestra cursos de ejemplo.
        </p>
      </div>

      <div className="grid">
        {courses.map((course) => (
          <article className="card" key={course.slug}>
            <p className="eyebrow">{course.type}</p>
            <h3>{course.title}</h3>
            <p>{course.summary}</p>
            <p className="muted">{course.audience} · {course.duration}</p>
            <p className="price">{formatPrice(course.price)}</p>
            <div className="actions">
              <a className="button" href={`/cursos/${course.slug}`}>Ver detalle</a>
              <a className="secondary-button" href={`/checkout?curso=${course.slug}`}>Comprar</a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
