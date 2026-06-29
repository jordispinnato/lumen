import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function requireAdmin(supabase, origin) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { response: NextResponse.redirect(`${origin}/login`, { status: 303 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { response: NextResponse.redirect(`${origin}/admin?error=No autorizado`, { status: 303 }) };
  }

  return { user: userData.user };
}

function copySlug(slug) {
  return `${slug}-copia-${Date.now()}`;
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const courseId = String(formData.get("courseId") || "").trim();
  const action = String(formData.get("action") || "").trim();
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!courseId || !action) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Accion de curso incompleta")}`, {
      status: 303,
    });
  }

  if (action === "publish" || action === "unpublish" || action === "archive") {
    const status = action === "publish" ? "published" : action === "archive" ? "archived" : "draft";
    const { error } = await supabase.from("courses").update({ status }).eq("id", courseId);

    if (error) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
    }

    return NextResponse.redirect(`${origin}/admin?message=Curso actualizado`, { status: 303 });
  }

  if (action === "delete") {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);

    if (error) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
    }

    return NextResponse.redirect(`${origin}/admin?message=Curso eliminado`, { status: 303 });
  }

  if (action === "duplicate") {
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("No se encontro el curso")}`, { status: 303 });
    }

    const { id, created_at: _createdAt, slug, title, status: _status, ...courseCopy } = course;
    const { data: newCourse, error: insertError } = await supabase
      .from("courses")
      .insert({
        ...courseCopy,
        slug: copySlug(slug),
        title: `${title} (copia)`,
        status: "draft",
      })
      .select("id")
      .maybeSingle();

    if (insertError || !newCourse) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(insertError?.message || "No se pudo duplicar")}`, {
        status: 303,
      });
    }

    const { data: modules } = await supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("position", { ascending: true });

    const moduleIdMap = new Map();

    for (const moduleItem of modules || []) {
      const { id: moduleId, created_at, course_id, ...moduleCopy } = moduleItem;
      const { data: copiedModule } = await supabase
        .from("course_modules")
        .insert({ ...moduleCopy, course_id: newCourse.id })
        .select("id")
        .maybeSingle();

      if (copiedModule?.id) {
        moduleIdMap.set(moduleId, copiedModule.id);
      }
    }

    const { data: lessons } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("position", { ascending: true });

    for (const lesson of lessons || []) {
      const { id: lessonId, created_at, course_id, module_id, ...lessonCopy } = lesson;
      await supabase.from("lessons").insert({
        ...lessonCopy,
        course_id: newCourse.id,
        module_id: moduleIdMap.get(module_id) || null,
      });
    }

    return NextResponse.redirect(`${origin}/admin?message=Curso duplicado como borrador`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Accion no reconocida")}`, { status: 303 });
}
