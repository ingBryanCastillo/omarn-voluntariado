import React, { useEffect, useState } from "react";
import { getMensajesContacto, deleteMensajeContacto } from "../services/contactoService";
import Swal from "sweetalert2";

export default function MensajesAdmin() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarMensajes = async () => {
    try {
      const data = await getMensajesContacto();
      setMensajes(data);
    } catch (err) {
      console.error("Error cargando mensajes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Marcar como leído?",
      text: "Este mensaje se eliminará de la bandeja",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, marcar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2e7d6b",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await deleteMensajeContacto(id);
        setMensajes(mensajes.filter((m) => m.id !== id));
        Swal.fire("Hecho", "El mensaje fue eliminado", "success");
      } catch (err) {
        console.error("Error eliminando mensaje:", err);
        Swal.fire("Error", "No se pudo eliminar el mensaje", "error");
      }
    }
  };

  return (
    <div className="window">
      <div className="window-bar">
        <span className="win-dot win-red"></span>
        <span className="win-dot win-amber"></span>
        <span className="win-dot win-green"></span>
        <span className="window-title">Mensajes de Contacto</span>
      </div>
      <div className="section">
        {loading ? (
          <p>Cargando…</p>
        ) : mensajes.length === 0 ? (
          <p>No hay mensajes todavía.</p>
        ) : (
          mensajes.map((msg) => (
            <article key={msg.id} className="card" style={{ marginBottom: "15px" }}>
              <h4>
                {msg.nombre} ({msg.correo})
              </h4>
              <p>{msg.mensaje}</p>
              <small>
                {msg.fecha
                  ? new Date(msg.fecha).toLocaleString("es-ES", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })
                  : "Sin fecha"}
              </small>
              <div style={{ marginTop: "10px" }}>
                <button className="btn outline" onClick={() => handleDelete(msg.id)}>
                  Marcar como leído
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
