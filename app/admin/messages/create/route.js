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
    return { response: NextResponse.redirect(`${origin}/admin?error=No autorizado`, { status: 303 }) };
  }

  return { user: userData.user };
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const messageType = String(formData.get("messageType") || "general").trim();
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!subject || !body) {
    return NextResponse.redirect(`${origin}/admin?error=Completa titulo y mensaje#usuarios`, { status: 303 });
  }

  const adminSupabase = createSupabaseAdminClient();

  if (!adminSupabase) {
    return NextResponse.redirect(`${origin}/admin?error=Falta SUPABASE_SERVICE_ROLE_KEY#usuarios`, { status: 303 });
  }

  const { error } = await adminSupabase.from("user_messages").insert({
    user_id: null,
    subject,
    body,
    message_type: messageType || "general",
  });

  if (error) {
    if (error.code === "PGRST205" || error.message?.includes("user_messages")) {
      return NextResponse.redirect(
        `${origin}/admin?error=${encodeURIComponent("Falta ejecutar el SQL 015 para activar mensajes, notificaciones y carrito.")}#usuarios`,
        { status: 303 }
      );
    }

    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}#usuarios`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}/admin?message=Mensaje enviado a todos los usuarios#usuarios`, {
    status: 303,
  });
}
