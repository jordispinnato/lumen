import { createSupabaseServerClient } from "../../../lib/supabase/server";
import BillingDetailsForm from "../../components/BillingDetailsForm";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderId = params?.order;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: order } = userData.user && isUuid(orderId)
    ? await supabase
        .from("orders")
        .select("id,status,amount,courses:course_id (slug,title)")
        .eq("id", orderId)
        .eq("user_id", userData.user.id)
        .maybeSingle()
    : { data: null };
  const { data: billingProfile } = userData.user
    ? await supabase
        .from("billing_profiles")
        .select("buyer_type,legal_name,tax_id,tax_condition,billing_email,fiscal_address,province,city,postal_code")
        .eq("user_id", userData.user.id)
        .eq("is_default", true)
        .maybeSingle()
    : { data: null };
  const { data: invoiceRequest } = userData.user && order?.id
    ? await supabase
        .from("invoice_requests")
        .select("id,status,invoice_number")
        .eq("order_id", order.id)
        .eq("user_id", userData.user.id)
        .maybeSingle()
    : { data: null };
  const isApproved = order?.status === "approved";
  const courseUrl = order?.courses?.slug ? `/aula?curso=${order.courses.slug}` : "/aula";
  const wantsInvoice = params?.factura === "si";

  return (
    <main className="section">
      <div className="form-card">
        <p className="eyebrow">Pago recibido</p>
        <h1>{isApproved ? "Tu curso esta habilitado" : "Estamos confirmando tu pago"}</h1>
        <p className="muted">
          {isApproved
            ? `Ya podes entrar al aula y empezar ${order?.courses?.title || "tu curso"}.`
            : "Mercado Pago puede tardar unos minutos en avisarnos. Cuando se confirme, el curso aparece automaticamente en tu aula."}
        </p>
        <a className="button" href={courseUrl}>
          Ir al aula
        </a>
      </div>

      {isApproved ? (
        <section className="billing-post-checkout">
          {params?.message ? <p className="notice success">{params.message}</p> : null}
          {params?.error ? <p className="notice error">{params.error}</p> : null}
          <div>
            <p className="eyebrow">Facturacion opcional</p>
            <h2>Necesitas factura?</h2>
            <p className="muted">
              Si necesitas factura por esta compra, completa tus datos de facturacion. Si no la necesitas, no hace falta hacer nada.
            </p>
          </div>

          {invoiceRequest ? (
            <div className="notice success">
              Factura {invoiceRequest.status === "issued" ? "emitida" : "solicitada"}.{" "}
              {invoiceRequest.invoice_number ? `Numero: ${invoiceRequest.invoice_number}` : "El equipo de LUMEN revisara los datos."}
            </div>
          ) : (
            <div className="billing-choice-actions">
              <a className="account-primary-action" href={`/checkout/exito?order=${order.id}&factura=si`}>Si, necesito factura</a>
              <a className="account-secondary-action" href={courseUrl}>No, continuar</a>
            </div>
          )}

          {wantsInvoice && !invoiceRequest ? (
            <BillingDetailsForm
              billingProfile={billingProfile}
              userEmail={userData.user?.email}
              purchaseType="course"
              orderId={order.id}
              returnTo={`/checkout/exito?order=${order.id}&factura=si`}
              submitLabel="Solicitar factura"
              intro="Estos datos se guardan para que puedas reutilizarlos en futuras compras."
            />
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
