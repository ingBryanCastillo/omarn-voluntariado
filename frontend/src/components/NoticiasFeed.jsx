import React, { useState } from "react";
import { getToken } from "../services/authService";
import Swal from "sweetalert2";
import NoticiaFormModal from "./NoticiaFormModal";

const API = "http://127.0.0.1:5000";

export default function NoticiasFeed({ items = [], loading, user }) {
  const [editing, setEditing] = useState(null);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Cargando noticias…</p>;
  }

  if (!items.length) {
    return (
      <div style={{ textAlign: "center", color: "var(--muted)" }}>
        Aún no hay noticias publicadas.
      </div>
    );
  }

  const handleEliminar = async (id) => {
    const token = getToken();
    const confirm = await Swal.fire({
      title: "¿Eliminar noticia?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API}/api/noticias/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error", data.error || "No se pudo eliminar la noticia", "error");
        return;
      }

      Swal.fire("Eliminado", "La noticia se eliminó correctamente.", "success");
      window.location.reload();
    } catch (err) {
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {items.map((n) => (
        <article
          key={n.id}
          style={{
            background: "white",
            padding: 20,
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "relative",
          }}
        >
          <h2 style={{ margin: 0 }}>{n.titulo || "Sin título"}</h2>

          <p style={{ margin: 0, color: "#444" }}>
            {n.contenido || "Sin contenido"}
          </p>

          {n.imagen_url && (
            <img
              src={n.imagen_url}
              alt={n.titulo}
              style={{
                width: "100%",
                maxHeight: 300,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          )}

          <small style={{ opacity: 0.8 }}>
             Publicado por {n.autor_nombre || "Anónimo"} el{" "}
             {n.fecha_pub ? new Date(n.fecha_pub).toLocaleDateString("es-GT") : "Fecha no disponible"}
          </small>

          {/* ✅ Bloque de botones actualizado con la nueva lógica de permisos */}
          {(user?.rol_id === 1 || user?.rol_id === 3) && (
            <div style={{ display: "flex", gap: "8px", marginTop: 8 }}>
              <button
                className="btn-edit"
                onClick={() => setEditing(n)}
              >
                Editar
              </button>
              <button
                className="btn-delete"
                onClick={() => handleEliminar(n.id)}
              >
                Eliminar
              </button>
            </div>
          )}
        </article>
      ))}

      {editing && (
        <NoticiaFormModal
          open={!!editing}
          noticia={editing}
          onClose={() => setEditing(null)}
          onUpdated={() => window.location.reload()}
        />
      )}
    </div>
  );
}