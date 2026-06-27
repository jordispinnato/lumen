import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { formatPrice } from "../../../lib/courses";
import { demoProducts, getProductTypeLabel } from "../../../lib/catalog";

export default async function ProductDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  let product = demoProducts.find((item) => item.id === id);

  if (!product) {
    const { data } = await supabase
      .from("catalog_products")
      .select("id,title,product_type,category,summary,price,stock,digital_url,digital_file_name,status")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    product = data;
  }

  if (!product) {
    notFound();
  }

  const isPhysical = product.product_type === "physical";
  const isDemo = product.id?.startsWith("demo-");

  return (
    <main className="section">
      <div className="dashboard-shell">
        <div className="product-detail">
          <section className="panel">
            <div className={`product-type ${product.product_type}`}>
              {getProductTypeLabel(product.product_type)}
            </div>
            <p className="eyebrow">{product.category}</p>
            <h1>{product.title}</h1>
            <p className="lead">{product.summary}</p>
            <p className="price">{formatPrice(product.price)}</p>
            {isPhysical ? (
              <p className="muted">Producto fisico con envio dentro de Argentina. Stock: {product.stock ?? "A confirmar"}.</p>
            ) : (
              <p className="muted">
                Recurso digital. {product.digital_file_name ? `Archivo cargado: ${product.digital_file_name}.` : "La descarga se habilitara cuando el pago este confirmado."}
              </p>
            )}
            <a className="secondary-button" href="/catalogo">Volver al catalogo</a>
          </section>

          <aside className="panel">
            <p className="eyebrow">Compra</p>
            <h2>{isPhysical ? "Datos para envio" : "Solicitar recurso digital"}</h2>
            {query?.error ? <p className="notice error">{query.error}</p> : null}
            {query?.message ? <p className="notice success">{query.message}</p> : null}

            {isDemo ? (
              <p className="notice success">Este es un producto de ejemplo. Carga productos reales desde admin para registrar solicitudes.</p>
            ) : userData.user ? (
              <form className="purchase-form" action="/catalogo/orders/create" method="post">
                <input name="productId" type="hidden" value={product.id} />
                <label>
                  Nombre y apellido
                  <input name="customerName" placeholder="Nombre de quien compra" />
                </label>

                {isPhysical ? (
                  <>
                    <label>
                      Telefono de contacto
                      <input name="shippingPhone" required placeholder="Ej: 11 1234 5678" />
                    </label>
                    <label>
                      Provincia
                      <input name="shippingProvince" required placeholder="Ej: Buenos Aires" />
                    </label>
                    <label>
                      Localidad
                      <input name="shippingCity" required placeholder="Ej: CABA, La Plata, Rosario" />
                    </label>
                    <label>
                      Codigo postal
                      <input name="shippingPostalCode" required placeholder="Ej: 1405" />
                    </label>
                    <label>
                      Calle
                      <input name="shippingStreet" required placeholder="Ej: Av. Corrientes" />
                    </label>
                    <label>
                      Numero
                      <input name="shippingNumber" required placeholder="Ej: 1234" />
                    </label>
                    <label>
                      Piso / departamento
                      <input name="shippingFloorApartment" placeholder="Opcional" />
                    </label>
                    <label>
                      Indicaciones para el envio
                      <textarea name="shippingNotes" rows="3" placeholder="Opcional" />
                    </label>
                  </>
                ) : (
                  <p className="muted">La descarga se habilitara automaticamente cuando conectemos pagos y el pago quede aprobado.</p>
                )}

                <button className="button" type="submit">Registrar solicitud</button>
              </form>
            ) : (
              <div className="booking-login-box">
                <p className="muted">Para comprar o solicitar este producto necesitás iniciar sesión.</p>
                <a className="button" href="/login">Ingresar</a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
