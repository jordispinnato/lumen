import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { sendContactMessageNotificationEmail } from "../../../lib/email";

function redirectWith(origin, params) {
  return NextResponse.redirect(`${origin}/contacto?${params.toString()}`, { status: 303 });
}

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const params = new URLSearchParams();

  if (!firstName || !lastName || !email || !message) {
    params.set("error", "Completa nombre, apellido, email y consulta para enviar el mensaje.");
    return redirectWith(origin, params);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contact_messages").insert({
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    subject: subject || null,
    message,
  });

  if (error) {
    params.set("error", "No pudimos enviar la consulta. Si falta la tabla, ejecuta el SQL 017 en Supabase.");
    return redirectWith(origin, params);
  }

  try {
    await sendContactMessageNotificationEmail({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    });
  } catch (emailError) {
    console.error("Contact message email notification failed", emailError);
  }

  params.set("message", "Gracias. Recibimos tu consulta y te vamos a responder por email.");
  return redirectWith(origin, params);
}
