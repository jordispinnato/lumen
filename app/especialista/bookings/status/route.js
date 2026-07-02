import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectToSpecialist(origin, type, message) {
  return NextResponse.redirect(`${origin}/especialista?${type}=${encodeURIComponent(message)}#turnos`, { status: 303 });
}

async function getCurrentSpecialist(supabase, userId) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const { data: specialist } = await supabase
    .from("appointment_specialists")
    .select("id,user_id,name")
    .eq("user_id", userId)
    .maybeSingle();

  return { profile, specialist };
}

async function updateBookingStatus(supabase, bookingId, status, userId) {
  const payload = {
    status,
    status_updated_at: new Date().toISOString(),
    status_updated_by: userId,
    ...(status === "cancelled" ? { cancelled_at: new Date().toISOString(), cancelled_by: userId } : {}),
    ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}),
  };

  const enrichedUpdate = await supabase.from("appointment_bookings").update(payload).eq("id", bookingId);

  if (!enrichedUpdate.error) {
    return enrichedUpdate;
  }

  return supabase.from("appointment_bookings").update({ status }).eq("id", bookingId);
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const bookingId = String(formData.get("bookingId") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const validStatuses = new Set(["confirmed", "cancelled", "completed"]);
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/especialista`, { status: 303 });
  }

  if (!bookingId || !validStatuses.has(status)) {
    return redirectToSpecialist(origin, "error", "Estado de turno invalido");
  }

  const dataSupabase = createSupabaseAdminClient() || supabase;
  const { profile, specialist } = await getCurrentSpecialist(dataSupabase, userData.user.id);

  if (!specialist && profile?.role !== "admin") {
    return redirectToSpecialist(origin, "error", "No tenes un perfil de especialista vinculado");
  }

  const { data: booking, error: bookingError } = await dataSupabase
    .from("appointment_bookings")
    .select("id,slot_id,specialist_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    return redirectToSpecialist(origin, "error", "No se encontro el turno");
  }

  if (profile?.role !== "admin" && booking.specialist_id !== specialist?.id) {
    return redirectToSpecialist(origin, "error", "No autorizado");
  }

  const { error } = await updateBookingStatus(dataSupabase, bookingId, status, userData.user.id);

  if (error) {
    return redirectToSpecialist(origin, "error", error.message);
  }

  if (booking.slot_id) {
    await dataSupabase
      .from("appointment_slots")
      .update({ status: status === "cancelled" ? "available" : "booked" })
      .eq("id", booking.slot_id);
  }

  return redirectToSpecialist(origin, "message", "Turno actualizado");
}
