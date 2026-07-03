import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const productId = String(formData.get("productId") || "").trim();
  const quantity = Math.max(1, Number.parseInt(String(formData.get("quantity") || "1"), 10) || 1);
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/catalogo/${productId}`, { status: 303 });
  }

  if (!productId) {
    return NextResponse.redirect(`${origin}/catalogo?error=Producto no valido`, { status: 303 });
  }

  const { data: existingItem } = await supabase
    .from("catalog_cart_items")
    .select("id,quantity")
    .eq("user_id", userData.user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const result = existingItem
    ? await supabase
        .from("catalog_cart_items")
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
    : await supabase.from("catalog_cart_items").insert({
        user_id: userData.user.id,
        product_id: productId,
        quantity,
      });

  if (result.error) {
    const params = new URLSearchParams({ error: result.error.message });
    return NextResponse.redirect(`${origin}/catalogo/${productId}?${params.toString()}`, { status: 303 });
  }

  const params = new URLSearchParams({ message: "Producto agregado al carrito." });
  return NextResponse.redirect(`${origin}/catalogo/${productId}?${params.toString()}`, { status: 303 });
}
