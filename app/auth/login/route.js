import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { getSafeRedirectPath } from "../../../lib/safeRedirect";

export async function POST(request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const nextPath = getSafeRedirectPath(formData.get("next"), "/mi-cuenta");
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const params = new URLSearchParams({
      error: error.message,
      next: nextPath,
    });

    return NextResponse.redirect(`${origin}/login?${params.toString()}`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}${nextPath}`, { status: 303 });
}
