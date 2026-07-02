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

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const moduleId = String(formData.get("moduleId") || "").trim();
  const action = String(formData.get("action") || "save").trim();
  const courseId = String(formData.get("courseId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const position = Number(formData.get("position") || 0);
  const status = String(formData.get("status") || "published");
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (action === "delete") {
    if (!moduleId) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Modulo incompleto")}`, { status: 303 });
    }

    await supabase.from("lessons").update({ module_id: null }).eq("module_id", moduleId);
    const { error } = await supabase.from("course_modules").delete().eq("id", moduleId);

    if (error) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
    }

    return NextResponse.redirect(`${origin}/admin?message=Modulo eliminado#modulos`, { status: 303 });
  }

  if (!courseId || !title) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Completa curso y titulo del modulo")}`, {
      status: 303,
    });
  }

  const payload = {
    course_id: courseId,
    title,
    description: description || null,
    position: Number.isFinite(position) ? Math.max(0, Math.round(position)) : 0,
    status,
  };

  const { error } = moduleId
    ? await supabase.from("course_modules").update(payload).eq("id", moduleId)
    : await supabase.from("course_modules").insert(payload);

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=Modulo guardado#modulos`, { status: 303 });
}
