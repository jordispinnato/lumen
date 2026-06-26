import { NextResponse } from "next/server";

export async function POST(request) {
  const payload = await request.json();

  // Próximo paso:
  // 1. Validar firma del webhook.
  // 2. Consultar el pago en Mercado Pago.
  // 3. Actualizar orders/payments en Supabase.
  // 4. Crear enrollment si el pago está aprobado.
  console.log("Mercado Pago webhook", payload);

  return NextResponse.json({ received: true });
}
