import { NextResponse } from "next/server";
import { demoCourses } from "../../../../lib/courses";
import { createMercadoPagoPreferenceClient } from "../../../../lib/mercadopago";

export async function POST(request) {
  const formData = await request.formData();
  const courseSlug = formData.get("courseSlug");
  const course = demoCourses.find((item) => item.slug === courseSlug);

  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({
      message: "Mercado Pago todavía no está configurado.",
      nextStep: "Agregar MERCADOPAGO_ACCESS_TOKEN en .env.local y en Vercel.",
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const preference = createMercadoPagoPreferenceClient();

  const result = await preference.create({
    body: {
      items: [
        {
          id: course.slug,
          title: course.title,
          quantity: 1,
          unit_price: course.price,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${siteUrl}/checkout/exito`,
        failure: `${siteUrl}/checkout/error`,
        pending: `${siteUrl}/checkout/pendiente`,
      },
      auto_return: "approved",
      external_reference: course.slug,
      notification_url: `${siteUrl}/api/mercadopago/webhook`,
    },
  });

  return NextResponse.redirect(result.init_point);
}
