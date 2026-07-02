import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectToAdmin(origin, type, message) {
  return NextResponse.redirect(`${origin}/admin?${type}=${encodeURIComponent(message)}#catalogo`, { status: 303 });
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
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
    return redirectToAdmin(origin, "error", "No autorizado");
  }

  const writeSupabase = createSupabaseAdminClient() || supabase;

  const productId = String(formData.get("productId") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const productType = String(formData.get("productType") || "physical");
  const category = String(formData.get("category") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const price = Number(formData.get("price") || 0);
  const stockValue = formData.get("stock");
  const digitalUrl = String(formData.get("digitalUrl") || "").trim();
  const digitalFile = formData.get("digitalFile");
  const status = String(formData.get("status") || "published");
  const stock = productType === "physical" && stockValue !== "" ? Number(stockValue) : null;
  const validProductTypes = new Set(["physical", "digital"]);
  const validStatuses = new Set(["published", "draft", "archived"]);
  let digitalFilePath = null;
  let digitalFileName = null;
  let digitalFileType = null;
  let digitalFileSize = null;

  if (!title || !category) {
    return redirectToAdmin(origin, "error", "Completa nombre y categoria del producto");
  }

  if (!validProductTypes.has(productType) || !validStatuses.has(status)) {
    return redirectToAdmin(origin, "error", "Tipo o estado de producto invalido");
  }

  if (productType === "digital" && digitalFile?.size) {
    const safeName = digitalFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    digitalFilePath = `${Date.now()}-${safeName}`;
    digitalFileName = digitalFile.name;
    digitalFileType = digitalFile.type || "application/octet-stream";
    digitalFileSize = digitalFile.size;

    const { error: uploadError } = await writeSupabase.storage
      .from("catalog-digital-files")
      .upload(digitalFilePath, digitalFile, {
        contentType: digitalFileType,
        upsert: false,
      });

    if (uploadError) {
      return redirectToAdmin(origin, "error", uploadError.message);
    }
  }

  const payload = {
    title,
    product_type: productType,
    category,
    summary,
    price: Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0,
    stock: Number.isFinite(stock) ? Math.max(0, Math.round(stock)) : null,
    digital_url: digitalUrl || null,
    status,
  };

  if (digitalFilePath) {
    payload.digital_file_path = digitalFilePath;
    payload.digital_file_name = digitalFileName;
    payload.digital_file_type = digitalFileType;
    payload.digital_file_size = digitalFileSize;
  }

  const { error } = productId
    ? await writeSupabase.from("catalog_products").update(payload).eq("id", productId)
    : await writeSupabase.from("catalog_products").insert(payload);

  if (error) {
    return redirectToAdmin(origin, "error", error.message);
  }

  return redirectToAdmin(origin, "message", "Producto guardado");
}
