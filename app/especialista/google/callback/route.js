import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { exchangeGoogleCode, getGoogleUserEmail, hasGoogleCalendarConfig } from "../../../../lib/googleCalendar";

export async function GET(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const googleError = url.searchParams.get("error");
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/especialista`, { status: 303 });
  }

  if (googleError) {
    return NextResponse.redirect(`${origin}/especialista?error=${encodeURIComponent("No se pudo conectar Google Calendar")}`, {
      status: 303,
    });
  }

  if (!hasGoogleCalendarConfig() || !code || !state) {
    return NextResponse.redirect(`${origin}/especialista?error=${encodeURIComponent("Configuracion de Google Calendar incompleta")}`, {
      status: 303,
    });
  }

  const { data: specialist } = await supabase
    .from("appointment_specialists")
    .select("id")
    .eq("id", state)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!specialist) {
    return NextResponse.redirect(`${origin}/especialista?error=${encodeURIComponent("Perfil de especialista no encontrado")}`, {
      status: 303,
    });
  }

  try {
    const tokenData = await exchangeGoogleCode({ origin, code });
    const calendarEmail = await getGoogleUserEmail(tokenData.access_token);

    const payload = {
      specialist_id: specialist.id,
      user_id: userData.user.id,
      google_calendar_id: "primary",
      google_calendar_email: calendarEmail,
      google_calendar_access_token: tokenData.access_token,
      google_calendar_token_expires_at: new Date(Date.now() + Number(tokenData.expires_in || 3600) * 1000).toISOString(),
      google_calendar_connected_at: new Date().toISOString(),
      calendar_sync_enabled: true,
    };

    if (tokenData.refresh_token) {
      payload.google_calendar_refresh_token = tokenData.refresh_token;
    }

    const { error } = await supabase
      .from("specialist_calendar_connections")
      .upsert(payload, { onConflict: "specialist_id" });

    if (error) {
      throw error;
    }

    return NextResponse.redirect(`${origin}/especialista?message=Google Calendar conectado`, { status: 303 });
  } catch (error) {
    return NextResponse.redirect(`${origin}/especialista?error=${encodeURIComponent(error.message || "No se pudo conectar Google Calendar")}`, {
      status: 303,
    });
  }
}
