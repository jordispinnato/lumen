import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

const validNoteTypes = new Set(["general", "session", "follow_up", "clinical"]);

function redirectToPatients(origin, type, message) {
  return NextResponse.redirect(`${origin}/especialista?${type}=${encodeURIComponent(message)}#pacientes`, { status: 303 });
}

async function getSpecialistAccess(supabase, userId, specialistId) {
  const [{ data: specialist }, { data: profile }] = await Promise.all([
    supabase
      .from("appointment_specialists")
      .select("id,user_id")
      .eq("id", specialistId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  return {
    specialist,
    canManage: Boolean(specialist && (profile?.role === "admin" || specialist.user_id === userId)),
  };
}

async function auditNoteChange(supabase, payload) {
  const { error } = await supabase.from("specialist_patient_note_audit").insert(payload);

  if (error) {
    console.error("Specialist note audit failed", error);
  }
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const action = String(formData.get("action") || "create").trim();
  const specialistId = String(formData.get("specialistId") || "").trim();
  const noteId = String(formData.get("noteId") || "").trim();
  const patientUserId = String(formData.get("patientUserId") || "").trim();
  const patientEmail = String(formData.get("patientEmail") || "").trim();
  const patientName = String(formData.get("patientName") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const noteType = String(formData.get("noteType") || "general").trim();
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/especialista`, { status: 303 });
  }

  if (!specialistId) {
    return redirectToPatients(origin, "error", "No se encontro el perfil de especialista");
  }

  if (!validNoteTypes.has(noteType) && action !== "delete") {
    return redirectToPatients(origin, "error", "Tipo de nota invalido");
  }

  const dataSupabase = createSupabaseAdminClient() || supabase;
  const { specialist, canManage } = await getSpecialistAccess(dataSupabase, userData.user.id, specialistId);

  if (!canManage) {
    return redirectToPatients(origin, "error", "No autorizado");
  }

  if (action === "delete") {
    if (!noteId) {
      return redirectToPatients(origin, "error", "No se encontro la nota");
    }

    const { data: existingNote } = await dataSupabase
      .from("specialist_patient_notes")
      .select("id,specialist_id,patient_email,patient_name,note,note_type")
      .eq("id", noteId)
      .maybeSingle();

    if (!existingNote || existingNote.specialist_id !== specialist.id) {
      return redirectToPatients(origin, "error", "No se encontro la nota");
    }

    const { error } = await dataSupabase.from("specialist_patient_notes").delete().eq("id", noteId);

    if (error) {
      return redirectToPatients(origin, "error", error.message);
    }

    await auditNoteChange(dataSupabase, {
      note_id: noteId,
      specialist_id: specialist.id,
      patient_email: existingNote.patient_email,
      action: "delete",
      note_snapshot: existingNote.note,
      note_type: existingNote.note_type,
      changed_by: userData.user.id,
    });

    return redirectToPatients(origin, "message", "Nota eliminada");
  }

  if (action === "update") {
    if (!noteId || !note) {
      return redirectToPatients(origin, "error", "Completa la nota del paciente");
    }

    const { data: existingNote } = await dataSupabase
      .from("specialist_patient_notes")
      .select("id,specialist_id,patient_email,note,note_type")
      .eq("id", noteId)
      .maybeSingle();

    if (!existingNote || existingNote.specialist_id !== specialist.id) {
      return redirectToPatients(origin, "error", "No se encontro la nota");
    }

    const { error } = await dataSupabase
      .from("specialist_patient_notes")
      .update({
        note,
        note_type: noteType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (error) {
      return redirectToPatients(origin, "error", error.message);
    }

    await auditNoteChange(dataSupabase, {
      note_id: noteId,
      specialist_id: specialist.id,
      patient_email: existingNote.patient_email,
      action: "update",
      note_snapshot: existingNote.note,
      note_type: existingNote.note_type,
      changed_by: userData.user.id,
    });

    return redirectToPatients(origin, "message", "Nota actualizada");
  }

  if (!patientEmail || !note) {
    return redirectToPatients(origin, "error", "Completa la nota del paciente");
  }

  const { data: createdNote, error } = await dataSupabase
    .from("specialist_patient_notes")
    .insert({
      specialist_id: specialist.id,
      patient_user_id: patientUserId || null,
      patient_email: patientEmail,
      patient_name: patientName || null,
      note,
      note_type: noteType,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return redirectToPatients(origin, "error", error.message);
  }

  if (createdNote?.id) {
    await auditNoteChange(dataSupabase, {
      note_id: createdNote.id,
      specialist_id: specialist.id,
      patient_email: patientEmail,
      action: "create",
      note_snapshot: note,
      note_type: noteType,
      changed_by: userData.user.id,
    });
  }

  return redirectToPatients(origin, "message", "Nota guardada");
}
