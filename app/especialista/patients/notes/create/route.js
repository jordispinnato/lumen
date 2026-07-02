import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

function redirectToPatients(origin, type, message) {
  return NextResponse.redirect(`${origin}/especialista?${type}=${encodeURIComponent(message)}#pacientes`, { status: 303 });
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const specialistId = String(formData.get("specialistId") || "").trim();
  const patientUserId = String(formData.get("patientUserId") || "").trim();
  const patientEmail = String(formData.get("patientEmail") || "").trim();
  const patientName = String(formData.get("patientName") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const noteType = String(formData.get("noteType") || "general").trim();
  const validNoteTypes = new Set(["general", "session", "follow_up", "clinical"]);
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/especialista`, { status: 303 });
  }

  if (!specialistId || !patientEmail || !note) {
    return redirectToPatients(origin, "error", "Completa la nota del paciente");
  }

  if (!validNoteTypes.has(noteType)) {
    return redirectToPatients(origin, "error", "Tipo de nota invalido");
  }

  const dataSupabase = createSupabaseAdminClient() || supabase;
  const { data: specialist } = await dataSupabase
    .from("appointment_specialists")
    .select("id,user_id")
    .eq("id", specialistId)
    .maybeSingle();

  const { data: profile } = await dataSupabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!specialist || (profile?.role !== "admin" && specialist.user_id !== userData.user.id)) {
    return redirectToPatients(origin, "error", "No autorizado");
  }

  const { error } = await dataSupabase.from("specialist_patient_notes").insert({
    specialist_id: specialist.id,
    patient_user_id: patientUserId || null,
    patient_email: patientEmail,
    patient_name: patientName || null,
    note,
    note_type: noteType,
  });

  if (error) {
    return redirectToPatients(origin, "error", error.message);
  }

  return redirectToPatients(origin, "message", "Nota guardada");
}
