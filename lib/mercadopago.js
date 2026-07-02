import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

function createMercadoPagoClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
}

export function createMercadoPagoPreferenceClient() {
  return new Preference(createMercadoPagoClient());
}

export function createMercadoPagoPaymentClient() {
  return new Payment(createMercadoPagoClient());
}
