import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const cartItemId = String(formData.get("cartItemId") || "").trim();
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/mi-cuenta`, { status: 303 });
  }

  if (!cartItemId) {
    const params = new URLSearchParams({ error: "Item de carrito no valido" });
    return NextResponse.redirect(`${origin}/mi-cuenta?${params.toString()}#carrito`, { status: 303 });
  }

  const { data: existingItem } = await supabase
    .from("catalog_cart_items")
    .select("id,user_id")
    .eq("id", cartItemId)
    .maybeSingle();

  if (!existingItem || existingItem.user_id !== userData.user.id) {
    const params = new URLSearchParams({ error: "No se encontro el item en tu carrito" });
    return NextResponse.redirect(`${origin}/mi-cuenta?${params.toString()}#carrito`, { status: 303 });
  }

  const { error } = await supabase
    .from("catalog_cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", userData.user.id);

  if (error) {
    const params = new URLSearchParams({ error: error.message });
    return NextResponse.redirect(`${origin}/mi-cuenta?${params.toString()}#carrito`, { status: 303 });
  }

  const params = new URLSearchParams({ message: "Producto quitado del carrito." });
  return NextResponse.redirect(`${origin}/mi-cuenta?${params.toString()}#carrito`, { status: 303 });
}
