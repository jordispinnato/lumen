import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectWith(origin, params) {
  return NextResponse.redirect(`${origin}/mi-cuenta?${new URLSearchParams(params).toString()}#configuracion`, {
    status: 303,
  });
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const newEmail = String(formData.get("newEmail") || "").trim().toLowerCase();
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/mi-cuenta`, { status: 303 });
  }

  if (!newEmail || !newEmail.includes("@")) {
    return redirectWith(origin, { error: "Ingresa un email valido." });
  }

  if (newEmail === userData.user.email) {
    return redirectWith(origin, { error: "Ese email ya esta asociado a tu cuenta." });
  }

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${origin}/mi-cuenta?message=Email confirmado correctamente.#configuracion` }
  );

  if (error) {
    return redirectWith(origin, { error: error.message });
  }

  return redirectWith(origin, {
    message: "Te enviamos un email de confirmacion para validar el cambio.",
  });
}
