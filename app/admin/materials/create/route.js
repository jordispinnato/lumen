import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function safeFileName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const courseId = String(formData.get("courseId") || "").trim();
  const lessonId = String(formData.get("lessonId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const position = Number(formData.get("position") || 0);
  const materialType = String(formData.get("materialType") || "file");
  const externalUrl = String(formData.get("externalUrl") || "").trim();
  const status = String(formData.get("status") || "published");
  const file = formData.get("file");
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

  const hasFile = file && typeof file !== "string" && file.size > 0;

  if (!courseId || !title) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Completa curso y titulo del material")}`, {
      status: 303,
    });
  }

  if (!hasFile && !externalUrl) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Selecciona un archivo o carga un link")}`, {
      status: 303,
    });
  }

  const allowedTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/png",
    "image/jpeg",
    "text/plain",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "application/zip",
  ]);

  if (hasFile && file.type && !allowedTypes.has(file.type)) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Formato no permitido")}`, {
      status: 303,
    });
  }

  let filePath = null;

  if (hasFile) {
    const fileName = safeFileName(file.name);
    filePath = `${courseId}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(uploadError.message)}`, {
        status: 303,
      });
    }
  }

  const { error } = await supabase.from("course_materials").insert({
    course_id: courseId,
    lesson_id: lessonId || null,
    title,
    file_path: filePath,
    file_name: hasFile ? file.name : null,
    file_type: hasFile ? file.type || null : null,
    file_size: hasFile ? file.size : null,
    material_type: materialType,
    external_url: externalUrl || null,
    status,
    position: Number.isFinite(position) ? Math.max(0, Math.round(position)) : 0,
  });

  if (error) {
    if (filePath) {
      await supabase.storage.from("course-materials").remove([filePath]);
    }

    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}/admin?message=Material cargado`, { status: 303 });
}
