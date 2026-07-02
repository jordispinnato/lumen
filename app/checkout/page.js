import { demoCourses, formatPrice, normalizeCourse } from "../../lib/courses";
import { createSupabaseServerClient } from "../../lib/supabase/server";

async function getCheckoutCourse(slug) {
  const fallback = demoCourses.find((item) => item.slug === slug) || demoCourses[0];

  if (!slug) {
    return fallback;
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("slug,title,summary,description,cover_image_url,instructor,level,total_duration,category,price,status")
    .eq("slug", slug)
    .maybeSingle();

  return data ? normalizeCourse(data) : fallback;
}

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  const course = await getCheckoutCourse(params?.curso);
  const error = params?.error;
  const message = params?.message;

  return (
    <main className="section checkout-section">
      <article className="checkout-card">
        <div className="checkout-media">
          {course.coverImageUrl ? (
            <img alt="" src={course.coverImageUrl} />
          ) : (
            <div className="course-cover-placeholder">LUMEN</div>
          )}
        </div>

        <div className="checkout-content">
          <p className="eyebrow">Checkout</p>
          <h1>{course.title}</h1>
          <p className="lead">{course.summary}</p>

          <div className="checkout-meta">
            {course.category || course.type ? <span>{course.category || course.type}</span> : null}
            {course.totalDuration || course.duration ? <span>{course.totalDuration || course.duration}</span> : null}
            {course.level ? <span>{course.level}</span> : null}
          </div>

          <p className="checkout-price">{formatPrice(course.price)}</p>
          <p className="muted">
            Vas a pagar de forma segura con Mercado Pago. Cuando el pago se confirme, el curso se habilita en tu aula.
          </p>
          {error ? <p className="notice error">{error}</p> : null}
          {message ? <p className="notice success">{message}</p> : null}

          <form action="/api/mercadopago/create-preference" method="post">
            <input type="hidden" name="courseSlug" value={course.slug} />
            <button className="button" type="submit">Pagar con Mercado Pago</button>
          </form>
        </div>
      </article>
    </main>
  );
}
