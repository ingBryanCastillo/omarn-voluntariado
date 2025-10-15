const API = 'http://72.60.173.25';


function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra
  };
}

export async function getNoticias() {
  try {
    const res = await fetch(`${API}/api/noticias?estado=publicada`);
    if (!res.ok) throw new Error("Error al obtener noticias");
    const data = await res.json();

    if (data?.ok && Array.isArray(data.data)) {
      return data.data.map(n => ({
        id: n.id,
        titulo: n.titulo,
        contenido: n.contenido,
        fecha_pub: n.fecha_pub,
        estado: n.estado,
        autor_nombre: n.autor_nombre || "Anónimo",
        imagen_url: n.imagen_url || null,
      }));
    }
    return [];
  } catch (err) {
    console.error("Error en getNoticias:", err);
    return [];
  }
}

export async function createNoticia({ titulo, contenido, imagen_url, estado = 'publicada' }) {
  const res = await fetch(`${API}/api/noticias`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ titulo, contenido, imagen_url, estado })
  });
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || data.mensaje || 'Error al crear noticia');
  }
  return data.data?.id;
}

export async function uploadNoticiaFile(file) {
  const token = localStorage.getItem('token');
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API}/api/noticias/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  });

  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || 'No se pudo subir la imagen');
  }
  return data.url;
}
export async function updateNoticia(id, data) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/noticias/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Error al actualizar noticia");
  return result;
}
