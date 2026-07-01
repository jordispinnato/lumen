import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
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
    return { response: NextResponse.redirect(`${origin}/admin?error=No autorizado#usuarios`, { status: 303 }) };
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
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Accion de inscripcion incompleta")}#usuarios`, {
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

  const { error } = await adminSupabase.from("enrollments").delete().eq("id", enrollmentId);

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}#usuarios`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=Curso quitado del usuario#usuarios`, { status: 303 });
}
