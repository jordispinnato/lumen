import { NextResponse } from "next/server";
import { createMercadoPagoPreferenceClient } from "../../../../lib/mercadopago";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

function redirectToCheckout(origin, courseSlug, type, message) {
  const params = new URLSearchParams({ curso: courseSlug });

  if (message) {
    params.set(type, message);
  }

  return NextResponse.redirect(`${origin}/checkout?${params.toString()}`, { status: 303 });
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const courseSlug = String(formData.get("courseSlug") || "").trim();
  const supabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=${encodeURIComponent(`/checkout?curso=${courseSlug}`)}`, {
      status: 303,
    });
  }

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return redirectToCheckout(origin, courseSlug, "error", "Mercado Pago todavia no esta configurado.");
  }

  if (!adminSupabase) {
    return redirectToCheckout(origin, courseSlug, "error", "Falta configurar la clave segura de Supabase para registrar pagos.");
  }

  const { data: course } = await adminSupabase
    .from("courses")
    .select("id,slug,title,summary,price,status,cover_image_url")
    .eq("slug", courseSlug)
    .eq("status", "published")
    .maybeSingle();

  if (!course) {
    return redirectToCheckout(origin, courseSlug, "error", "Curso no disponible.");
  }

  const { data: existingEnrollment } = await adminSupabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (existingEnrollment) {
    return NextResponse.redirect(`${origin}/aula?curso=${course.slug}`, { status: 303 });
  }

  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      user_id: userData.user.id,
      course_id: course.id,
      amount: course.price,
      status: "pending",
      payment_provider: "mercadopago",
    })
    .select("id")
    .maybeSingle();

  if (orderError || !order) {
    return redirectToCheckout(origin, courseSlug, "error", orderError?.message || "No se pudo crear la orden.");
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, "");
  const preference = createMercadoPagoPreferenceClient();

  const result = await preference.create({
    body: {
      items: [
        {
          id: course.slug,
          title: course.title,
          description: course.summary || "Curso online LUMEN",
          quantity: 1,
          unit_price: Number(course.price || 0),
          currency_id: "ARS",
          picture_url: course.cover_image_url || undefined,
        },
      ],
      payer: {
        email: userData.user.email || undefined,
      },
      back_urls: {
        success: `${siteUrl}/checkout/exito?order=${order.id}`,
        failure: `${siteUrl}/checkout/error?order=${order.id}`,
        pending: `${siteUrl}/checkout/pendiente?order=${order.id}`,
      },
      auto_return: "approved",
      external_reference: order.id,
      metadata: {
        order_id: order.id,
        user_id: userData.user.id,
        course_id: course.id,
        type: "course",
      },
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
    },
  });

  await adminSupabase
    .from("orders")
    .update({ provider_reference: result.id ? String(result.id) : null })
    .eq("id", order.id);

  const checkoutUrl = result.init_point || result.sandbox_init_point;

  if (!checkoutUrl) {
    return redirectToCheckout(origin, courseSlug, "error", "Mercado Pago no devolvio un link de pago.");
  }

  return NextResponse.redirect(checkoutUrl, { status: 303 });
}
