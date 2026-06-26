import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const title = String(formData.get("title") || "").trim();
  const position = Number(formData.get("position") || 0);
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

  if (!file || typeof file === "string" || file.size === 0) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Seleccioná un archivo")}`, {
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
  ]);

  if (file.type && !allowedTypes.has(file.type)) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Formato no permitido")}`, {
      status: 303,
    });
  }

  const fileName = safeFileName(file.name);
  const filePath = `${courseId}/${Date.now()}-${fileName}`;

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

  const { error } = await supabase.from("course_materials").insert({
    course_id: courseId,
    title,
    file_path: filePath,
    file_name: file.name,
    file_type: file.type || null,
    file_size: file.size,
    position,
  });

  if (error) {
    await supabase.storage.from("course-materials").remove([filePath]);

    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}/admin?message=Material cargado`, { status: 303 });
}
