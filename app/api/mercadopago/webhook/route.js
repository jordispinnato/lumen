import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { NextResponse } from "next/server";
import { createMercadoPagoPaymentClient } from "../../../../lib/mercadopago";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";

const paymentStatusToOrderStatus = {
  approved: "approved",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "cancelled",
  charged_back: "cancelled",
  pending: "pending",
  in_process: "pending",
  authorized: "pending",
};

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function getWebhookDataId(url, payload) {
  return (
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    payload?.data?.id ||
    payload?.id ||
    ""
  );
}

function getWebhookType(url, payload) {
  return payload?.type || payload?.topic || url.searchParams.get("type") || url.searchParams.get("topic") || "";
}

async function parsePayload(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function POST(request) {
  const url = new URL(request.url);
  const payload = await parsePayload(request);
  const dataId = getWebhookDataId(url, payload);
  const webhookType = getWebhookType(url, payload);
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

  if (webhookSecret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret: webhookSecret,
        toleranceSeconds: 300,
      });
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        return NextResponse.json({ error: "Invalid Mercado Pago signature" }, { status: 401 });
      }

      throw error;
    }
  } else if (isProduction) {
    return NextResponse.json({ error: "Mercado Pago webhook secret is not configured" }, { status: 401 });
  }

  if (webhookType && webhookType !== "payment") {
    return NextResponse.json({ received: true, ignored: webhookType });
  }

  if (!dataId || !process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ received: true, skipped: "missing payment id or access token" });
  }

  const adminSupabase = createSupabaseAdminClient();

  if (!adminSupabase) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
  }

  const paymentClient = createMercadoPagoPaymentClient();
  const payment = await paymentClient.get({ id: dataId });
  const orderId = payment.external_reference || payment.metadata?.order_id;

  if (!isUuid(orderId)) {
    return NextResponse.json({ received: true, skipped: "payment without LUMEN order reference" });
  }

  const { data: order } = await adminSupabase
    .from("orders")
    .select("id,user_id,course_id,status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ received: true, skipped: "order not found" });
  }

  const nextStatus = paymentStatusToOrderStatus[payment.status] || "pending";

  await adminSupabase
    .from("orders")
    .update({
      status: nextStatus,
      provider_reference: payment.id ? String(payment.id) : String(dataId),
    })
    .eq("id", order.id);

  if (nextStatus === "approved" && order.user_id && order.course_id) {
    await adminSupabase
      .from("enrollments")
      .upsert(
        {
          user_id: order.user_id,
          course_id: order.course_id,
          order_id: order.id,
        },
        { onConflict: "user_id,course_id", ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ received: true, status: nextStatus });
}
