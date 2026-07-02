import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const lessonId = String(formData.get("lessonId") || "").trim();
  const action = String(formData.get("action") || "save").trim();
  const courseId = String(formData.get("courseId") || "").trim();
  const moduleId = String(formData.get("moduleId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const videoUrl = String(formData.get("videoUrl") || "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") || 0);
  const position = Number(formData.get("position") || 0);
  const status = String(formData.get("status") || "published");
  const objectives = String(formData.get("objectives") || "").trim();
  const isPreview = formData.get("isPreview") === "on";
  const supabase = await createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login`, { status: 303 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(`${origin}/admin?error=No autorizado`, { status: 303 });
  }

  if (action === "delete") {
    if (!lessonId) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Leccion incompleta")}`, { status: 303 });
    }

    await supabase.from("course_materials").update({ lesson_id: null }).eq("lesson_id", lessonId);
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

    if (error) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
    }

    return NextResponse.redirect(`${origin}/admin?message=Leccion eliminada#lecciones`, { status: 303 });
  }

  if (!courseId || !title) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Completa curso y titulo de la leccion")}`, {
      status: 303,
    });
  }

  const payload = {
    course_id: courseId,
    module_id: moduleId || null,
    title,
    description: description || null,
    video_url: videoUrl || null,
    duration_minutes: Number.isFinite(durationMinutes) ? Math.max(0, Math.round(durationMinutes)) : 0,
    position: Number.isFinite(position) ? Math.max(0, Math.round(position)) : 0,
    status,
    objectives: objectives || null,
    is_preview: isPreview,
  };

  const { error } = lessonId
    ? await supabase.from("lessons").update(payload).eq("id", lessonId)
    : await supabase.from("lessons").insert(payload);

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}/admin?message=Lección guardada`, { status: 303 });
}
