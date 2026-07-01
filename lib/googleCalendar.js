function getGoogleRedirectUri(origin) {
  return process.env.GOOGLE_CALENDAR_REDIRECT_URI || `${origin}/especialista/google/callback`;
}

export function hasGoogleCalendarConfig() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildGoogleCalendarAuthUrl({ origin, state }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: getGoogleRedirectUri(origin),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: [
      "openid",
      "email",
      "https://www.googleapis.com/auth/calendar.events",
    ].join(" "),
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode({ origin, code }) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: getGoogleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo conectar Google Calendar");
  }

  return response.json();
}

export async function getGoogleUserEmail(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.email || null;
}

async function refreshGoogleAccessToken(refreshToken) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo renovar Google Calendar");
  }

  return response.json();
}

function isExpired(value) {
  if (!value) {
    return true;
  }

  return new Date(value).getTime() <= Date.now() + 60_000;
}

function formatDateTimeForGoogle(dateValue, timeValue) {
  const time = timeValue?.slice(0, 5) || "09:00";
  return `${dateValue}T${time}:00-03:00`;
}

function addMinutes(dateTimeValue, minutes) {
  const date = new Date(dateTimeValue);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

export async function createGoogleCalendarEvent({ supabase, specialist, connection, slot, booking }) {
  if (!hasGoogleCalendarConfig() || !connection?.calendar_sync_enabled || !connection?.google_calendar_refresh_token) {
    return { skipped: true };
  }

  let accessToken = connection.google_calendar_access_token;
  let tokenExpiresAt = connection.google_calendar_token_expires_at;

  if (!accessToken || isExpired(tokenExpiresAt)) {
    const refreshed = await refreshGoogleAccessToken(connection.google_calendar_refresh_token);
    accessToken = refreshed.access_token;
    tokenExpiresAt = new Date(Date.now() + Number(refreshed.expires_in || 3600) * 1000).toISOString();

    await supabase
      .from("specialist_calendar_connections")
      .update({
        google_calendar_access_token: accessToken,
        google_calendar_token_expires_at: tokenExpiresAt,
      })
      .eq("id", connection.id);
  }

  const start = formatDateTimeForGoogle(slot.slot_date, slot.slot_time);
  const end = addMinutes(start, specialist.duration_minutes || 50);
  const calendarId = encodeURIComponent(connection.google_calendar_id || "primary");
  const patientLabel = booking.patient_name || booking.patient_email || "Paciente LUMEN";

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?sendUpdates=all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: `LUMEN - Consulta con ${patientLabel}`,
      description: [
        "Turno reservado desde LUMEN.",
        `Paciente: ${patientLabel}`,
        booking.patient_email ? `Email: ${booking.patient_email}` : "",
      ].filter(Boolean).join("\n"),
      start: {
        dateTime: start,
        timeZone: "America/Argentina/Buenos_Aires",
      },
      end: {
        dateTime: end,
        timeZone: "America/Argentina/Buenos_Aires",
      },
      attendees: booking.patient_email ? [{ email: booking.patient_email, displayName: booking.patient_name || undefined }] : [],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo crear el evento en Google Calendar");
  }

  return { created: true, event: await response.json() };
}
