// src/components/CreateJornadaForm.jsx
import React, { useEffect, useState } from 'react';
import { createJornada } from '../services/jornadasService';
import { getCatalogoJornadas } from '../services/catalogoService';

export default function CreateJornadaForm({ onCreated }) {
  const [catalogo, setCatalogo] = useState([]);
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
    (async () => {
      try {
        const items = await getCatalogoJornadas();
        setCatalogo(items);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
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
      await createJornada(payload);
      setForm({
        fecha: '',
        lugar: '',
        descripcion: '',
        catalogo_jornada_id: '',
        estado: 'pendiente',
        ubicacion_lat: '',
        ubicacion_lng: ''
      });
      onCreated?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <h3>Crear jornada (demo)</h3>

      <div className="row">
        <label>Fecha</label>
        <input type="date" name="fecha" value={form.fecha} onChange={onChange} required />
      </div>

      <div className="row">
        <label>Lugar</label>
        <input name="lugar" value={form.lugar} onChange={onChange} placeholder="Parque Central" required />
      </div>

      <div className="row">
        <label>Descripción</label>
        <textarea name="descripcion" value={form.descripcion} onChange={onChange} placeholder="Breve detalle de la actividad" required />
      </div>

      <div className="row">
        <label>Tipo (catálogo)</label>
        <select name="catalogo_jornada_id" value={form.catalogo_jornada_id} onChange={onChange} required>
          <option value="">-- Selecciona --</option>
          {catalogo.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="row two">
        <div>
          <label>Latitud (opcional)</label>
          <input name="ubicacion_lat" value={form.ubicacion_lat} onChange={onChange} placeholder="15.31" />
        </div>
        <div>
          <label>Longitud (opcional)</label>
          <input name="ubicacion_lng" value={form.ubicacion_lng} onChange={onChange} placeholder="-91.47" />
        </div>
      </div>

      {!!err && <div className="error">{err}</div>}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Creando…' : 'Crear jornada'}
      </button>
    </form>
  );
}
