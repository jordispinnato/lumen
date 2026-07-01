import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/especialista`, { status: 303 });
  }

  const { error } = await supabase
    .from("specialist_calendar_connections")
    .update({
      google_calendar_id: "primary",
      google_calendar_email: null,
      google_calendar_access_token: null,
      google_calendar_refresh_token: null,
      google_calendar_token_expires_at: null,
      google_calendar_connected_at: null,
      calendar_sync_enabled: false,
    })
    .eq("user_id", userData.user.id);

  if (error) {
    return NextResponse.redirect(`${origin}/especialista?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/especialista?message=Google Calendar desconectado`, { status: 303 });
}
