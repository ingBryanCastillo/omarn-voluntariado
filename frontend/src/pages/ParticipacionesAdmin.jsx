import React, { useEffect, useState } from "react";
import {
  getParticipaciones,
  confirmarAsistencia,
} from "../services/participacionesService";
import Swal from "sweetalert2";

function ParticipacionesAdmin() {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getParticipaciones();
      setParticipaciones(data);
    } catch (err) {
      console.error("Error cargando participaciones:", err);
      Swal.fire("Error", "No se pudieron cargar las participaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Confirmar asistencia con puntos automáticos
  const handleConfirmarAuto = async (p) => {
    const res = await confirmarAsistencia(p.id);
    if (res.status === 200 && res.data.ok) {
      Swal.fire("Éxito", res.data.message, "success");
      loadData();
    } else {
      Swal.fire("Error", res.data.error || "No se pudo confirmar", "error");
    }
  };

  // Asignar o editar puntos manualmente
  const handleConfirmarManual = async (p) => {
    const isEditing = p.asistencia_confirmada;
    const { value: puntos } = await Swal.fire({
      title: isEditing ? "Editar puntos" : "Asignar puntos",
      text: `Voluntario: ${p.nombre || p.email}`,
      input: "number",
      inputValue: p.puntos || 0,
      inputAttributes: { min: 0 },
      showCancelButton: true,
      confirmButtonText: isEditing ? "Actualizar" : "Guardar",
      confirmButtonColor: "#2e7d6b",
    });

    if (puntos === undefined) return;

    const res = await confirmarAsistencia(p.id, Number(puntos));
    if (res.status === 200 && res.data.ok) {
      Swal.fire("Éxito", res.data.message, "success");
      loadData();
    } else {
      Swal.fire("Error", res.data.error || "No se pudo confirmar", "error");
    }
  };

  // 🔍 Filtrado por nombre o email
  const filtered = participaciones.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="window">
      <div className="window-bar">
        <span className="win-dot win-red"></span>
        <span className="win-dot win-amber"></span>
        <span className="win-dot win-green"></span>
        <span className="window-title">Participaciones de Voluntarios</span>
      </div>

      <div className="section">
        {/* 🔍 Barra de búsqueda */}
        <input
          type="text"
          placeholder="Buscar voluntario por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            marginBottom: "12px",
            padding: "8px",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #dbe7e3",
            borderRadius: "8px",
          }}
        />

        {loading ? (
          <p>Cargando…</p>
        ) : filtered.length === 0 ? (
          <p>No se encontraron participaciones.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Voluntario</th>
                  <th>Email</th>
                  <th>Jornada</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Asistencia</th>
                  <th>Puntos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nombre || "-"}</td>
                    <td>{p.email}</td>
                    <td>{p.lugar}</td>
                    <td>{p.tipo}</td>
                    <td>
                      {p.fecha ? new Date(p.fecha).toLocaleDateString() : "-"}
                    </td>
                    <td>{p.asistencia_confirmada ? "✅" : "❌"}</td>
                    <td>{p.puntos}</td>
                    
                    {/* 👇 Bloque de Acciones Actualizado */}
                    <td>
                      {!p.asistencia_confirmada ? (
                        <>
                          <button
                            className="btn-sm"
                            onClick={() => handleConfirmarAuto(p)}
                          >
                            Confirmar (auto)
                          </button>
                          <button
                            className="btn-sm btn-edit"
                            onClick={() => handleConfirmarManual(p)}
                          >
                            Asignar puntos
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{ color: "#10b981", fontWeight: 600, marginRight: "8px" }}>
                            Confirmado
                          </span>
                          <button
                            className="btn-sm btn-edit"
                            onClick={() => handleConfirmarManual(p)}
                          >
                            Editar puntos
                          </button>
                        </>
                      )}
                    </td>
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

export default ParticipacionesAdmin;