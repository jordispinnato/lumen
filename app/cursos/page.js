import { createSupabaseServerClient } from "../../lib/supabase/server";
import { demoCourses, formatPrice, normalizeCourse } from "../../lib/courses";

export default async function CoursesPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("slug,title,summary,price,status,cover_image_url,instructor,level,total_duration,category,featured,display_order")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  const courses = data?.length ? data.map(normalizeCourse) : demoCourses;

  return (
    <main className="section">
      <div className="section-head">
        <p className="eyebrow">Academia LUMEN</p>
        <h1>Cursos disponibles</h1>
        <p className="lead">
          Formaciones asincronicas organizadas por modulos, clases y materiales complementarios.
        </p>
      </div>

      <div className="grid">
        {courses.map((course) => (
          <article className="card course-card" key={course.slug}>
            {course.coverImageUrl ? <img alt="" src={course.coverImageUrl} /> : null}
            <p className="eyebrow">{course.category || course.type}</p>
            <h3>{course.title}</h3>
            <p>{course.summary}</p>
            <p className="muted">
              {course.instructor || course.audience} · {course.level || "Online"} · {course.totalDuration || course.duration}
            </p>
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
