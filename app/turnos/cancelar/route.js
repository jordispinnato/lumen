import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function redirectToAccount(origin, type, message) {
  return NextResponse.redirect(`${origin}/mi-cuenta?${type}=${encodeURIComponent(message)}#turnos`, { status: 303 });
}

async function updateBookingStatus(supabase, bookingId, userId, reason) {
  const enrichedPayload = {
    status: "cancelled",
    cancelled_at: new Date().toISOString(),
    cancelled_by: userId,
    cancellation_reason: reason || null,
    status_updated_at: new Date().toISOString(),
    status_updated_by: userId,
  };

  const enrichedUpdate = await supabase
    .from("appointment_bookings")
    .update(enrichedPayload)
    .eq("id", bookingId);

  if (!enrichedUpdate.error) {
    return enrichedUpdate;
  }

  return supabase
    .from("appointment_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const bookingId = String(formData.get("bookingId") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  const supabase = await createSupabaseServerClient();
  const writeSupabase = createSupabaseAdminClient() || supabase;
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/mi-cuenta`, { status: 303 });
  }

  if (!bookingId) {
    return redirectToAccount(origin, "error", "No se encontro el turno a cancelar");
  }

  const { data: booking, error: bookingError } = await writeSupabase
    .from("appointment_bookings")
    .select(`
      id,
      user_id,
      slot_id,
      status,
      appointment_slots:slot_id (
        slot_date
      )
    `)
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    return redirectToAccount(origin, "error", "No se encontro el turno");
  }

  if (booking.user_id !== userData.user.id) {
    return redirectToAccount(origin, "error", "No autorizado");
  }

  const today = new Date().toISOString().slice(0, 10);

  if (booking.status === "cancelled") {
    return redirectToAccount(origin, "message", "Ese turno ya estaba cancelado");
  }

  if (booking.appointment_slots?.slot_date < today) {
    return redirectToAccount(origin, "error", "No se puede cancelar un turno pasado");
  }

  const { error } = await updateBookingStatus(writeSupabase, booking.id, userData.user.id, reason);

  if (error) {
    return redirectToAccount(origin, "error", error.message);
  }

  if (booking.slot_id) {
    await writeSupabase.from("appointment_slots").update({ status: "available" }).eq("id", booking.slot_id);
  }

  return redirectToAccount(origin, "message", "Turno cancelado correctamente");
}
