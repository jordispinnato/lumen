export const metadata = {
  title: "Politica de privacidad | LUMEN",
  description: "Politica de privacidad y tratamiento de datos personales de LUMEN.",
};

const sections = [
  {
    title: "1. Responsable del tratamiento",
    content: [
      "LUMEN es una plataforma interdisciplinaria online orientada a turnos profesionales, cursos asincronicos y recursos terapeuticos. El responsable legal, CUIT, domicilio legal y correo de contacto definitivo deberan ser incorporados antes de publicar esta politica como version final.",
      "Contacto provisorio para consultas de privacidad: completar con el correo oficial de LUMEN.",
    ],
  },
  {
    title: "2. Datos que podemos recopilar",
    content: [
      "Datos de cuenta: nombre, apellido, correo electronico, rol de usuario, fecha de registro y datos necesarios para administrar el acceso a la plataforma.",
      "Datos de turnos: especialista elegido, fecha, horario, modalidad, estado de la reserva, nombre y correo de la persona que solicita el turno.",
      "Datos de cursos: cursos habilitados, avance, lecciones vistas, materiales disponibles y certificados cuando correspondan.",
      "Datos de catalogo: productos solicitados, tipo de producto, estado del pedido y datos de envio para productos fisicos dentro de Argentina.",
      "Datos de pago: la informacion sensible de tarjetas o medios de pago sera gestionada por el proveedor de pagos correspondiente. LUMEN no deberia almacenar numeros completos de tarjeta, codigos de seguridad ni credenciales bancarias.",
      "Datos sensibles: en el marco de la atencion profesional podrian tratarse datos vinculados a salud o bienestar. Estos datos requieren mayor confidencialidad y solo deben utilizarse para la finalidad profesional correspondiente.",
    ],
  },
  {
    title: "3. Finalidades del tratamiento",
    content: [
      "Crear y administrar cuentas de usuario.",
      "Gestionar reservas de turnos, disponibilidad de profesionales y comunicaciones asociadas.",
      "Permitir el acceso a cursos, aula privada, materiales y recursos digitales.",
      "Gestionar solicitudes de compra, descargas digitales y envios de productos fisicos.",
      "Enviar comunicaciones operativas, como confirmaciones de turno, cambios de estado, accesos habilitados o informacion necesaria para el uso de la plataforma.",
      "Mejorar la seguridad, funcionamiento y experiencia de uso de LUMEN.",
    ],
  },
  {
    title: "4. Base legal y consentimiento",
    content: [
      "El uso de LUMEN implica el tratamiento de datos necesarios para prestar los servicios solicitados por la persona usuaria.",
      "Cuando se traten datos sensibles, especialmente vinculados a salud o atencion profesional, el tratamiento debera realizarse con consentimiento, confidencialidad y finalidad especifica.",
      "La persona usuaria no debera cargar informacion de terceros sin autorizacion suficiente.",
    ],
  },
  {
    title: "5. Servicios de terceros",
    content: [
      "LUMEN puede utilizar proveedores tecnologicos para operar la plataforma, tales como Supabase para autenticacion, base de datos y almacenamiento; Vercel para hosting; Google Calendar para sincronizacion de turnos cuando el profesional lo autorice; proveedores de email para comunicaciones; y Mercado Pago u otros procesadores para pagos.",
      "Estos proveedores pueden tratar datos limitados al servicio que prestan y bajo sus propias condiciones y politicas aplicables.",
    ],
  },
  {
    title: "6. Conservacion de datos",
    content: [
      "Los datos se conservaran durante el tiempo necesario para cumplir la finalidad para la que fueron recopilados, mantener registros administrativos, cumplir obligaciones legales o resolver reclamos.",
      "Las notas profesionales, fichas de pacientes o informacion asociada a atencion deberan conservarse conforme a criterios profesionales, legales y de confidencialidad aplicables.",
    ],
  },
  {
    title: "7. Seguridad y confidencialidad",
    content: [
      "LUMEN debe aplicar medidas razonables de seguridad para proteger los datos contra accesos no autorizados, perdida, alteracion o divulgacion indebida.",
      "El acceso a informacion sensible debe limitarse a usuarios autorizados, profesionales intervinientes y administradores estrictamente necesarios para la operacion de la plataforma.",
    ],
  },
  {
    title: "8. Derechos de las personas usuarias",
    content: [
      "Las personas usuarias pueden solicitar acceso, rectificacion, actualizacion o supresion de sus datos personales cuando corresponda.",
      "Tambien pueden solicitar informacion sobre el tratamiento de sus datos y retirar consentimientos cuando ello sea aplicable, sin afectar tratamientos previos realizados legitimamente.",
      "Para ejercer estos derechos se debera escribir al correo oficial de LUMEN, a completar antes de la publicacion definitiva.",
    ],
  },
  {
    title: "9. Autoridad de aplicacion",
    content: [
      "En Argentina, la Agencia de Acceso a la Informacion Publica es la autoridad de aplicacion en materia de proteccion de datos personales. Las personas usuarias pueden realizar reclamos ante dicho organismo cuando consideren afectados sus derechos.",
    ],
  },
  {
    title: "10. Cambios en esta politica",
    content: [
      "LUMEN podra actualizar esta Politica de Privacidad para reflejar cambios legales, tecnicos u operativos. La version vigente sera publicada en esta pagina con su fecha de actualizacion.",
    ],
  },
];

export default function PoliticaPrivacidadPage() {
  return (
    <main className="legal-page">
      <section className="legal-hero">
        <p className="eyebrow">Legal</p>
        <h1>Politica de privacidad</h1>
        <p className="lead">
          Este documento explica como LUMEN recopila, usa, conserva y protege datos personales dentro de la plataforma.
        </p>
        <div className="legal-notice">
          <strong>Version preliminar</strong>
          <p>
            Texto preparado para revision legal. Antes de publicarlo como definitivo, completar datos comerciales de LUMEN
            y validar el tratamiento de datos sensibles vinculados a salud.
          </p>
          <span>Ultima actualizacion: 2 de julio de 2026</span>
        </div>
      </section>

      <section className="legal-content">
        {sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            {section.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </section>
    </main>
  );
}
