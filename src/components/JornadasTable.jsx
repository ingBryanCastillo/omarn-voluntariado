// src/components/JornadasTable.jsx
import React from 'react';

export default function JornadasTable({ rows = [], onEdit, onCancel, onDelete }) {
  const fmt = (f) => { try { return new Date(f).toUTCString(); } catch { return f; } };
  const isCancelada = (e) => (e || '').toLowerCase() === 'cancelada';

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Lugar</th>
            <th>Tipo</th>
            <th width="1%">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign:'center' }}>Sin registros</td></tr>
          ) : rows.map(j => (
            <tr key={j.id}>
              <td>{j.id}</td>
              <td>{fmt(j.fecha)}</td>
              <td style={{ textTransform:'capitalize' }}>{j.estado}</td>
              <td>{j.lugar}</td>
              <td>{j.catalogo_nombre || `#${j.catalogo_jornada_id}`}</td>
              <td style={{ whiteSpace:'nowrap' }}>
                <button className="btn-sm" onClick={() => onEdit(j)}>Editar</button>
                <button
                  className="btn-sm danger"
                  onClick={() => onCancel(j)}
                  disabled={isCancelada(j.estado)}
                  title={isCancelada(j.estado) ? 'Ya cancelada' : 'Cancelar'}
                >
                  Cancelar
                </button>
                <button
                  className="btn-sm"
                  onClick={() => onDelete(j)}
                  title="Borrar definitivamente"
                  style={{ background:'#555' }}
                >
                  🗑️ Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
