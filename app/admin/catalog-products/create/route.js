import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

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
    return NextResponse.redirect(`${origin}/admin?error=No autorizado`, { status: 303 });
  }

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
  let digitalFilePath = null;
  let digitalFileName = null;
  let digitalFileType = null;
  let digitalFileSize = null;

  if (!title || !category) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Completa nombre y categoria del producto")}`, {
      status: 303,
    });
  }

  if (productType === "digital" && digitalFile?.size) {
    const safeName = digitalFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    digitalFilePath = `${Date.now()}-${safeName}`;
    digitalFileName = digitalFile.name;
    digitalFileType = digitalFile.type || "application/octet-stream";
    digitalFileSize = digitalFile.size;

    const { error: uploadError } = await supabase.storage
      .from("catalog-digital-files")
      .upload(digitalFilePath, digitalFile, {
        contentType: digitalFileType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(uploadError.message)}`, { status: 303 });
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
    ? await supabase.from("catalog_products").update(payload).eq("id", productId)
    : await supabase.from("catalog_products").insert(payload);

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=Producto guardado`, { status: 303 });
}
