import { NextResponse } from "next/server";
import { sendAppointmentReminderEmail } from "../../../../lib/email";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const tomorrow = addDays(new Date(), 1);
  const { data: bookings, error } = await supabase
    .from("appointment_bookings")
    .select(`
      id,
      patient_email,
      patient_name,
      status,
      appointment_slots:slot_id (
        slot_date,
        slot_time
      ),
      appointment_specialists:specialist_id (
        name
      )
    `)
    .eq("status", "confirmed")
    .eq("appointment_slots.slot_date", tomorrow);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dueBookings = (bookings || []).filter((booking) => booking.appointment_slots?.slot_date === tomorrow);
  const results = [];

  for (const booking of dueBookings) {
    try {
      await sendAppointmentReminderEmail({
        to: booking.patient_email,
        patientName: booking.patient_name,
        specialistName: booking.appointment_specialists?.name || "Especialista LUMEN",
        slotDate: booking.appointment_slots?.slot_date,
        slotTime: booking.appointment_slots?.slot_time,
        meetingUrl: process.env.ONLINE_CONSULTATION_URL,
      });

      await supabase
        .from("appointment_bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", booking.id);

      results.push({ id: booking.id, sent: true });
    } catch (sendError) {
      results.push({ id: booking.id, sent: false, error: sendError.message });
    }
  }

  return NextResponse.json({ date: tomorrow, total: dueBookings.length, results });
}
