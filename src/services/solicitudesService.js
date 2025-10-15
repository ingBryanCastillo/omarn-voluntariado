const API = 'http://72.60.173.25';


function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ✅ Obtener todas las solicitudes (admin)
export async function getSolicitudes() {
  try {
    const res = await fetch(`${API}/api/solicitudes`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error en la API");
    return data.data || [];
  } catch (err) {
    console.error("Error cargando solicitudes (admin):", err);
    return [];
  }
}

// ✅ Obtener solicitudes de un usuario específico
export async function getSolicitudesUsuario(usuario_id) {
  try {
    const res = await fetch(`${API}/api/solicitudes/usuario/${usuario_id}`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error en la API");
    return data.data || [];
  } catch (err) {
    console.error("Error cargando solicitudes del usuario:", err);
    return [];
  }
}

// ✅ Crear solicitud (con archivo opcional)
export async function crearSolicitud(usuario_id, catalogo_jornada_id, descripcion, archivo = null) {
  try {
    const formData = new FormData();
    formData.append("usuario_id", usuario_id);
    formData.append("catalogo_jornada_id", catalogo_jornada_id);
    formData.append("descripcion", descripcion);
    if (archivo) {
      formData.append("archivo", archivo);
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/api/solicitudes`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {}, // ❌ No pongas Content-Type, fetch lo maneja
      body: formData,
    });

    const data = await res.json();
    return { ok: res.status === 201, ...data };
  } catch (err) {
    console.error("Error creando solicitud:", err);
    return { ok: false, error: "No se pudo conectar con el servidor" };
  }
}

// ✅ Actualizar estado de solicitud (admin)
export async function actualizarEstadoSolicitud(id, estado) {
  try {
    const res = await fetch(`${API}/api/solicitudes/${id}/estado`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ estado }),
    });
    const data = await res.json();
    return { ok: res.status === 200, ...data };
  } catch (err) {
    console.error("Error actualizando estado de solicitud:", err);
    return { ok: false, error: "No se pudo conectar con el servidor" };
  }
}