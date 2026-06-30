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

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildBulkSlots({ specialistId, startDateValue, endDateValue, selectedWeekdays, selectedTimes, status }) {
  const startDate = new Date(`${startDateValue}T00:00:00`);
  const endDate = new Date(`${endDateValue}T00:00:00`);
  const weekdaySet = new Set(selectedWeekdays.map(String));
  const slots = [];

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
    return slots;
  }

  const maxDays = 120;
  const current = new Date(startDate);

  for (let index = 0; current <= endDate && index < maxDays; index += 1) {
    const dateValue = formatDateInput(current);
    const weekday = String(current.getDay());

    if (weekdaySet.has(weekday)) {
      selectedTimes.forEach((timeValue) => {
        if (isValidBusinessSlot(dateValue, timeValue)) {
          slots.push({
            specialist_id: specialistId,
            slot_date: dateValue,
            slot_time: timeValue,
            status,
          });
        }
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return slots;
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const slotId = String(formData.get("slotId") || "").trim();
  const specialistId = String(formData.get("specialistId") || "").trim();
  const slotDate = String(formData.get("slotDate") || "").trim();
  const slotTime = String(formData.get("slotTime") || "").trim();
  const slotStartDate = String(formData.get("slotStartDate") || "").trim();
  const slotEndDate = String(formData.get("slotEndDate") || "").trim();
  const selectedWeekdays = formData.getAll("weekdays").map((value) => String(value).trim()).filter(Boolean);
  const selectedTimes = formData.getAll("slotTimes").map((value) => String(value).trim()).filter(Boolean);
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

  if (!specialistId) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Completá especialista")}`, {
      status: 303,
    });
  }

  if (!slotId && selectedTimes.length) {
    if (!slotStartDate || !slotEndDate || !selectedWeekdays.length) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Completá rango de fechas, días y horarios")}`, {
        status: 303,
      });
    }

    const bulkSlots = buildBulkSlots({
      specialistId,
      startDateValue: slotStartDate,
      endDateValue: slotEndDate,
      selectedWeekdays,
      selectedTimes,
      status,
    });

    if (!bulkSlots.length) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("No hay horarios válidos para guardar")}`, {
        status: 303,
      });
    }

    const { error } = await supabase.from("appointment_slots").upsert(bulkSlots, {
      onConflict: "specialist_id,slot_date,slot_time",
    });

    if (error) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
    }

    return NextResponse.redirect(`${origin}/admin?message=${encodeURIComponent(`${bulkSlots.length} horarios guardados`)}`, {
      status: 303,
    });
  }

  if (!slotDate || !slotTime) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Completá día y horario")}`, {
      status: 303,
    });
  }

  if (!isValidBusinessSlot(slotDate, slotTime)) {
    return NextResponse.redirect(
      `${origin}/admin?error=${encodeURIComponent("El horario debe ser lunes a viernes de 08:00 a 20:00 o sábados de 08:00 a 13:00")}`,
      { status: 303 }
    );
  }

  const payload = {
    specialist_id: specialistId,
    slot_date: slotDate,
    slot_time: slotTime,
    status,
  };

  const { error } = slotId
    ? await supabase.from("appointment_slots").update(payload).eq("id", slotId)
    : await supabase.from("appointment_slots").upsert(payload, {
        onConflict: "specialist_id,slot_date,slot_time",
      });

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=Horario guardado`, { status: 303 });
}
