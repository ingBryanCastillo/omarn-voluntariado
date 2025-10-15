const API = 'http://72.60.173.25';


function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// ✅ Inscribir a una jornada
export async function inscribirParticipacion(usuario_id, jornada_id) {
  try {
    const res = await fetch(`${API}/api/participaciones/inscribir`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        usuario_id: usuario_id,   // 👈 nombres idénticos a backend
        jornada_id: jornada_id
      })
    });

    let data = {};
    try {
      data = await res.json();
    } catch (err) {
      console.error("Error parseando JSON en inscribirParticipacion:", err);
    }

    return { status: res.status, data };
  } catch (error) {
    console.error("Error de conexión con el backend en inscribirParticipacion:", error);
    return { status: 500, data: { error: "No se pudo conectar con el servidor" } };
  }
}

// ✅ Obtener todas las participaciones (admin)
export async function getParticipaciones() {
  try {
    const res = await fetch(`${API}/api/participaciones`, { headers: authHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("Error obteniendo todas las participaciones:", err);
    return [];
  }
}

// ✅ Obtener participaciones de un usuario
export async function getParticipacionesUsuario(usuario_id) {
  try {
    const res = await fetch(`${API}/api/participaciones/usuario/${usuario_id}`, { headers: authHeaders() });
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("Error obteniendo participaciones del usuario:", err);
    return [];
  }
}

// ✅ Confirmar asistencia y asignar puntos
export async function confirmarAsistencia(participacion_id, puntos = 0) {
  try {
    const res = await fetch(`${API}/api/participaciones/${participacion_id}/confirmar`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ puntos })
    });
    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    console.error("Error confirmando asistencia:", err);
    return { status: 500, data: { error: "No se pudo conectar con el servidor" } };
  }
}
