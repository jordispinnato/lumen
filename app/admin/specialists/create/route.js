import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function safeSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeFileName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  const name = String(formData.get("name") || "").trim();
  const specialistId = String(formData.get("specialistId") || "").trim();
  const role = String(formData.get("role") || "Psicologia").trim();
  const professionalLicense = String(formData.get("professionalLicense") || "").trim();
  const focus = String(formData.get("focus") || "").trim();
  const shortBio = String(formData.get("shortBio") || "").trim();
  const education = String(formData.get("education") || "").trim();
  const yearsExperienceValue = String(formData.get("yearsExperience") || "").trim();
  const durationMinutesValue = String(formData.get("durationMinutes") || "").trim();
  const session = String(formData.get("session") || "Consulta online de 50 minutos").trim();
  const price = Number(formData.get("price") || 0);
  const status = String(formData.get("status") || "active");
  const displayOrder = Number(formData.get("displayOrder") || 100);
  const requestedSlug = safeSlug(String(formData.get("slug") || name));
  const photo = formData.get("photo");

  if (!name) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("El nombre del especialista es obligatorio")}`, {
      status: 303,
    });
  }

  if (!requestedSlug) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("El slug del especialista es obligatorio")}`, {
      status: 303,
    });
  }

  let photoPath = null;
  let photoUrl = null;

  if (photo && typeof photo !== "string" && photo.size > 0) {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (photo.type && !allowedTypes.has(photo.type)) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("La foto debe ser JPG, PNG o WEBP")}`, {
        status: 303,
      });
    }

    const fileName = safeFileName(photo.name);
    photoPath = `${requestedSlug}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("professional-photos")
      .upload(photoPath, photo, {
        contentType: photo.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(uploadError.message)}`, { status: 303 });
    }

    const { data: publicUrlData } = supabase.storage.from("professional-photos").getPublicUrl(photoPath);
    photoUrl = publicUrlData?.publicUrl || null;
  }

  const payload = {
    name,
    role,
    professional_license: professionalLicense || null,
    focus,
    short_bio: shortBio || null,
    education: education || null,
    years_experience: yearsExperienceValue ? Math.max(0, Math.round(Number(yearsExperienceValue))) : null,
    duration_minutes: durationMinutesValue ? Math.max(0, Math.round(Number(durationMinutesValue))) : null,
    session,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
    status,
    display_order: Number.isFinite(displayOrder) ? Math.max(0, Math.round(displayOrder)) : 100,
    slug: requestedSlug,
  };

  if (photoPath && photoUrl) {
    payload.photo_path = photoPath;
    payload.photo_url = photoUrl;
  }

  let existing = null;

  if (specialistId) {
    const { data } = await supabase
      .from("appointment_specialists")
      .select("id")
      .eq("id", specialistId)
      .maybeSingle();

    existing = data;

    if (!existing) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("No se encontró el especialista a editar")}`, {
        status: 303,
      });
    }
  } else {
    const { data } = await supabase
      .from("appointment_specialists")
      .select("id")
      .eq("slug", requestedSlug)
      .maybeSingle();

    existing = data;
  }

  const { error } = existing
    ? await supabase.from("appointment_specialists").update(payload).eq("id", existing.id)
    : await supabase.from("appointment_specialists").insert(payload);

  if (error) {
    if (photoPath) {
      await supabase.storage.from("professional-photos").remove([photoPath]);
    }

    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=Especialista guardado`, { status: 303 });
}
