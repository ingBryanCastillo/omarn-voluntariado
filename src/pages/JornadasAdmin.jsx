// src/pages/JornadasAdmin.jsx
import React, { useEffect, useState } from 'react';
import JornadasTable from '../components/JornadasTable';
import JornadaFormModal from '../components/JornadaFormModal';
import { getJornadas, createJornada, updateJornada, cancelJornada } from '../services/jornadasService';
import { deleteJornada } from '../services/jornadasService';
import Swal from 'sweetalert2'; // ✅ Importación agregada

export default function JornadasAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setRows(await getJornadas()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onCreate = () => { setEditing(null); setShowForm(true); };
  const onEdit = (j) => { setEditing(j); setShowForm(true); };

  const onCancelRow = async (j) => {
    if (!window.confirm(`¿Cancelar la jornada #${j.id}?`)) return;
    try { await cancelJornada(j.id); await load(); }
    catch (e) { alert(e.message); }
  };

  // ✅ Función onDeleteRow actualizada con SweetAlert2
  const onDeleteRow = async (j) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: `¿Borrar definitivamente la jornada #${j.id}?`,
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2e7d6b",
      cancelButtonColor: "#d33",
      background: "#fff",
    });
  
    if (result.isConfirmed) {
      try {
        await deleteJornada(j.id);
        await Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: `La jornada #${j.id} fue eliminada correctamente.`,
          confirmButtonColor: "#2e7d6b"
        });
        await load();
      } catch (e) {
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: e.message,
          confirmButtonColor: "#d33"
        });
      }
    }
  };

  const onSubmit = async (payload) => {
    if (editing) await updateJornada(editing.id, payload);
    else await createJornada(payload);
    setShowForm(false); setEditing(null);
    await load();
  };

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h2>Administración de Jornadas</h2>
        <button className="btn" onClick={onCreate}>Nueva jornada</button>
      </div>

      {error && <div className="error" style={{ marginBottom:12 }}>{error}</div>}

      {loading ? <p>Cargando…</p> : (
        <JornadasTable
          rows={rows}
          onEdit={onEdit}
          onCancel={onCancelRow}
          onDelete={onDeleteRow}
        />
      )}

      <JornadaFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={onSubmit}
        initial={editing}
      />
    </div>
  );
}