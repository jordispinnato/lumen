import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { demoCourses, formatPrice, normalizeCourse } from "../../../lib/courses";

export function generateStaticParams() {
  return demoCourses.map((course) => ({ slug: course.slug }));
}

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function CourseDetailPage({ params }) {
  const routeParams = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("courses")
    .select("id,slug,title,summary,description,cover_image_url,intro_video_url,instructor,level,total_duration,category,price,status,learning_outcomes,audience,requirements,faq")
    .eq("slug", routeParams.slug)
    .eq("status", "published")
    .maybeSingle();
  const course = data
    ? normalizeCourse(data)
    : demoCourses.find((item) => item.slug === routeParams.slug);

  if (!course) {
    notFound();
  }

  const [{ data: modules }, { data: lessons }, { data: materials }, { data: enrollment }] = data
    ? await Promise.all([
        supabase
          .from("course_modules")
          .select("id,title,description,position,status")
          .eq("course_id", data.id)
          .eq("status", "published")
          .order("position", { ascending: true }),
        supabase
          .from("lessons")
          .select("id,module_id,title,description,duration_minutes,position,status,is_preview")
          .eq("course_id", data.id)
          .eq("status", "published")
          .order("position", { ascending: true }),
        supabase
          .from("course_materials")
          .select("id,title,lesson_id,material_type,status")
          .eq("course_id", data.id)
          .eq("status", "published")
          .order("position", { ascending: true }),
        userData.user
          ? supabase
              .from("enrollments")
              .select("id")
              .eq("user_id", userData.user.id)
              .eq("course_id", data.id)
              .maybeSingle()
          : { data: null },
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: null }];

  const lessonsByModule = new Map();
  (lessons || []).forEach((lesson) => {
    const key = lesson.module_id || "general";
    lessonsByModule.set(key, [...(lessonsByModule.get(key) || []), lesson]);
  });
  const totalLessons = lessons?.length || 0;
  const totalModules = modules?.length || 0;
  const downloadableMaterials = materials?.length || 0;
  const learningOutcomes = splitLines(course.learningOutcomes);
  const audience = splitLines(course.audience);
  const requirements = splitLines(course.requirements);
  const faqItems = splitLines(course.faq);
  const isEnrolled = Boolean(enrollment);

  return (
    <main className="section">
      <div className="dashboard-shell">
        <article className="course-landing">
          <div className="course-landing-copy">
            <p className="eyebrow">{course.category || course.type}</p>
            <h1>{course.title}</h1>
            <p className="lead">{course.summary}</p>
            <div className="course-facts">
              {course.instructor ? <span>{course.instructor}</span> : null}
              {course.level ? <span>{course.level}</span> : null}
              {course.totalDuration ? <span>{course.totalDuration}</span> : null}
              <span>{totalModules} módulos</span>
              <span>{totalLessons} clases</span>
              {downloadableMaterials ? <span>{downloadableMaterials} materiales</span> : null}
            </div>
            <p className="price">{formatPrice(course.price)}</p>
            <div className="actions">
              {isEnrolled ? (
                <a className="button" href={`/aula?curso=${course.slug}`}>Acceder al aula</a>
              ) : userData.user ? (
                <a className="button" href={`/checkout?curso=${course.slug}`}>Comprar curso</a>
              ) : (
                <a className="button" href={`/login?next=/checkout?curso=${course.slug}`}>Ingresar para comprar</a>
              )}
              <a className="secondary-button" href="/cursos">Ver otros cursos</a>
            </div>
          </div>

          <div className="course-landing-media">
            {course.coverImageUrl ? (
              <img alt="" src={course.coverImageUrl} />
            ) : (
              <div className="course-cover-placeholder">LUMEN</div>
            )}
          </div>
        </article>

        {course.description ? (
          <section className="panel spaced-panel">
            <p className="eyebrow">Descripción</p>
            <p className="muted large-text">{course.description}</p>
          </section>
        ) : null}

        <div className="course-info-layout spaced-panel">
          <section className="panel">
            <h2>Qué aprenderás</h2>
            {learningOutcomes.length ? (
              <ul className="clean-list">
                {learningOutcomes.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p className="muted">El temario se está preparando.</p>
            )}
          </section>
          <section className="panel">
            <h2>A quién está dirigido</h2>
            {audience.length ? (
              <ul className="clean-list">
                {audience.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p className="muted">Personas interesadas en formación y recursos LUMEN.</p>
            )}
          </section>
        </div>

        <section className="panel spaced-panel">
          <div className="admin-section-head">
            <p className="eyebrow">Programa completo</p>
            <h2>Módulos y clases</h2>
          </div>
          {modules?.length ? (
            <div className="program-list">
              {modules.map((moduleItem) => (
                <article key={moduleItem.id}>
                  <div>
                    <strong>{moduleItem.position}. {moduleItem.title}</strong>
                    {moduleItem.description ? <p className="muted">{moduleItem.description}</p> : null}
                  </div>
                  <ul>
                    {(lessonsByModule.get(moduleItem.id) || []).map((lesson) => (
                      <li key={lesson.id}>
                        <span>{lesson.title}</span>
                        <small>{lesson.duration_minutes ? `${lesson.duration_minutes} min` : "Clase online"}</small>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">El programa se verá acá cuando se carguen módulos y lecciones.</p>
          )}
        </section>

        <div className="course-info-layout spaced-panel">
          <section className="panel">
            <h2>Requisitos</h2>
            {requirements.length ? (
              <ul className="clean-list">
                {requirements.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p className="muted">No hay requisitos cargados.</p>
            )}
          </section>
          <section className="panel">
            <h2>Preguntas frecuentes</h2>
            {faqItems.length ? (
              <ul className="clean-list">
                {faqItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p className="muted">Estructura preparada para sumar preguntas frecuentes más adelante.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
