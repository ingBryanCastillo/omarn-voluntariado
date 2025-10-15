const API = 'http://72.60.173.25';


function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// ✅ Obtener jornadas públicas
export async function getJornadas(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${API}/api/jornadas${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data?.ok) return data.data || [];
  return [];
}

// ✅ Crear jornada (requiere token)
export async function createJornada(payload) {
  const res = await fetch(`${API}/api/jornadas`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || data.mensaje || 'No se pudo crear la jornada');
  }
  return data.data?.id || null;
}

// ✅ Actualizar jornada (requiere token)
export async function updateJornada(id, payload) {
  const res = await fetch(`${API}/api/jornadas/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || data.mensaje || 'No se pudo actualizar la jornada');
  }
  return true;
}

// Cancelar jornada (soft delete → cambia estado a cancelada)
export async function cancelJornada(id) {
  const res = await fetch(`${API}/api/jornadas/${id}/cancelar`, {
    method: 'PUT',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || data.mensaje || 'No se pudo cancelar la jornada');
  }
  return true;
}

// Eliminar jornada definitiva (borrado real)
export async function deleteJornada(id) {
  const res = await fetch(`${API}/api/jornadas/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || 'Error al eliminar jornada');
  }
  return true;
}
