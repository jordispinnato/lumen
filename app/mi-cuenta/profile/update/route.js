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

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userData.user.id);

  if (error) {
    return redirectWith(origin, { error: error.message });
  }

  await supabase.auth.updateUser({
    data: {
      full_name: fullName || null,
      phone: phone || null,
    },
  });

  return redirectWith(origin, { message: "Tus datos se actualizaron correctamente." });
}
