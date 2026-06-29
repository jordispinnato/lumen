import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const courseId = String(formData.get("courseId") || "").trim();
  const courseSlug = String(formData.get("courseSlug") || "").trim();
  const lessonId = String(formData.get("lessonId") || "").trim();
  const action = String(formData.get("action") || "complete").trim();
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/aula`, { status: 303 });
  }

  if (!courseId || !lessonId) {
    return NextResponse.redirect(`${origin}/aula?error=${encodeURIComponent("No se encontro la clase")}`, { status: 303 });
  }

  const timestamp = new Date().toISOString();
  const completedAt = action === "complete" ? timestamp : null;

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: userData.user.id,
      course_id: courseId,
      lesson_id: lessonId,
      completed_at: completedAt,
      last_viewed_at: timestamp,
      updated_at: timestamp,
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return NextResponse.redirect(`${origin}/aula?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId)
    .eq("status", "published");

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id,completed_at")
    .eq("user_id", userData.user.id)
    .eq("course_id", courseId)
    .not("completed_at", "is", null);

  const totalLessons = lessons?.length || 0;
  const completedLessons = new Set((progress || []).map((item) => item.lesson_id)).size;
  const finished = totalLessons > 0 && completedLessons >= totalLessons;
  const params = new URLSearchParams();

  if (courseSlug) {
    params.set("curso", courseSlug);
  }

  if (!finished) {
    params.set("lesson", lessonId);
  } else {
    params.set("finalizado", "1");
  }

  return NextResponse.redirect(`${origin}/aula?${params.toString()}`, { status: 303 });
}
