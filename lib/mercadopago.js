import { MercadoPagoConfig, Preference } from "mercadopago";

export function createMercadoPagoPreferenceClient() {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });

  return new Preference(client);
}
