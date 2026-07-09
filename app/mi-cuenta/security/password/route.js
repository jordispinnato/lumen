import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectWith(origin, params) {
  return NextResponse.redirect(`${origin}/configuracion?${new URLSearchParams(params).toString()}`, {
    status: 303,
  });
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/configuracion`, { status: 303 });
  }

  if (!userData.user.email) {
    return redirectWith(origin, { error: "No encontramos un email asociado a tu cuenta." });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(userData.user.email, {
    redirectTo: `${origin}/configuracion?message=Revisa tu email para cambiar la contrasena.`,
  });

  if (error) {
    return redirectWith(origin, { error: error.message });
  }

  return redirectWith(origin, {
    message: "Te enviamos un enlace seguro para cambiar la contrasena.",
  });
}
