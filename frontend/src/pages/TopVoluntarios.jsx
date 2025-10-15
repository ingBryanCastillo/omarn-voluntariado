import React, { useEffect, useState } from "react";
import { getTopVoluntarios } from "../services/topVoluntariosService";

function TopVoluntarios() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getTopVoluntarios();
      setRanking(data);
      setLoading(false);
    })();
  }, []);

  const getMedalla = (idx) => {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    if (idx === 2) return "🥉";
    return "🎖️";
  };

  return (
    <div className="window">
      <div className="window-bar">
        <span className="win-dot win-red"></span>
        <span className="win-dot win-amber"></span>
        <span className="win-dot win-green"></span>
        <span className="window-title">Top Voluntarios</span>
      </div>
      <div className="section">
        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando ranking…</p>
        ) : ranking.length === 0 ? (
          <p style={{ textAlign: "center" }}>Aún no hay voluntarios con puntos.</p>
        ) : (
          // ✅ Contenedor y clase de tabla actualizados
          <div className="top-voluntarios-wrap">
            <table className="top-voluntarios-table">
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((v, idx) => (
                  <tr key={v.usuario_id} className={idx < 3 ? "top-rank" : ""}>
                    <td style={{ fontSize: "20px" }}>{getMedalla(idx)}</td>
                    <td>{v.nombre}</td>
                    <td>{v.email}</td>
                    <td style={{ fontWeight: "bold" }}>{v.total_puntos}</td>
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

export default TopVoluntarios;