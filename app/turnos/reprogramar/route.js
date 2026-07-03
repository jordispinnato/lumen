import { NextResponse } from "next/server";
import {
  sendAppointmentRescheduledEmail,
  sendSpecialistAppointmentRescheduledEmail,
} from "../../../lib/email";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function redirectToTurnos(origin, type, message, bookingId = "") {
  const params = new URLSearchParams({ [type]: message });

  if (bookingId) {
    params.set("reprogramar", bookingId);
  }

  return NextResponse.redirect(`${origin}/turnos?${params.toString()}`, { status: 303 });
}

async function updateBookingSlot(supabase, booking, newSlot, userId) {
  const payload = {
    slot_id: newSlot.id,
    specialist_id: newSlot.specialist_id,
    status: "confirmed",
    rescheduled_from_slot_id: booking.slot_id,
    rescheduled_at: new Date().toISOString(),
    rescheduled_by: userId,
    status_updated_at: new Date().toISOString(),
    status_updated_by: userId,
  };
  const enrichedUpdate = await supabase.from("appointment_bookings").update(payload).eq("id", booking.id);

  if (!enrichedUpdate.error) {
    return enrichedUpdate;
  }

  return supabase
    .from("appointment_bookings")
    .update({
      slot_id: newSlot.id,
      specialist_id: newSlot.specialist_id,
      status: "confirmed",
    })
    .eq("id", booking.id);
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const bookingId = String(formData.get("bookingId") || "").trim();
  const slotId = String(formData.get("slotId") || "").trim();
  const patientName = String(formData.get("patientName") || "").trim();
  const supabase = await createSupabaseServerClient();
  const writeSupabase = createSupabaseAdminClient() || supabase;
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/mi-cuenta`, { status: 303 });
  }

  if (!bookingId || !slotId) {
    return redirectToTurnos(origin, "error", "Selecciona un nuevo horario disponible", bookingId);
  }

  const { data: booking, error: bookingError } = await writeSupabase
    .from("appointment_bookings")
    .select(`
      id,
      user_id,
      slot_id,
      specialist_id,
      patient_name,
      patient_email,
      status,
      appointment_slots:slot_id (
        slot_date,
        slot_time
      ),
      appointment_specialists:specialist_id (
        name,
        professional_email
      )
    `)
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    return redirectToTurnos(origin, "error", "No se encontro el turno a reprogramar");
  }

  if (booking.user_id !== userData.user.id) {
    return redirectToTurnos(origin, "error", "No autorizado");
  }

  const today = new Date().toISOString().slice(0, 10);

  if (booking.status === "cancelled" || booking.appointment_slots?.slot_date < today) {
    return redirectToTurnos(origin, "error", "No se puede reprogramar este turno");
  }

  if (booking.slot_id === slotId) {
    return redirectToTurnos(origin, "error", "Elegiste el mismo horario. Selecciona uno distinto.", bookingId);
  }

  const { data: newSlot, error: slotError } = await writeSupabase
    .from("appointment_slots")
    .select(`
      id,
      specialist_id,
      slot_date,
      slot_time,
      status,
      appointment_specialists:specialist_id (
        name,
        professional_email
      )
    `)
    .eq("id", slotId)
    .eq("status", "available")
    .maybeSingle();

  if (slotError || !newSlot) {
    return redirectToTurnos(origin, "error", "Ese horario ya no esta disponible", bookingId);
  }

  const { data: updatedSlots, error: updateSlotError } = await writeSupabase
    .from("appointment_slots")
    .update({ status: "booked" })
    .eq("id", newSlot.id)
    .eq("status", "available")
    .select("id");

  if (updateSlotError || !updatedSlots?.length) {
    return redirectToTurnos(origin, "error", "Ese horario ya fue reservado", bookingId);
  }

  const { error: bookingUpdateError } = await updateBookingSlot(writeSupabase, booking, newSlot, userData.user.id);

  if (bookingUpdateError) {
    await writeSupabase.from("appointment_slots").update({ status: "available" }).eq("id", newSlot.id);
    return redirectToTurnos(origin, "error", bookingUpdateError.message, bookingId);
  }

  await writeSupabase.from("appointment_slots").update({ status: "available" }).eq("id", booking.slot_id);

  const finalPatientName = patientName || booking.patient_name || "";
  const specialistName = newSlot.appointment_specialists?.name || booking.appointment_specialists?.name || "Especialista LUMEN";

  try {
    await sendAppointmentRescheduledEmail({
      to: userData.user.email,
      patientName: finalPatientName,
      specialistName,
      oldSlotDate: booking.appointment_slots?.slot_date,
      oldSlotTime: booking.appointment_slots?.slot_time,
      slotDate: newSlot.slot_date,
      slotTime: newSlot.slot_time,
      meetingUrl: process.env.ONLINE_CONSULTATION_URL,
    });
  } catch (error) {
    console.error("Appointment rescheduled email failed", error);
  }

  try {
    await sendSpecialistAppointmentRescheduledEmail({
      to: newSlot.appointment_specialists?.professional_email || booking.appointment_specialists?.professional_email,
      patientName: finalPatientName,
      patientEmail: userData.user.email,
      specialistName,
      oldSlotDate: booking.appointment_slots?.slot_date,
      oldSlotTime: booking.appointment_slots?.slot_time,
      slotDate: newSlot.slot_date,
      slotTime: newSlot.slot_time,
      meetingUrl: process.env.ONLINE_CONSULTATION_URL,
    });
  } catch (error) {
    console.error("Specialist rescheduled email failed", error);
  }

  const successParams = new URLSearchParams({
    success: "1",
    message: "Tu turno fue reprogramado correctamente.",
    specialist: specialistName,
    date: newSlot.slot_date,
    time: newSlot.slot_time,
  });

  return NextResponse.redirect(`${origin}/turnos?${successParams.toString()}`, { status: 303 });
}
