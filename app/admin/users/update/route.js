import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";

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
  const userId = String(formData.get("userId") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "student").trim();
  const validRoles = new Set(["student", "specialist", "admin"]);
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!userId || !validRoles.has(role)) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Datos de usuario incompletos")}`, {
      status: 303,
    });
  }

  if (userId === auth.user.id && role !== "admin") {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("No podes quitarte el rol admin a vos mismo")}`, {
      status: 303,
    });
  }

  const payload = {
    full_name: fullName || null,
    email: email || null,
    role,
  };

  const { error: profileError } = await supabase.from("profiles").update(payload).eq("id", userId);

  if (profileError) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(profileError.message)}`, { status: 303 });
  }

  if (email) {
    const adminSupabase = createSupabaseAdminClient();

    if (adminSupabase) {
      const { error: authError } = await adminSupabase.auth.admin.updateUserById(userId, {
        email,
        user_metadata: {
          full_name: fullName || null,
        },
      });

      if (authError) {
        return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(authError.message)}`, { status: 303 });
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin?message=Usuario actualizado`, { status: 303 });
}
