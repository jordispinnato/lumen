function formatAppointmentDate(slotDate) {
  return new Date(`${slotDate}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function consultationLinkMarkup(meetingUrl) {
  return meetingUrl
    ? `<p><strong>Link de consulta:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>`
    : "";
}

export async function sendAppointmentConfirmationEmail({ to, patientName, specialistName, slotDate, slotTime, meetingUrl }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return { skipped: true };
  }

  const formattedDate = formatAppointmentDate(slotDate);
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
            ${consultationLinkMarkup(meetingUrl)}
          </div>
          <p>${meetingUrl ? "Te recomendamos ingresar unos minutos antes del horario acordado." : "Vas a recibir por este mismo medio los detalles de acceso a la consulta cuando esten disponibles."}</p>
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

export async function sendSpecialistAppointmentNotificationEmail({
  to,
  patientName,
  patientEmail,
  specialistName,
  slotDate,
  slotTime,
  meetingUrl,
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !to) {
    return { skipped: true };
  }

  const formattedDate = formatAppointmentDate(slotDate);
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
      reply_to: patientEmail || process.env.EMAIL_REPLY_TO || undefined,
      subject: "Nuevo turno reservado - LUMEN",
      html: `
        <div style="font-family: Arial, sans-serif; color: #143538; line-height: 1.6;">
          <h1 style="margin-bottom: 8px;">Nuevo turno reservado</h1>
          <p>Hola${specialistName ? ` ${specialistName}` : ""}, tenes una nueva reserva en LUMEN.</p>
          <div style="border: 1px solid #d9e2de; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <p><strong>Paciente:</strong> ${patientName || "Sin nombre cargado"}</p>
            <p><strong>Email:</strong> ${patientEmail || "Sin email"}</p>
            <p><strong>Fecha:</strong> ${formattedDate}</p>
            <p><strong>Horario:</strong> ${formattedTime}</p>
            <p><strong>Modalidad:</strong> Consulta online</p>
            ${consultationLinkMarkup(meetingUrl)}
          </div>
          <p>Tambien podes revisar tus turnos desde tu panel de especialista.</p>
          <p>Equipo LUMEN</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo enviar el email al especialista");
  }

  return { sent: true };
}

export async function sendAppointmentReminderEmail({ to, patientName, specialistName, slotDate, slotTime, meetingUrl }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !to) {
    return { skipped: true };
  }

  const formattedDate = formatAppointmentDate(slotDate);
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
      subject: "Recordatorio de turno - LUMEN",
      html: `
        <div style="font-family: Arial, sans-serif; color: #143538; line-height: 1.6;">
          <h1 style="margin-bottom: 8px;">Recordatorio de tu turno</h1>
          <p>Hola${patientName ? ` ${patientName}` : ""}, te recordamos tu proxima consulta en LUMEN.</p>
          <div style="border: 1px solid #d9e2de; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <p><strong>Especialista:</strong> ${specialistName}</p>
            <p><strong>Fecha:</strong> ${formattedDate}</p>
            <p><strong>Horario:</strong> ${formattedTime}</p>
            <p><strong>Modalidad:</strong> Consulta online</p>
            ${consultationLinkMarkup(meetingUrl)}
          </div>
          <p>Equipo LUMEN</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo enviar el recordatorio");
  }

  return { sent: true };
}

export async function sendAppointmentRescheduledEmail({
  to,
  patientName,
  specialistName,
  oldSlotDate,
  oldSlotTime,
  slotDate,
  slotTime,
  meetingUrl,
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !to) {
    return { skipped: true };
  }

  const oldDate = formatAppointmentDate(oldSlotDate);
  const newDate = formatAppointmentDate(slotDate);

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
      subject: "Turno reprogramado - LUMEN",
      html: `
        <div style="font-family: Arial, sans-serif; color: #143538; line-height: 1.6;">
          <h1 style="margin-bottom: 8px;">Tu turno fue reprogramado</h1>
          <p>Hola${patientName ? ` ${patientName}` : ""}, confirmamos el nuevo horario de tu consulta.</p>
          <div style="border: 1px solid #d9e2de; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <p><strong>Especialista:</strong> ${specialistName}</p>
            <p><strong>Turno anterior:</strong> ${oldDate} - ${oldSlotTime?.slice(0, 5)} hs</p>
            <p><strong>Nuevo turno:</strong> ${newDate} - ${slotTime?.slice(0, 5)} hs</p>
            <p><strong>Modalidad:</strong> Consulta online</p>
            ${consultationLinkMarkup(meetingUrl)}
          </div>
          <p>Equipo LUMEN</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo enviar el email de reprogramacion");
  }

  return { sent: true };
}

export async function sendSpecialistAppointmentRescheduledEmail({
  to,
  patientName,
  patientEmail,
  specialistName,
  oldSlotDate,
  oldSlotTime,
  slotDate,
  slotTime,
  meetingUrl,
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !to) {
    return { skipped: true };
  }

  const oldDate = formatAppointmentDate(oldSlotDate);
  const newDate = formatAppointmentDate(slotDate);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      reply_to: patientEmail || process.env.EMAIL_REPLY_TO || undefined,
      subject: "Turno reprogramado - LUMEN",
      html: `
        <div style="font-family: Arial, sans-serif; color: #143538; line-height: 1.6;">
          <h1 style="margin-bottom: 8px;">Un turno fue reprogramado</h1>
          <p>Hola${specialistName ? ` ${specialistName}` : ""}, una reserva cambio de horario.</p>
          <div style="border: 1px solid #d9e2de; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <p><strong>Paciente:</strong> ${patientName || "Sin nombre cargado"}</p>
            <p><strong>Email:</strong> ${patientEmail || "Sin email"}</p>
            <p><strong>Turno anterior:</strong> ${oldDate} - ${oldSlotTime?.slice(0, 5)} hs</p>
            <p><strong>Nuevo turno:</strong> ${newDate} - ${slotTime?.slice(0, 5)} hs</p>
            <p><strong>Modalidad:</strong> Consulta online</p>
            ${consultationLinkMarkup(meetingUrl)}
          </div>
          <p>Tambien podes revisar la agenda desde tu panel de especialista.</p>
          <p>Equipo LUMEN</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo enviar el email de reprogramacion al especialista");
  }

  return { sent: true };
}
