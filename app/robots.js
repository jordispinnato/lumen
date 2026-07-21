export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://espaciolumen.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/registro",
          "/admin",
          "/especialista",
          "/mi-cuenta",
          "/mi-perfil",
          "/carrito",
          "/mis-pedidos",
          "/facturacion",
          "/configuracion",
          "/checkout",
          "/auth",
          "/api",
          "/turnos/reservar",
          "/turnos/reprogramar",
          "/turnos/cancelar",
          "/catalogo/cart",
          "/catalogo/orders",
          "/catalogo/resources",
          "/notifications",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
