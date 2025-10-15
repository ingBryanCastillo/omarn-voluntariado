const API = 'http://72.60.173.25';


/* =======================
   Enviar mensaje de contacto
======================= */
export async function enviarMensajeContacto(payload) {
  const res = await fetch(`${API}/api/contacto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("No se pudo enviar el mensaje");
  }

  const data = await res.json();
  return data;
}

/* =======================
   Obtener mensajes (requiere token)
======================= */
export async function getMensajesContacto() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token guardado");

  const res = await fetch(`${API}/api/contacto`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔥 aquí va el token
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("Error al obtener mensajes:", msg);
    throw new Error("No se pudo obtener los mensajes");
  }

  const data = await res.json();
  return data.data || [];
}

/* =======================
   Eliminar mensaje (solo admin o trabajador)
======================= */
export async function deleteMensajeContacto(id) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No hay token guardado");

  const res = await fetch(`${API}/api/contacto/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔥 también lo requiere
    },
  });

  if (!res.ok) {
    throw new Error("No se pudo eliminar el mensaje");
  }

  const data = await res.json();
  return data;
}
