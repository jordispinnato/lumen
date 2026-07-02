import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectToAdmin(origin, type, message) {
  return NextResponse.redirect(`${origin}/admin?${type}=${encodeURIComponent(message)}#catalogo`, { status: 303 });
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
    return { response: redirectToAdmin(origin, "error", "No autorizado") };
  }

  return { user: userData.user };
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") || "").trim();
  const action = String(formData.get("action") || "update").trim();
  const status = String(formData.get("status") || "").trim();
  const validStatuses = new Set(["pending_payment", "paid", "cancelled", "delivered"]);
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!orderId) {
    return redirectToAdmin(origin, "error", "Accion de pedido incompleta");
  }

  const writeSupabase = createSupabaseAdminClient() || supabase;
  const { data: currentOrder } = await writeSupabase
    .from("catalog_orders")
    .select("id,status,product_id,product_type")
    .eq("id", orderId)
    .maybeSingle();

  if (action === "delete") {
    const { error } = await writeSupabase.from("catalog_orders").delete().eq("id", orderId);

    if (error) {
      return redirectToAdmin(origin, "error", error.message);
    }

    return redirectToAdmin(origin, "message", "Pedido eliminado");
  }

  if (!validStatuses.has(status)) {
    return redirectToAdmin(origin, "error", "Estado de pedido invalido");
  }

  const enrichedPayload = {
    status,
    ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}),
    ...(status === "delivered" ? { delivered_at: new Date().toISOString() } : {}),
    ...(status === "cancelled" ? { cancelled_at: new Date().toISOString() } : {}),
  };
  const enrichedUpdate = await writeSupabase.from("catalog_orders").update(enrichedPayload).eq("id", orderId);
  const fallbackUpdate = enrichedUpdate.error
    ? await writeSupabase.from("catalog_orders").update({ status }).eq("id", orderId)
    : enrichedUpdate;
  const { error } = fallbackUpdate;

  if (error) {
    return redirectToAdmin(origin, "error", error.message);
  }

  if (currentOrder?.product_type === "physical" && currentOrder.product_id) {
    const becamePaid = !["paid", "delivered"].includes(currentOrder.status) && ["paid", "delivered"].includes(status);
    const becameCancelled = ["paid", "delivered"].includes(currentOrder.status) && status === "cancelled";

    if (becamePaid || becameCancelled) {
      const { data: product } = await writeSupabase
        .from("catalog_products")
        .select("stock")
        .eq("id", currentOrder.product_id)
        .maybeSingle();

      if (typeof product?.stock === "number") {
        const nextStock = becamePaid ? Math.max(product.stock - 1, 0) : product.stock + 1;
        await writeSupabase.from("catalog_products").update({ stock: nextStock }).eq("id", currentOrder.product_id);
      }
    }
  }

  return redirectToAdmin(origin, "message", "Pedido actualizado");
}
