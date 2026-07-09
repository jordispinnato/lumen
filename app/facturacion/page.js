import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { formatPrice } from "../../lib/courses";
import BillingDetailsForm from "../components/BillingDetailsForm";
import AccountDashboardShell from "../mi-cuenta/AccountDashboardShell";
import {
  applyReadReceipts,
  buildPurchaseRows,
  getInvoiceStatusLabel,
  getTaxConditionLabel,
  formatDateTime,
  AccountIcon,
} from "../mi-cuenta/accountShared";

export const metadata = {
  title: "Facturación | LUMEN",
};

function initialsFromName(name) {
  return String(name || "L")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

export default async function FacturacionPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/facturacion");
  }

  const [
    { data: profile },
    { data: notifications },
    { data: messages },
    { data: catalogOrders },
    { data: courseOrders },
    { data: billingProfile },
    { data: invoiceRequests },
    { data: readReceipts },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,role")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase
      .from("user_notifications")
      .select("id,title,body,href,notification_type,read_at,created_at")
      .or(`user_id.eq.${userData.user.id},user_id.is.null`)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_messages")
      .select("id,subject,body,message_type,read_at,created_at")
      .or(`user_id.eq.${userData.user.id},user_id.is.null`)
      .order("created_at", { ascending: false }),
    supabase
      .from("catalog_orders")
      .select(`
        id,
        product_type,
        status,
        amount,
        created_at,
        catalog_products:product_id (
          id,
          title
        )
      `)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id,status,amount,created_at,courses:course_id (id,slug,title)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("billing_profiles")
      .select("buyer_type,legal_name,tax_id,tax_condition,billing_email,fiscal_address,province,city,postal_code")
      .eq("user_id", userData.user.id)
      .eq("is_default", true)
      .maybeSingle(),
    supabase
      .from("invoice_requests")
      .select("id,order_id,catalog_order_id,purchase_type,status,invoice_number,invoice_file_url,requested_at,issued_at")
      .eq("user_id", userData.user.id)
      .order("requested_at", { ascending: false }),
    supabase
      .from("user_notification_reads")
      .select("item_type,item_id")
      .eq("user_id", userData.user.id),
  ]);

  const receiptSet = new Set((readReceipts || []).map((item) => `${item.item_type}:${item.item_id}`));
  const notificationList = applyReadReceipts(notifications || [], receiptSet, "notification");
  const messageList = applyReadReceipts(messages || [], receiptSet, "message");
  const pendingAccountAlerts =
    notificationList.filter((item) => !item.read_at).length + messageList.filter((item) => !item.read_at).length;
  const profileName = profile?.full_name || userData.user.user_metadata?.full_name || "";
  const displayName = profileName || userData.user.email;
  const avatarInitials = initialsFromName(displayName);

  const invoiceRequestList = invoiceRequests || [];
  const purchaseRows = buildPurchaseRows(courseOrders || [], catalogOrders || [], invoiceRequestList);
  const invoiceEligiblePurchases = purchaseRows.filter((purchase) => purchase.canRequestInvoice);

  return (
    <AccountDashboardShell
      navItems={[{ href: "/mi-cuenta", icon: "I", label: "Volver a Mi Espacio" }]}
      displayName={displayName}
      avatarInitials={avatarInitials}
      isAdmin={profile?.role === "admin"}
      notificationCount={pendingAccountAlerts}
      notifications={notificationList}
      messages={messageList}
    >
      <div className="account-dashboard">
        {params?.message ? <p className="notice success">{params.message}</p> : null}
        {params?.error ? <p className="notice error">{params.error}</p> : null}

        <section className="account-hero">
          <div>
            <span className="account-page-kicker">Mi cuenta</span>
            <h1>Facturación</h1>
          </div>
        </section>

        <section className="account-panel" id="facturacion">
          <div className="account-panel-head">
            <div>
              <AccountIcon tone="orange">F</AccountIcon>
              <h2>Facturacion</h2>
            </div>
          </div>
          <div className="account-profile-grid">
            <div>
              <span>Nombre / razon social</span>
              <strong>{billingProfile?.legal_name || "Sin datos cargados"}</strong>
            </div>
            <div>
              <span>DNI / CUIL / CUIT</span>
              <strong>{billingProfile?.tax_id || "Sin datos cargados"}</strong>
            </div>
            <div>
              <span>Condicion fiscal</span>
              <strong>{getTaxConditionLabel(billingProfile?.tax_condition)}</strong>
            </div>
            <div>
              <span>Email de facturacion</span>
              <strong>{billingProfile?.billing_email || userData.user.email}</strong>
            </div>
          </div>
          <div className="account-settings-grid is-wide">
            <BillingDetailsForm
              billingProfile={billingProfile}
              userEmail={userData.user.email}
              returnTo="/facturacion"
              submitLabel="Guardar datos de facturacion"
              intro="Estos datos quedan guardados para futuras compras. La factura siempre se solicita despues del pago."
            />
            <div className="account-settings-card">
              <h3>Solicitar factura de una compra</h3>
              <p>Si ya guardaste tus datos fiscales, podes pedir factura para una compra pagada.</p>
              {billingProfile && invoiceEligiblePurchases.length ? (
                <form className="billing-quick-request" action="/mi-cuenta/billing/request" method="post">
                  <input name="buyerType" type="hidden" value={billingProfile.buyer_type || "person"} />
                  <input name="legalName" type="hidden" value={billingProfile.legal_name || ""} />
                  <input name="taxId" type="hidden" value={billingProfile.tax_id || ""} />
                  <input name="taxCondition" type="hidden" value={billingProfile.tax_condition || "consumidor_final"} />
                  <input name="billingEmail" type="hidden" value={billingProfile.billing_email || userData.user.email || ""} />
                  <input name="fiscalAddress" type="hidden" value={billingProfile.fiscal_address || ""} />
                  <input name="province" type="hidden" value={billingProfile.province || ""} />
                  <input name="city" type="hidden" value={billingProfile.city || ""} />
                  <input name="postalCode" type="hidden" value={billingProfile.postal_code || ""} />
                  <input name="returnTo" type="hidden" value="/facturacion" />
                  <label>
                    Compra
                    <select name="purchaseKey" required>
                      <option value="">Seleccionar compra</option>
                      {invoiceEligiblePurchases.map((purchase) => (
                        <option value={purchase.purchaseKey} key={purchase.id}>
                          {purchase.title} - {formatPrice(purchase.amount)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="account-secondary-action" type="submit">Solicitar factura</button>
                </form>
              ) : (
                <p className="muted">
                  {billingProfile ? "No hay compras pagadas pendientes de factura." : "Primero guarda tus datos fiscales."}
                </p>
              )}
            </div>
            <div className="account-settings-card">
              <h3>Estado de facturas</h3>
              <p>Por ahora LUMEN registra la solicitud y permite al admin marcarla como emitida. Mas adelante aca se puede integrar AFIP/ARCA o un generador automatico de comprobantes.</p>
              {invoiceRequestList.length ? (
                <div className="account-message-list">
                  {invoiceRequestList.slice(0, 4).map((invoice) => (
                    <article key={invoice.id}>
                      <span>{getInvoiceStatusLabel(invoice.status)}</span>
                      <strong>{invoice.purchase_type === "course" ? "Curso" : "Catalogo"}</strong>
                      <small>{formatDateTime(invoice.requested_at)}</small>
                      {invoice.invoice_number ? <small>Numero: {invoice.invoice_number}</small> : null}
                      {invoice.invoice_file_url ? <a href={invoice.invoice_file_url}>Ver comprobante</a> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted">Todavia no solicitaste facturas.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AccountDashboardShell>
  );
}
