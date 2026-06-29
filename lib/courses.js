export const demoCourses = [
  {
    slug: "comunicacion-pareja",
    title: "Comunicación en la pareja",
    audience: "Adultos",
    type: "Curso grabado",
    duration: "4 módulos",
    price: 39000,
    summary: "Necesidades, límites y acuerdos para conversaciones más claras.",
  },
  {
    slug: "cuidando-cuidador",
    title: "Cuidando al cuidador",
    audience: "Familias y profesionales",
    type: "Taller",
    duration: "2 encuentros",
    price: 24000,
    summary: "Recursos para reconocer desgaste, ordenar prioridades y sostener procesos.",
  },
  {
    slug: "adolescencia-dialogo",
    title: "Cómo hablar con un hijo adolescente",
    audience: "Familias",
    type: "Charla",
    duration: "90 minutos",
    price: 14000,
    summary: "Claves para abrir conversaciones difíciles sin juicio y con límites claros.",
  },
];

export function formatPrice(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalizeCourse(course) {
  return {
    slug: course.slug,
    title: course.title,
    audience: course.audience || "LUMEN",
    type: course.type || "Curso",
    duration: course.duration || course.total_duration || "Aula online",
    price: course.price || 0,
    summary: course.summary || "Curso disponible en la academia LUMEN.",
    description: course.description || course.summary || "",
    coverImageUrl: course.cover_image_url || "",
    introVideoUrl: course.intro_video_url || "",
    instructor: course.instructor || "",
    level: course.level || "",
    totalDuration: course.total_duration || "",
    category: course.category || "",
    featured: Boolean(course.featured),
    learningOutcomes: course.learning_outcomes || "",
    requirements: course.requirements || "",
    faq: course.faq || "",
  };
}
