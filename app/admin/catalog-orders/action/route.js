import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

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
  const orderId = String(formData.get("orderId") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const validStatuses = new Set(["pending_payment", "paid", "cancelled", "delivered"]);
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!orderId || !validStatuses.has(status)) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent("Accion de pedido incompleta")}`, {
      status: 303,
    });
  }

  const { error } = await supabase.from("catalog_orders").update({ status }).eq("id", orderId);

  if (error) {
    return NextResponse.redirect(`${origin}/admin?error=${encodeURIComponent(error.message)}`, { status: 303 });
  }

  return NextResponse.redirect(`${origin}/admin?message=Pedido actualizado`, { status: 303 });
}
