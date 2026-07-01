import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectToAdmin(origin, type, message) {
  return NextResponse.redirect(`${origin}/admin?${type}=${encodeURIComponent(message)}#usuarios`, { status: 303 });
}

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
    return { response: redirectToAdmin(origin, "error", "No autorizado") };
  }

  return { user: userData.user };
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const enrollmentId = String(formData.get("enrollmentId") || "").trim();
  const action = String(formData.get("action") || "").trim();
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!enrollmentId || action !== "delete") {
    return redirectToAdmin(origin, "error", "Accion de inscripcion incompleta");
  }

  const writeSupabase = createSupabaseAdminClient() || supabase;
  const { error } = await writeSupabase.from("enrollments").delete().eq("id", enrollmentId);

  if (error) {
    return redirectToAdmin(origin, "error", error.message);
  }

  return redirectToAdmin(origin, "message", "Curso quitado del usuario");
}
