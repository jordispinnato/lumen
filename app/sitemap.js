export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://espaciolumen.com";
  const staticRoutes = [
    "",
    "/quienes-somos",
    "/cursos",
    "/catalogo",
    "/turnos",
    "/contacto",
    "/terminos-condiciones",
    "/politica-privacidad",
  ];

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));
}
