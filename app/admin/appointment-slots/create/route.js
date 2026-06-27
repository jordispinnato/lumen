import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function isValidBusinessSlot(dateValue, timeValue) {
  const date = new Date(`${dateValue}T${timeValue}:00`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const day = date.getDay();
  const [hours, minutes] = timeValue.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;

  if (day === 0) {
    return false;
  }

  if (day >= 1 && day <= 5) {
    return totalMinutes >= 8 * 60 && totalMinutes <= 20 * 60;
  }

  return totalMinutes >= 8 * 60 && totalMinutes <= 13 * 60;
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const specialistId = String(formData.get("specialistId") || "").trim();
  const slotDate = String(formData.get("slotDate") || "").trim();
  const slotTime = String(formData.get("slotTime") || "").trim();
  const status = String(formData.get("status") || "available");
  const supabase = await createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login`, { status: 303 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(`${origin}/admin?error=No autorizado`, { status: 303 });
  }

  if (!specialistId || !slotDate || !slotTime) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Completá especialista, día y horario")}`, {
      status: 303,
    });
  }

  if (!isValidBusinessSlot(slotDate, slotTime)) {
    return NextResponse.redirect(
      `${origin}/admin?error=${encodeURIComponent("El horario debe ser lunes a viernes de 08:00 a 20:00 o sábados de 08:00 a 13:00")}`,
      { status: 303 }
    );
  }

  const { error } = await supabase.from("appointment_slots").upsert(
    {
      specialist_id: specialistId,
      slot_date: slotDate,
      slot_time: slotTime,
      status,
    },
    {
      onConflict: "specialist_id,slot_date,slot_time",
    }
  );

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=Horario guardado`, { status: 303 });
}
