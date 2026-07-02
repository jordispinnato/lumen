import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "../../../lib/safeRedirect";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request) {
  const formData = await request.formData();
  const fullName = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const nextPath = getSafeRedirectPath(formData.get("next"), "/mi-cuenta");
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}${nextPath}`,
    },
  });

  if (error) {
    const params = new URLSearchParams({
      error: error.message,
      next: nextPath,
    });

    return NextResponse.redirect(`${origin}/registro?${params.toString()}`, {
      status: 303,
    });
  }

  const loginParams = new URLSearchParams({
    message: "Cuenta creada. Revisa tu email para confirmar el acceso.",
    next: nextPath,
  });

  return NextResponse.redirect(`${origin}/login?${loginParams.toString()}`, {
    status: 303,
  });
}
