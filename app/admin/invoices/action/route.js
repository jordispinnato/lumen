import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectToAdmin(origin, type, message) {
  return NextResponse.redirect(`${origin}/admin?${type}=${encodeURIComponent(message)}#facturas`, { status: 303 });
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
  const invoiceId = String(formData.get("invoiceId") || "").trim();
  const action = String(formData.get("action") || "issued").trim();
  const invoiceNumber = String(formData.get("invoiceNumber") || "").trim();
  const invoiceFileUrl = String(formData.get("invoiceFileUrl") || "").trim();
  const supabase = await createSupabaseServerClient();
  const auth = await requireAdmin(supabase, origin);

  if (auth.response) {
    return auth.response;
  }

  if (!invoiceId) {
    return redirectToAdmin(origin, "error", "Solicitud de factura incompleta.");
  }

  const adminSupabase = createSupabaseAdminClient() || supabase;
  const nextStatus = action === "requested" ? "requested" : "issued";
  const payload = {
    status: nextStatus,
    invoice_number: invoiceNumber || null,
    invoice_file_url: invoiceFileUrl || null,
    issued_at: nextStatus === "issued" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data: invoice, error } = await adminSupabase
    .from("invoice_requests")
    .update(payload)
    .eq("id", invoiceId)
    .select("id,order_id,catalog_order_id,status")
    .maybeSingle();

  if (error || !invoice) {
    return redirectToAdmin(
      origin,
      "error",
      error?.message?.includes("invoice_requests")
        ? "Falta ejecutar el SQL 016 de facturacion en Supabase."
        : error?.message || "No se pudo actualizar la factura."
    );
  }

  const purchasePayload = { invoice_status: nextStatus === "issued" ? "issued" : "requested" };

  if (invoice.order_id) {
    await adminSupabase.from("orders").update(purchasePayload).eq("id", invoice.order_id);
  }

  if (invoice.catalog_order_id) {
    await adminSupabase.from("catalog_orders").update(purchasePayload).eq("id", invoice.catalog_order_id);
  }

  // Futuro: aca se puede conectar AFIP/ARCA o un generador automatico de comprobantes.
  return redirectToAdmin(origin, "message", nextStatus === "issued" ? "Factura marcada como emitida." : "Factura marcada como pendiente.");
}
