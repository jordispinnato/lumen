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
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/mi-cuenta`, { status: 303 });
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName || null,
      phone: phone || null,
    },
  });

  if (authError) {
    return redirectWith(origin, { error: authError.message });
  }

  const profileUpdate = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userData.user.id);

  if (profileUpdate.error) {
    const fallbackUpdate = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
      })
      .eq("id", userData.user.id);

    if (fallbackUpdate.error) {
      return redirectWith(origin, { error: fallbackUpdate.error.message });
    }
  }

  return redirectWith(origin, { message: "Tus datos se actualizaron correctamente." });
}
