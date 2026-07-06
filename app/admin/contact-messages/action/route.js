import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const messageId = String(formData.get("messageId") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const adminNotes = String(formData.get("adminNotes") || "").trim();
  const validStatuses = new Set(["new", "in_review", "answered", "archived"]);

  if (!messageId || !validStatuses.has(status)) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Datos invalidos para actualizar la consulta.")}#contacto`, { status: 303 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/admin`, { status: 303 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("No tenes permisos para modificar consultas.")}#contacto`, { status: 303 });
  }

  const dataSupabase = createSupabaseAdminClient() || supabase;
  const { error } = await dataSupabase
    .from("contact_messages")
    .update({
      status,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", messageId);

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}#contacto`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=${encodeURIComponent("Consulta actualizada.")}#contacto`, { status: 303 });
}
