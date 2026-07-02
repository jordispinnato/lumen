import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

const argentinaProvinces = new Set([
  "Buenos Aires",
  "Ciudad Autonoma de Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Cordoba",
  "Corrientes",
  "Entre Rios",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquen",
  "Rio Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucuman",
]);

export async function POST(request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const productId = String(formData.get("productId") || "").trim();
  const customerName = String(formData.get("customerName") || "").trim();
  const shippingPhone = String(formData.get("shippingPhone") || "").trim();
  const shippingProvince = String(formData.get("shippingProvince") || "").trim();
  const shippingCity = String(formData.get("shippingCity") || "").trim();
  const shippingPostalCode = String(formData.get("shippingPostalCode") || "").trim();
  const shippingStreet = String(formData.get("shippingStreet") || "").trim();
  const shippingNumber = String(formData.get("shippingNumber") || "").trim();
  const shippingFloorApartment = String(formData.get("shippingFloorApartment") || "").trim();
  const shippingNotes = String(formData.get("shippingNotes") || "").trim();
  const supabase = await createSupabaseServerClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId);

  if (!isUuid) {
    return NextResponse.redirect(`${origin}/catalogo?error=${encodeURIComponent("Cargá un producto real desde admin para registrar una compra")}`, {
      status: 303,
    });
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(`${origin}/login?next=/catalogo/${productId}`, { status: 303 });
  }

  const { data: product } = await supabase
    .from("catalog_products")
    .select("id,title,product_type,price,status")
    .eq("id", productId)
    .eq("status", "published")
    .maybeSingle();

  if (!product) {
    return NextResponse.redirect(`${origin}/catalogo?error=${encodeURIComponent("Producto no disponible")}`, {
      status: 303,
    });
  }

  if (product.product_type === "physical") {
    const missingShipping = !shippingPhone || !shippingProvince || !shippingCity || !shippingPostalCode || !shippingStreet || !shippingNumber;

    if (missingShipping) {
      return NextResponse.redirect(
        `${origin}/catalogo/${productId}?error=${encodeURIComponent("Completá los datos de envío")}`,
        { status: 303 }
      );
    }

    if (!argentinaProvinces.has(shippingProvince)) {
      return NextResponse.redirect(
        `${origin}/catalogo/${productId}?error=${encodeURIComponent("Selecciona una provincia de Argentina")}`,
        { status: 303 }
      );
    }
  }

  const { error } = await supabase.from("catalog_orders").insert({
    user_id: userData.user.id,
    product_id: product.id,
    product_type: product.product_type,
    amount: product.price,
    status: "pending_payment",
    customer_email: userData.user.email,
    customer_name: customerName || null,
    shipping_phone: product.product_type === "physical" ? shippingPhone : null,
    shipping_province: product.product_type === "physical" ? shippingProvince : null,
    shipping_city: product.product_type === "physical" ? shippingCity : null,
    shipping_postal_code: product.product_type === "physical" ? shippingPostalCode : null,
    shipping_street: product.product_type === "physical" ? shippingStreet : null,
    shipping_number: product.product_type === "physical" ? shippingNumber : null,
    shipping_floor_apartment: product.product_type === "physical" ? shippingFloorApartment || null : null,
    shipping_notes: product.product_type === "physical" ? shippingNotes || null : null,
  });

  if (error) {
    return NextResponse.redirect(`${origin}/catalogo/${productId}?error=${encodeURIComponent(error.message)}`, {
      status: 303,
    });
  }

  return NextResponse.redirect(`${origin}/catalogo/${productId}?message=Solicitud registrada`, { status: 303 });
}
