import React, { useEffect, useState } from 'react';
import { getCatalogoJornadas } from '../services/catalogoService';

export default function JornadaFormModal({ open, onClose, onSubmit, initial }) {
  const [catalogo, setCatalogo] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [catError, setCatError] = useState('');

  const [form, setForm] = useState({
    fecha: '',
    lugar: '',
    descripcion: '',
    catalogo_jornada_id: '',
    estado: 'pendiente',
    ubicacion_lat: '',
    ubicacion_lng: ''
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoadingCat(true); setCatError('');
    (async () => {
      try {
        const items = await getCatalogoJornadas();
        setCatalogo(items);
      } catch (e) {
        setCatError('No se pudo cargar el catálogo.');
      } finally {
        setLoadingCat(false);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setForm({
      fecha: initial?.fecha || '',
      lugar: initial?.lugar || '',
      descripcion: initial?.descripcion || '',
      catalogo_jornada_id: initial?.catalogo_jornada_id || '',
      estado: initial?.estado || 'pendiente',
      ubicacion_lat: initial?.ubicacion_lat ?? '',
      ubicacion_lng: initial?.ubicacion_lng ?? ''
    });
  }, [open, initial]);

  if (!open) return null;

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const payload = {
        fecha: form.fecha,
        lugar: form.lugar,
        descripcion: form.descripcion,
        catalogo_jornada_id: Number(form.catalogo_jornada_id),
        estado: form.estado,
        ubicacion_lat: form.ubicacion_lat ? Number(form.ubicacion_lat) : null,
        ubicacion_lng: form.ubicacion_lng ? Number(form.ubicacion_lng) : null
      };
      await onSubmit?.(payload);
      onClose?.();
    } catch (e2) {
      setErr(e2.message || 'Error al guardar');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <h3 style={{marginTop:0}}>{initial ? 'Editar jornada' : 'Nueva jornada'}</h3>

        <form onSubmit={submit} className="form" style={{boxShadow:'none', padding:0}}>
          <div className="row">
            <label>Fecha</label>
            <input type="date" name="fecha" value={form.fecha} onChange={change} required />
          </div>

          <div className="row">
            <label>Lugar</label>
            <input name="lugar" value={form.lugar} onChange={change} required />
          </div>

          <div className="row">
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={change} required />
          </div>

          <div className="row two">
            <div>
              <label>Tipo (catálogo)</label>
              <select
                name="catalogo_jornada_id"
                value={form.catalogo_jornada_id}
                onChange={change}
                required
                disabled={loadingCat || !!catError || catalogo.length === 0}
              >
                <option value="">{loadingCat ? 'Cargando…' : '-- Selecciona --'}</option>
                {catalogo
                  .filter(c => c.estado === 'activo') // 👈 SOLO activos
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
              </select>
              {catError && <small className="error">{catError}</small>}
              {!loadingCat && !catError && catalogo.length === 0 && (
                <small className="error">No hay tipos activos en el catálogo.</small>
              )}
            </div>
            <div>
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={change}>
                <option value="pendiente">Pendiente</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="row two">
            <div>
              <label>Latitud (opcional)</label>
              <input name="ubicacion_lat" value={form.ubicacion_lat} onChange={change} placeholder="15.31" />
            </div>
            <div>
              <label>Longitud (opcional)</label>
              <input name="ubicacion_lng" value={form.ubicacion_lng} onChange={change} placeholder="-91.47" />
            </div>
          </div>

          {err && <div className="error">{err}</div>}

          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:6}}>
            <button type="button" className="btn outline" onClick={onClose}>Cerrar</button>
            <button className="btn" disabled={loading || loadingCat || catalogo.length === 0}>
              {loading ? 'Guardando…' : (initial ? 'Guardar cambios' : 'Crear jornada')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
