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
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "Psicologia").trim();
  const focus = String(formData.get("focus") || "").trim();
  const session = String(formData.get("session") || "Consulta online de 50 minutos").trim();
  const price = Number(formData.get("price") || 0);
  const status = String(formData.get("status") || "active");

  if (!name) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("El nombre del especialista es obligatorio")}`, {
      status: 303,
    });
  }

  const { error } = await supabase.from("appointment_specialists").insert({
    name,
    role,
    focus,
    session,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
    status,
  });

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=Especialista guardado`, { status: 303 });
}
