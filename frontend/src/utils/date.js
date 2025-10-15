// utils/date.js
export function formatDate(value) {
  if (!value) return "Fecha no disponible";

  try {
    // Crear un objeto Date directamente del valor
    const fecha = new Date(value);

    // Usar Intl para formatear bonito en español
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(fecha);
  } catch (e) {
    console.error("Error formateando fecha:", value, e);
    return value; // devuelve tal cual si falla
  }
}
