export const demoProducts = [
  {
    id: "demo-fidgets",
    title: "Kit de fidgets sensoriales",
    product_type: "physical",
    category: "Regulacion sensorial",
    summary: "Recursos tactiles para acompanar ansiedad, descarga de energia y foco atencional.",
    price: 12000,
    stock: 8,
    status: "published",
  },
  {
    id: "demo-tablero",
    title: "Tablero sensorial de mesa",
    product_type: "physical",
    category: "Material terapeutico",
    summary: "Herramienta de exploracion tactil para espacios clinicos, educativos y familiares.",
    price: 28000,
    stock: 3,
    status: "published",
  },
  {
    id: "demo-cuadernillo",
    title: "Cuadernillo de autoconocimiento",
    product_type: "digital",
    category: "Recurso descargable",
    summary: "Ejercicios guiados para identificar emociones, necesidades y patrones cotidianos.",
    price: 8500,
    stock: null,
    status: "published",
  },
  {
    id: "demo-terapeutas",
    title: "Plantillas para terapeutas",
    product_type: "digital",
    category: "Practica clinica",
    summary: "Material psicoeducativo y fichas de trabajo para usar en sesiones.",
    price: 15000,
    stock: null,
    status: "published",
  },
];

export function getProductTypeLabel(type) {
  return type === "digital" ? "Digital" : "Fisico";
}
