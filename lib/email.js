export async function sendAppointmentConfirmationEmail({ to, patientName, specialistName, slotDate, slotTime }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return { skipped: true };
  }

  const formattedDate = new Date(`${slotDate}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = slotTime?.slice(0, 5);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      subject: "Confirmacion de turno - LUMEN",
      html: `
        <div style="font-family: Arial, sans-serif; color: #143538; line-height: 1.6;">
          <h1 style="margin-bottom: 8px;">Tu turno esta confirmado</h1>
          <p>Hola${patientName ? ` ${patientName}` : ""}, recibimos tu reserva en LUMEN.</p>
          <div style="border: 1px solid #d9e2de; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <p><strong>Especialista:</strong> ${specialistName}</p>
            <p><strong>Fecha:</strong> ${formattedDate}</p>
            <p><strong>Horario:</strong> ${formattedTime}</p>
            <p><strong>Modalidad:</strong> Consulta online</p>
          </div>
          <p>Mas adelante vas a recibir por este mismo medio los detalles de acceso a la consulta.</p>
          <p>Equipo LUMEN</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo enviar el email de confirmacion");
  }

  return { sent: true };
}
