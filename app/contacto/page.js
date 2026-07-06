export const metadata = {
  title: "Contacto | LUMEN",
  description: "Envia una consulta o encontra los canales de contacto de LUMEN.",
};

const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/";

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;

  return (
    <main className="section contact-page">
      <div className="dashboard-shell">
        <section className="contact-hero">
          <p className="eyebrow">Contacto</p>
          <h1>Estamos para ayudarte.</h1>
          <p className="lead">
            Dejanos tu consulta y el equipo de LUMEN te va a responder por email. Tambien podes usar los canales directos que aparecen mas abajo.
          </p>
        </section>

        <div className="contact-layout">
          <section className="panel contact-form-panel">
            <div>
              <p className="eyebrow">Formulario de consultas</p>
              <h2>Envianos tu mensaje</h2>
              <p className="muted">Cuanto mas clara sea tu consulta, mas facil va a ser orientarte.</p>
            </div>
            {params?.error ? <p className="notice error">{params.error}</p> : null}
            {params?.message ? <p className="notice success">{params.message}</p> : null}
            <form className="contact-form" action="/contacto/enviar" method="post">
              <label>
                Nombre
                <input name="firstName" required placeholder="Tu nombre" />
              </label>
              <label>
                Apellido
                <input name="lastName" required placeholder="Tu apellido" />
              </label>
              <label>
                Email
                <input name="email" required type="email" placeholder="tu@email.com" />
              </label>
              <label>
                Telefono opcional
                <input name="phone" placeholder="+54 9 ..." />
              </label>
              <label className="wide-field">
                Asunto opcional
                <input name="subject" placeholder="Ej: Consulta por turnos, cursos o catalogo" />
              </label>
              <label className="wide-field">
                Consulta
                <textarea name="message" required rows="6" placeholder="Contanos en que podemos ayudarte" />
              </label>
              <button className="button wide-field" type="submit">Enviar consulta</button>
            </form>
          </section>

          <aside className="panel contact-info-panel">
            <p className="eyebrow">Canales directos</p>
            <h2>Contactos</h2>
            <div className="contact-channel-list">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <span>WhatsApp</span>
                <strong>Escribir por WhatsApp</strong>
                <small>El numero definitivo se configura mas adelante.</small>
              </a>
              <a href="mailto:contacto@lumen.local">
                <span>Email</span>
                <strong>contacto@lumen.local</strong>
                <small>Email provisorio hasta cargar el oficial.</small>
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                <span>Instagram</span>
                <strong>@lumen</strong>
                <small>Usuario provisorio para reemplazar cuando este definido.</small>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
