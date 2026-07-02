import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

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
  const action = String(formData.get("action") || "update").trim();
  const status = String(formData.get("status") || "").trim();
  const validStatuses = new Set(["confirmed", "cancelled", "completed"]);
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!bookingId) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Turno incompleto")}`, { status: 303 });
  }

  const { data: booking, error: bookingError } = await supabase
    .from("appointment_bookings")
    .select("id,slot_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("No se encontro el turno")}`, { status: 303 });
  }

  if (action === "delete") {
    const { error } = await supabase.from("appointment_bookings").delete().eq("id", bookingId);

    if (error) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
    }

    if (booking.slot_id) {
      await supabase.from("appointment_slots").update({ status: "available" }).eq("id", booking.slot_id);
    }

    return NextResponse.redirect(`${origin}/admin?message=Turno eliminado`, { status: 303 });
  }

  if (!validStatuses.has(status)) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Estado de turno invalido")}`, { status: 303 });
  }

  const { error } = await updateBookingStatus(supabase, bookingId, status, auth.user.id);

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  if (booking.slot_id) {
    await supabase
      .from("appointment_slots")
      .update({ status: status === "cancelled" ? "available" : "booked" })
      .eq("id", booking.slot_id);
  }

  return NextResponse.redirect(`${origin}/admin?message=Turno actualizado`, { status: 303 });
}
