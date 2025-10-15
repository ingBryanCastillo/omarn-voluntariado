// src/services/catalogoService.js
// src/services/noticiasService.js
const API = 'http://72.60.173.25';
  // 👈 usa la IP de tu máquina donde corre Flask


/**
 * Obtiene todos los tipos de jornadas (catálogo) que están activos
 */
export async function getCatalogoJornadas() {
  const res = await fetch(`${API}/api/catalogo_jornadas?estado=activo`);
  
  if (!res.ok) {
    throw new Error("No se pudo cargar el catálogo");
  }

  const data = await res.json();
  return data.data || []; // devolvemos siempre un array
}
