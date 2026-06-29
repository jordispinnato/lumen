import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

function formatTime(minutes) {
  if (!minutes) {
    return "Clase online";
  }

  return `${minutes} min`;
}

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getEmbedUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (url.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${url.pathname.replace("/", "")}`;
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
    }
  } catch (error) {
    return "";
  }

  return "";
}

function buildLessonHref(courseSlug, lessonId) {
  const params = new URLSearchParams({ curso: courseSlug });

  if (lessonId) {
    params.set("lesson", lessonId);
  }

  return `/aula?${params.toString()}`;
}

export default async function ClassroomPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      created_at,
      courses (
        id,
        slug,
        title,
        summary,
        cover_image_url,
        instructor,
        total_duration,
        price
      )
    `)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  const enrolledCourses = (enrollments || []).map((item) => item.courses).filter(Boolean);
  const activeCourse = enrolledCourses.find((course) => course.slug === params?.curso) || enrolledCourses[0];

  if (!activeCourse) {
    return (
      <main className="section">
        <div className="dashboard-shell">
          <section className="panel">
            <h2>Todavia no tenes cursos habilitados</h2>
            <p className="muted">
              Cuando una compra o inscripcion sea aprobada, el curso aparecera en esta aula.
            </p>
            <a className="button" href="/cursos">Ver cursos</a>
          </section>
        </div>
      </main>
    );
  }

  const [{ data: modules }, { data: lessons }, { data: materials }, { data: progress }] = await Promise.all([
    supabase
      .from("course_modules")
      .select("id,title,description,position,status")
      .eq("course_id", activeCourse.id)
      .eq("status", "published")
      .order("position", { ascending: true }),
    supabase
      .from("lessons")
      .select("id,module_id,title,description,video_url,position,duration_minutes,status,is_preview,objectives")
      .eq("course_id", activeCourse.id)
      .eq("status", "published")
      .order("position", { ascending: true }),
    supabase
      .from("course_materials")
      .select("id,title,lesson_id,file_path,file_name,file_type,material_type,external_url,status,position")
      .eq("course_id", activeCourse.id)
      .eq("status", "published")
      .order("position", { ascending: true }),
    supabase
      .from("lesson_progress")
      .select("lesson_id,completed_at,last_viewed_at")
      .eq("user_id", data.user.id)
      .eq("course_id", activeCourse.id),
  ]);

  const progressByLesson = new Map((progress || []).map((item) => [item.lesson_id, item]));
  const orderedLessons = lessons || [];
  const latestViewed = [...(progress || [])]
    .filter((item) => item.last_viewed_at)
    .sort((a, b) => String(b.last_viewed_at).localeCompare(String(a.last_viewed_at)))[0];
  const requestedLesson = orderedLessons.find((lesson) => lesson.id === params?.lesson);
  const lastViewedLesson = orderedLessons.find((lesson) => lesson.id === latestViewed?.lesson_id);
  const activeLesson = requestedLesson || lastViewedLesson || orderedLessons[0];
  const activeLessonIndex = activeLesson ? orderedLessons.findIndex((lesson) => lesson.id === activeLesson.id) : -1;
  const previousLesson = activeLessonIndex > 0 ? orderedLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex >= 0 && activeLessonIndex < orderedLessons.length - 1 ? orderedLessons[activeLessonIndex + 1] : null;
  const completedLessons = new Set((progress || []).filter((item) => item.completed_at).map((item) => item.lesson_id));
  const totalLessons = orderedLessons.length;
  const completedCount = completedLessons.size;
  const pendingCount = Math.max(totalLessons - completedCount, 0);
  const progressPercent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const lessonsByModule = new Map();

  orderedLessons.forEach((lesson) => {
    const key = lesson.module_id || "general";
    lessonsByModule.set(key, [...(lessonsByModule.get(key) || []), lesson]);
  });

  if (activeLesson) {
    await supabase.from("lesson_progress").upsert(
      {
        user_id: data.user.id,
        course_id: activeCourse.id,
        lesson_id: activeLesson.id,
        last_viewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );
  }

  const activeMaterials = (materials || []).filter((material) => {
    return !material.lesson_id || material.lesson_id === activeLesson?.id;
  });
  const materialsWithUrls = await Promise.all(
    activeMaterials.map(async (material) => {
      if (!material.file_path) {
        return { ...material, signedUrl: "" };
      }

      const { data: signed } = await supabase.storage
        .from("course-materials")
        .createSignedUrl(material.file_path, 60 * 10);

      return {
        ...material,
        signedUrl: signed?.signedUrl || "",
      };
    })
  );
  const embedUrl = getEmbedUrl(activeLesson?.video_url);
  const objectives = splitLines(activeLesson?.objectives);

  return (
    <main className="section classroom-section">
      <div className="classroom-shell">
        <aside className="classroom-sidebar">
          <div className="classroom-course-switcher">
            <p className="eyebrow">Mis cursos</p>
            {enrolledCourses.map((course) => (
              <a className={course.id === activeCourse.id ? "is-active" : ""} href={buildLessonHref(course.slug)} key={course.id}>
                {course.title}
              </a>
            ))}
          </div>

          <div className="progress-panel">
            <div>
              <strong>{progressPercent}%</strong>
              <span>{completedCount} completadas · {pendingCount} pendientes</span>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <nav className="module-sidebar" aria-label="Clases del curso">
            {(modules || []).map((moduleItem) => (
              <section key={moduleItem.id}>
                <p>{moduleItem.position}. {moduleItem.title}</p>
                {(lessonsByModule.get(moduleItem.id) || []).map((lesson) => {
                  const isCompleted = completedLessons.has(lesson.id);
                  const isCurrent = activeLesson?.id === lesson.id;

                  return (
                    <a
                      className={`${isCurrent ? "is-active" : ""} ${isCompleted ? "is-completed" : ""}`}
                      href={buildLessonHref(activeCourse.slug, lesson.id)}
                      key={lesson.id}
                    >
                      <span>{lesson.title}</span>
                      <small>{isCompleted ? "Completada" : formatTime(lesson.duration_minutes)}</small>
                    </a>
                  );
                })}
              </section>
            ))}
            {!modules?.length && orderedLessons.length ? (
              <section>
                <p>Clases</p>
                {orderedLessons.map((lesson) => (
                  <a
                    className={`${activeLesson?.id === lesson.id ? "is-active" : ""} ${completedLessons.has(lesson.id) ? "is-completed" : ""}`}
                    href={buildLessonHref(activeCourse.slug, lesson.id)}
                    key={lesson.id}
                  >
                    <span>{lesson.title}</span>
                    <small>{completedLessons.has(lesson.id) ? "Completada" : formatTime(lesson.duration_minutes)}</small>
                  </a>
                ))}
              </section>
            ) : null}
          </nav>
        </aside>

        <section className="classroom-main">
          {params?.finalizado ? (
            <section className="panel completion-panel">
              <p className="eyebrow">Curso finalizado</p>
              <h1>Felicitaciones, terminaste el curso.</h1>
              <p className="lead">La estructura para certificados queda preparada para una proxima etapa.</p>
              <a className="button" href="/mi-cuenta#cursos">Volver a Mis Cursos</a>
            </section>
          ) : null}

          {activeLesson ? (
            <>
              <div className="classroom-video">
                {embedUrl ? (
                  <iframe
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    src={embedUrl}
                    title={activeLesson.title}
                  />
                ) : activeLesson.video_url ? (
                  <a className="button" href={activeLesson.video_url} target="_blank" rel="noreferrer">Abrir video</a>
                ) : (
                  <span>Video pendiente</span>
                )}
              </div>

              <article className="panel lesson-panel">
                <p className="eyebrow">{activeCourse.title}</p>
                <h1>{activeLesson.title}</h1>
                <p className="muted">{activeLesson.description || activeCourse.summary}</p>

                {objectives.length ? (
                  <>
                    <h3>Objetivos</h3>
                    <ul className="clean-list">
                      {objectives.map((objective) => <li key={objective}>{objective}</li>)}
                    </ul>
                  </>
                ) : null}

                <h3>Materiales</h3>
                {materialsWithUrls.length ? (
                  <ul className="lesson-list">
                    {materialsWithUrls.map((material) => (
                      <li key={material.id}>
                        <div>
                          <strong>{material.title}</strong>
                          <span>{material.file_name || material.external_url || "Material complementario"}</span>
                        </div>
                        {material.signedUrl ? (
                          <a href={material.signedUrl} target="_blank" rel="noreferrer">Descargar</a>
                        ) : material.external_url ? (
                          <a href={material.external_url} target="_blank" rel="noreferrer">Abrir link</a>
                        ) : (
                          <span>Sin descarga</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Esta clase todavia no tiene materiales cargados.</p>
                )}

                <div className="lesson-actions">
                  {previousLesson ? (
                    <a className="secondary-button" href={buildLessonHref(activeCourse.slug, previousLesson.id)}>Anterior</a>
                  ) : <span />}
                  <form action="/aula/progreso" method="post">
                    <input name="courseId" type="hidden" value={activeCourse.id} />
                    <input name="courseSlug" type="hidden" value={activeCourse.slug} />
                    <input name="lessonId" type="hidden" value={activeLesson.id} />
                    <button className="button" name="action" value="complete" type="submit">
                      {completedLessons.has(activeLesson.id) ? "Completada" : "Marcar como completada"}
                    </button>
                  </form>
                  {nextLesson ? (
                    <a className="secondary-button" href={buildLessonHref(activeCourse.slug, nextLesson.id)}>Siguiente</a>
                  ) : <span />}
                </div>
              </article>
            </>
          ) : (
            <section className="panel">
              <h2>Este curso todavia no tiene clases publicadas</h2>
              <p className="muted">Cuando se carguen modulos y lecciones, van a aparecer aca.</p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
