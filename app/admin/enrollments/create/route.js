import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

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
    return NextResponse.redirect(`${origin}/admin?error=No autorizado#usuarios`, { status: 303 });
  }

  if (!userId || !courseId) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Falta seleccionar usuario y curso")}#usuarios`, {
      status: 303,
    });
  }

  const adminSupabase = createSupabaseAdminClient();

  if (!adminSupabase) {
    return NextResponse.redirect(
      `${origin}/admin?error=${encodeURIComponent("Falta configurar SUPABASE_SERVICE_ROLE_KEY")}#usuarios`,
      { status: 303 },
    );
  }

  const { data: targetProfile } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!targetProfile) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("No se encontro el usuario")}#usuarios`, {
      status: 303,
    });
  }

  const { data: course } = await adminSupabase.from("courses").select("id").eq("id", courseId).maybeSingle();

  if (!course) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("No se encontro el curso")}#usuarios`, {
      status: 303,
    });
  }

  const { error } = await adminSupabase.from("enrollments").upsert({
    user_id: userId,
    course_id: courseId,
  }, {
    onConflict: "user_id,course_id",
  });

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}#usuarios`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}/admin?message=Curso habilitado#usuarios`, { status: 303 });
}
