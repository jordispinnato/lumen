import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectToAdmin(origin, type, message) {
  return NextResponse.redirect(`${origin}/admin?${type}=${encodeURIComponent(message)}#usuarios`, { status: 303 });
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const userId = String(formData.get("userId") || "").trim();
  const courseId = String(formData.get("courseId") || "").trim();
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
    return redirectToAdmin(origin, "error", "No autorizado");
  }

  if (!userId || !courseId) {
    return redirectToAdmin(origin, "error", "Falta seleccionar usuario y curso");
  }

  const writeSupabase = createSupabaseAdminClient() || supabase;

  const { data: targetProfile, error: targetProfileError } = await writeSupabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (targetProfileError) {
    return redirectToAdmin(origin, "error", targetProfileError.message);
  }

  if (!targetProfile) {
    return redirectToAdmin(origin, "error", "No se encontro el usuario");
  }

  const { data: course, error: courseError } = await writeSupabase
    .from("courses")
    .select("id,title")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    return redirectToAdmin(origin, "error", courseError.message);
  }

  if (!course) {
    return redirectToAdmin(origin, "error", "No se encontro el curso");
  }

  const { data: existingEnrollment, error: existingError } = await writeSupabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existingError) {
    return redirectToAdmin(origin, "error", existingError.message);
  }

  if (existingEnrollment) {
    return redirectToAdmin(origin, "message", `El curso ${course.title || ""} ya estaba habilitado`);
  }

  const { error } = await writeSupabase.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
  });

  if (error) {
    if (error.code === "23505") {
      return redirectToAdmin(origin, "message", `El curso ${course.title || ""} ya estaba habilitado`);
    }

    return redirectToAdmin(origin, "error", error.message);
  }

  return redirectToAdmin(origin, "message", `Curso habilitado: ${course.title || "curso"}`);
}
