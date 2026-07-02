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
  const productId = String(formData.get("productId") || "").trim();
  const action = String(formData.get("action") || "").trim();
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!productId) {
    return redirectToAdmin(origin, "error", "Producto incompleto");
  }

  const writeSupabase = createSupabaseAdminClient() || supabase;
  const statusByAction = {
    publish: "published",
    draft: "draft",
    archive: "archived",
  };

  if (action === "delete") {
    const { error } = await writeSupabase.from("catalog_products").delete().eq("id", productId);

    if (error) {
      return redirectToAdmin(origin, "error", error.message);
    }

    return redirectToAdmin(origin, "message", "Producto eliminado");
  }

  const nextStatus = statusByAction[action];

  if (!nextStatus) {
    return redirectToAdmin(origin, "error", "Accion de producto invalida");
  }

  const { error } = await writeSupabase
    .from("catalog_products")
    .update({ status: nextStatus })
    .eq("id", productId);

  if (error) {
    return redirectToAdmin(origin, "error", error.message);
  }

  return redirectToAdmin(origin, "message", "Producto actualizado");
}
