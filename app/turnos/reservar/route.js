import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { sendAppointmentConfirmationEmail } from "../../../lib/email";

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const slotId = String(formData.get("slotId") || "").trim();
  const patientName = String(formData.get("patientName") || "").trim();
  const supabase = await createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/turnos`, { status: 303 });
  }

  if (!slotId) {
    return NextResponse.redirect(`${origin}/turnos?error=${encodeURIComponent("Selecciona un horario disponible")}`, {
      status: 303,
    });
  }

  const { data: slot, error: slotError } = await supabase
    .from("appointment_slots")
    .select("id,specialist_id,slot_date,slot_time,status,appointment_specialists:specialist_id (name)")
    .eq("id", slotId)
    .eq("status", "available")
    .maybeSingle();

  if (slotError || !slot) {
    return NextResponse.redirect(`${origin}/turnos?error=${encodeURIComponent("Ese horario ya no esta disponible")}`, {
      status: 303,
    });
  }

  const { data: updatedSlots, error: updateError } = await supabase
    .from("appointment_slots")
    .update({ status: "booked" })
    .eq("id", slotId)
    .eq("status", "available")
    .select("id");

  if (updateError || !updatedSlots?.length) {
    return NextResponse.redirect(`${origin}/turnos?error=${encodeURIComponent("Ese horario ya fue reservado")}`, {
      status: 303,
    });
  }

  const { error: bookingError } = await supabase.from("appointment_bookings").insert({
    user_id: userData.user.id,
    slot_id: slot.id,
    specialist_id: slot.specialist_id,
    patient_email: userData.user.email,
    patient_name: patientName || null,
    status: "confirmed",
  });

  if (bookingError) {
    await supabase.from("appointment_slots").update({ status: "available" }).eq("id", slotId);
    return NextResponse.redirect(`${origin}/turnos?error=${encodeURIComponent(bookingError.message)}`, { status: 303 });
  }

  try {
    await sendAppointmentConfirmationEmail({
      to: userData.user.email,
      patientName,
      specialistName: slot.appointment_specialists?.name || "Especialista LUMEN",
      slotDate: slot.slot_date,
      slotTime: slot.slot_time,
    });
  } catch (error) {
    console.error("Appointment confirmation email failed", error);
  }

  const successParams = new URLSearchParams({
    success: "1",
    specialist: slot.appointment_specialists?.name || "Especialista LUMEN",
    date: slot.slot_date,
    time: slot.slot_time,
  });

  return NextResponse.redirect(`${origin}/turnos?${successParams.toString()}`, { status: 303 });
}
