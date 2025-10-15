// src/services/topVoluntariosService.js
const API = 'http://72.60.173.25';


function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Obtener el ranking de voluntarios
export async function getTopVoluntarios() {
  try {
    const res = await fetch(`${API}/api/top_voluntarios`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al cargar ranking");
    return data.data || [];
  } catch (err) {
    console.error("Error cargando top voluntarios:", err);
    return [];
  }
}
