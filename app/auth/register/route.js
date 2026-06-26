import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request) {
  const formData = await request.formData();
  const fullName = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/aula`,
    },
  });

  if (error) {
    return NextResponse.redirect(`${origin}/registro?error=${encodeURIComponent(error.message)}`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent("Cuenta creada. Revisá tu email para confirmar el acceso.")}`, {
    status: 303,
  });
}
