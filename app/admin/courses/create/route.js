import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function slugify(value) {
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

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const courseId = String(formData.get("courseId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const requestedSlug = String(formData.get("slug") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const instructor = String(formData.get("instructor") || "").trim();
  const level = String(formData.get("level") || "").trim();
  const totalDuration = String(formData.get("totalDuration") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const introVideoUrl = String(formData.get("introVideoUrl") || "").trim();
  const learningOutcomes = String(formData.get("learningOutcomes") || "").trim();
  const audience = String(formData.get("audience") || "").trim();
  const requirements = String(formData.get("requirements") || "").trim();
  const faq = String(formData.get("faq") || "").trim();
  const price = Number(formData.get("price") || 0);
  const status = String(formData.get("status") || "draft");
  const displayOrder = Number(formData.get("displayOrder") || 100);
  const featured = formData.get("featured") === "on";
  const coverImage = formData.get("coverImage");
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

  if (!title) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("El titulo del curso es obligatorio")}`, {
      status: 303,
    });
  }

  const slug = slugify(requestedSlug || title);
  let coverImagePath = null;
  let coverImageUrl = null;

  if (coverImage && typeof coverImage !== "string" && coverImage.size > 0) {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

    if (coverImage.type && !allowedTypes.has(coverImage.type)) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("La portada debe ser JPG, PNG o WEBP")}`, {
        status: 303,
      });
    }

    const fileName = safeFileName(coverImage.name);
    coverImagePath = `${slug}/${Date.now()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("course-covers")
      .upload(coverImagePath, coverImage, {
        contentType: coverImage.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(uploadError.message)}`, {
        status: 303,
      });
    }

    const { data: publicUrlData } = supabase.storage.from("course-covers").getPublicUrl(coverImagePath);
    coverImageUrl = publicUrlData?.publicUrl || null;
  }

  const payload = {
    slug,
    title,
    summary,
    description: description || null,
    instructor: instructor || null,
    level: level || null,
    total_duration: totalDuration || null,
    category: category || null,
    intro_video_url: introVideoUrl || null,
    learning_outcomes: learningOutcomes || null,
    audience: audience || null,
    requirements: requirements || null,
    faq: faq || null,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
    status,
    featured,
    display_order: Number.isFinite(displayOrder) ? Math.max(0, Math.round(displayOrder)) : 100,
  };

  if (coverImagePath && coverImageUrl) {
    payload.cover_image_path = coverImagePath;
    payload.cover_image_url = coverImageUrl;
  }

  const { error } = courseId
    ? await supabase.from("courses").update(payload).eq("id", courseId)
    : await supabase.from("courses").upsert(payload, {
        onConflict: "slug",
      });

  if (error) {
    if (coverImagePath) {
      await supabase.storage.from("course-covers").remove([coverImagePath]);
    }

    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}/admin?message=Curso guardado`, { status: 303 });
}
