import React, { useEffect, useState } from "react";
import {
  getSolicitudes,
  getSolicitudesUsuario,
  actualizarEstadoSolicitud,
} from "../services/solicitudesService";
import { getCatalogoJornadas } from "../services/catalogoService";
import { getToken } from "../services/authService";
import Swal from "sweetalert2";
import { formatDate } from "../utils/date"; // ✅ Se importa el helper

const API = "http://127.0.0.1:5000";

const decodeToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return { ...decoded, id: decoded.usuario_id };
  } catch (e) {
    return null;
  }
};

function Solicitudes() {
  const [catalogo, setCatalogo] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const u = decodeToken(token);
      setUser(u);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const data = await getCatalogoJornadas();
      setCatalogo(data);
    })();
  }, []);

  const loadSolicitudes = async () => {
    if (!user) return;
    setLoading(true);
    let data = [];
    if (user.rol_id === 1 || user.rol_id === 3) {
      data = await getSolicitudes(); // todas
    } else {
      data = await getSolicitudesUsuario(user.id); // solo suyas
    }
    setSolicitudes(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadSolicitudes();
  }, [user]);

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!tipoId || !descripcion) {
      Swal.fire("Error", "Selecciona tipo y escribe descripción", "error");
      return;
    }

    const formData = new FormData();
    formData.append("usuario_id", user.id);
    formData.append("catalogo_jornada_id", tipoId);
    formData.append("descripcion", descripcion);
    if (archivo) formData.append("archivo", archivo);

    try {
      const res = await fetch(`${API}/api/solicitudes`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", data.message, "success");
        setDescripcion("");
        setTipoId("");
        setArchivo(null);
        loadSolicitudes();
      } else {
        Swal.fire("Error", data.error || "No se pudo crear la solicitud", "error");
      }
    } catch {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  };

  const handleUpdate = async (id, estado) => {
    const res = await actualizarEstadoSolicitud(id, estado);
    if (res.ok) {
      Swal.fire("Éxito", res.message, "success");
      loadSolicitudes();
    } else {
      Swal.fire("Error", res.error || "No se pudo actualizar", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta solicitud será eliminada permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API}/api/solicitudes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", data.message, "success");
        loadSolicitudes();
      } else {
        Swal.fire("Error", data.error || "No se pudo eliminar", "error");
      }
    } catch {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  };

  return (
    <div className="window">
      <div className="window-bar">
        <span className="win-dot win-red"></span>
        <span className="win-dot win-amber"></span>
        <span className="win-dot win-green"></span>
        <span className="window-title">Solicitudes</span>
      </div>
      <div className="section">
        {/* ✅ Formulario disponible para TODOS los roles */}
        {user && (
          <form
            onSubmit={handleCrear}
            className="solicitudes-form"
            style={{ marginBottom: 20 }}
          >
            <div>
              <label>Tipo:</label>
              <select
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                className="input"
              >
                <option value="">-- Seleccionar --</option>
                {catalogo.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Descripción:</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="input"
                rows="3"
              />
            </div>

            <div>
              <label>Archivo (Word o PDF):</label>
              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files[0])}
                className="input"
              />
            </div>

            <button type="submit" className="btn">
              Enviar Solicitud
            </button>
          </form>
        )}

        {/* Tabla */}
        {loading ? (
          <p>Cargando…</p>
        ) : solicitudes.length === 0 ? (
          <p>No hay solicitudes.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {(user.rol_id === 1 || user.rol_id === 3) && <th>ID</th>}
                  {(user.rol_id === 1 || user.rol_id === 3) && <th>Usuario</th>}
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Archivo</th>
                  {(user.rol_id === 1 || user.rol_id === 3) && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id}>
                    {(user.rol_id === 1 || user.rol_id === 3) && <td>{s.id}</td>}
                    {(user.rol_id === 1 || user.rol_id === 3) && (
                      <td>{s.nombre || s.email}</td>
                    )}
                    <td>{s.tipo}</td>
                    <td>{s.descripcion}</td>
                    <td>{formatDate(s.fecha_solicitud)}</td>
                    <td>
                      <span className={`estado-tag estado-${s.estado}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td>
                      {s.archivo ? (
                        <a
                          href={`${API}/static/uploads/solicitudes/${s.archivo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver archivo
                        </a>
                      ) : (
                        "Sin archivo"
                      )}
                    </td>
                    {(user.rol_id === 1 || user.rol_id === 3) && (
                      <td>
                        {s.estado === "pendiente" ? (
                          <>
                            <button
                              className="btn-sm"
                              onClick={() => handleUpdate(s.id, "aprobada")}
                            >
                              Aprobar
                            </button>
                            <button
                              className="btn-sm danger"
                              onClick={() => handleUpdate(s.id, "rechazada")}
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-sm danger"
                            onClick={() => handleDelete(s.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Solicitudes;
