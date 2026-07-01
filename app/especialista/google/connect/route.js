import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { buildGoogleCalendarAuthUrl, hasGoogleCalendarConfig } from "../../../../lib/googleCalendar";

export async function GET(request) {
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/especialista`, { status: 303 });
  }

  if (!hasGoogleCalendarConfig()) {
    return NextResponse.redirect(`${origin}/especialista?error=${encodeURIComponent("Google Calendar todavia no esta configurado")}`, {
      status: 303,
    });
  }

  const { data: specialist } = await supabase
    .from("appointment_specialists")
    .select("id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!specialist) {
    return NextResponse.redirect(`${origin}/especialista?error=${encodeURIComponent("Tu usuario todavia no esta vinculado a un perfil de especialista")}`, {
      status: 303,
    });
  }

  return NextResponse.redirect(buildGoogleCalendarAuthUrl({ origin, state: specialist.id }), { status: 303 });
}
