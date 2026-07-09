import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

const buyerTypes = new Set(["person", "company"]);
const taxConditions = new Set(["consumidor_final", "monotributo", "responsable_inscripto", "exento"]);

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(String(value || ""));
}

function redirectWith(origin, target, type, message) {
  const [pathAndQuery, hash = ""] = target.split("#");
  const separator = pathAndQuery.includes("?") ? "&" : "?";
  const suffix = hash ? `#${hash}` : "";
  return NextResponse.redirect(`${origin}${pathAndQuery}${separator}${type}=${encodeURIComponent(message)}${suffix}`, { status: 303 });
}

function clean(value) {
  return String(value || "").trim();
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/facturacion`, { status: 303 });
  }

  if (!adminSupabase) {
    return redirectWith(origin, "/facturacion", "error", "Falta configurar la clave segura de Supabase.");
  }

  const buyerType = clean(formData.get("buyerType")) || "person";
  const legalName = clean(formData.get("legalName"));
  const taxId = clean(formData.get("taxId"));
  const taxCondition = clean(formData.get("taxCondition")) || "consumidor_final";
  const billingEmail = clean(formData.get("billingEmail")) || userData.user.email || "";
  const fiscalAddress = clean(formData.get("fiscalAddress"));
  const province = clean(formData.get("province"));
  const city = clean(formData.get("city"));
  const postalCode = clean(formData.get("postalCode"));
  const purchaseKey = clean(formData.get("purchaseKey"));
  const [purchaseKeyType, purchaseKeyId] = purchaseKey.includes(":") ? purchaseKey.split(":") : ["", ""];
  const purchaseType = clean(formData.get("purchaseType")) || purchaseKeyType;
  const orderId = clean(formData.get("orderId")) || purchaseKeyId;
  const returnTo = clean(formData.get("returnTo")) || "/facturacion";

  if (!buyerTypes.has(buyerType) || !taxConditions.has(taxCondition)) {
    return redirectWith(origin, returnTo, "error", "Revisa el tipo de comprador y condicion fiscal.");
  }

  if (!legalName || !taxId || !billingEmail || !fiscalAddress || !province || !city || !postalCode) {
    return redirectWith(origin, returnTo, "error", "Completa todos los datos de facturacion.");
  }

  if (purchaseType && (!["course", "catalog"].includes(purchaseType) || !isUuid(orderId))) {
    return redirectWith(origin, returnTo, "error", "La compra asociada a la factura no es valida.");
  }

  const billingPayload = {
    user_id: userData.user.id,
    buyer_type: buyerType,
    legal_name: legalName,
    tax_id: taxId,
    tax_condition: taxCondition,
    billing_email: billingEmail,
    fiscal_address: fiscalAddress,
    province,
    city,
    postal_code: postalCode,
    is_default: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existingProfile } = await adminSupabase
    .from("billing_profiles")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("is_default", true)
    .maybeSingle();

  const profileWrite = existingProfile?.id
    ? await adminSupabase.from("billing_profiles").update(billingPayload).eq("id", existingProfile.id).select("id").maybeSingle()
    : await adminSupabase.from("billing_profiles").insert(billingPayload).select("id").maybeSingle();

  if (profileWrite.error || !profileWrite.data) {
    return redirectWith(
      origin,
      returnTo,
      "error",
      profileWrite.error?.message?.includes("billing_profiles")
        ? "Falta ejecutar el SQL 016 de facturacion en Supabase."
        : profileWrite.error?.message || "No se pudieron guardar los datos fiscales."
    );
  }

  if (!purchaseType) {
    return redirectWith(origin, "/facturacion", "message", "Datos de facturacion guardados.");
  }

  const purchaseQuery = purchaseType === "course"
    ? adminSupabase
        .from("orders")
        .select("id,user_id,amount,status,courses:course_id (title)")
        .eq("id", orderId)
        .eq("user_id", userData.user.id)
        .maybeSingle()
    : adminSupabase
        .from("catalog_orders")
        .select("id,user_id,amount,status,catalog_products:product_id (title)")
        .eq("id", orderId)
        .eq("user_id", userData.user.id)
        .maybeSingle();

  const { data: purchase, error: purchaseError } = await purchaseQuery;

  if (purchaseError || !purchase) {
    return redirectWith(origin, returnTo, "error", "No encontramos la compra para asociar la factura.");
  }

  const isPaid = purchaseType === "course"
    ? purchase.status === "approved"
    : ["paid", "delivered"].includes(purchase.status);

  if (!isPaid) {
    return redirectWith(origin, returnTo, "error", "La factura se puede solicitar cuando el pago esta aprobado.");
  }

  const purchaseTitle = purchaseType === "course"
    ? purchase.courses?.title || "Curso LUMEN"
    : purchase.catalog_products?.title || "Compra LUMEN";
  const invoicePayload = {
    user_id: userData.user.id,
    billing_profile_id: profileWrite.data.id,
    order_id: purchaseType === "course" ? orderId : null,
    catalog_order_id: purchaseType === "catalog" ? orderId : null,
    purchase_type: purchaseType,
    purchase_title: purchaseTitle,
    amount: purchase.amount || 0,
    status: "requested",
    billing_snapshot: billingPayload,
    updated_at: new Date().toISOString(),
  };

  const invoiceLookupColumn = purchaseType === "course" ? "order_id" : "catalog_order_id";
  const { data: existingInvoice } = await adminSupabase
    .from("invoice_requests")
    .select("id,status")
    .eq(invoiceLookupColumn, orderId)
    .maybeSingle();

  if (existingInvoice?.status === "issued") {
    return redirectWith(origin, returnTo, "message", "La factura de esta compra ya figura como emitida.");
  }

  const invoiceWrite = existingInvoice?.id
    ? await adminSupabase.from("invoice_requests").update(invoicePayload).eq("id", existingInvoice.id).select("id").maybeSingle()
    : await adminSupabase.from("invoice_requests").insert(invoicePayload).select("id").maybeSingle();

  if (invoiceWrite.error || !invoiceWrite.data) {
    return redirectWith(
      origin,
      returnTo,
      "error",
      invoiceWrite.error?.message?.includes("invoice_requests")
        ? "Falta ejecutar el SQL 016 de facturacion en Supabase."
        : invoiceWrite.error?.message || "No se pudo solicitar la factura."
    );
  }

  const purchaseTable = purchaseType === "course" ? "orders" : "catalog_orders";
  await adminSupabase
    .from(purchaseTable)
    .update({
      invoice_status: "requested",
      invoice_request_id: invoiceWrite.data.id,
    })
    .eq("id", orderId);

  return redirectWith(origin, returnTo, "message", "Factura solicitada. LUMEN revisara los datos para emitirla.");
}
