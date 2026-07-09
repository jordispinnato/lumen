const taxConditionOptions = [
  ["consumidor_final", "Consumidor final"],
  ["monotributo", "Monotributo"],
  ["responsable_inscripto", "Responsable inscripto"],
  ["exento", "Exento"],
];

function getDefault(profile, key, fallback = "") {
  return profile?.[key] || fallback || "";
}

export default function BillingDetailsForm({
  billingProfile,
  userEmail,
  purchaseType = "",
  orderId = "",
  returnTo = "/facturacion",
  submitLabel = "Guardar datos",
  intro,
}) {
  return (
    <form className="billing-form account-settings-card" action="/mi-cuenta/billing/request" method="post">
      <input name="purchaseType" type="hidden" value={purchaseType} />
      <input name="orderId" type="hidden" value={orderId} />
      <input name="returnTo" type="hidden" value={returnTo} />

      {intro ? <p>{intro}</p> : null}

      <label>
        Tipo de comprador
        <select name="buyerType" defaultValue={getDefault(billingProfile, "buyer_type", "person")}>
          <option value="person">Persona</option>
          <option value="company">Empresa</option>
        </select>
      </label>

      <label>
        Nombre y apellido o razon social
        <input name="legalName" defaultValue={getDefault(billingProfile, "legal_name")} required />
      </label>

      <label>
        DNI / CUIL / CUIT
        <input name="taxId" defaultValue={getDefault(billingProfile, "tax_id")} required />
      </label>

      <label>
        Condicion fiscal
        <select name="taxCondition" defaultValue={getDefault(billingProfile, "tax_condition", "consumidor_final")}>
          {taxConditionOptions.map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
      </label>

      <label>
        Email de facturacion
        <input name="billingEmail" type="email" defaultValue={getDefault(billingProfile, "billing_email", userEmail)} required />
      </label>

      <label className="wide-field">
        Direccion fiscal
        <input name="fiscalAddress" defaultValue={getDefault(billingProfile, "fiscal_address")} required />
      </label>

      <label>
        Provincia
        <input name="province" defaultValue={getDefault(billingProfile, "province")} required />
      </label>

      <label>
        Localidad
        <input name="city" defaultValue={getDefault(billingProfile, "city")} required />
      </label>

      <label>
        Codigo postal
        <input name="postalCode" defaultValue={getDefault(billingProfile, "postal_code")} required />
      </label>

      <button className="account-primary-action wide-field" type="submit">{submitLabel}</button>
    </form>
  );
}
