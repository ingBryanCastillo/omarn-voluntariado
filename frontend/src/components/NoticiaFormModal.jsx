import React, { useState, useEffect } from "react";
import { createNoticia, updateNoticia, uploadNoticiaFile } from "../services/noticiasService";

export default function NoticiaFormModal({ 
  open, 
  onClose, 
  onCreated, 
  onUpdated, 
  noticia // 👈 si se pasa, se entra en modo edición
}) {
  const [form, setForm] = useState({ titulo: "", contenido: "", imagen_url: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (noticia) {
      // precargar datos para edición
      setForm({
        titulo: noticia.titulo || "",
        contenido: noticia.contenido || "",
        imagen_url: noticia.imagen_url || "",
      });
    } else {
      setForm({ titulo: "", contenido: "", imagen_url: "" });
    }
  }, [noticia]);

  if (!open) return null;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (!form.titulo.trim() || !form.contenido.trim()) {
        setErr("Título y contenido son obligatorios");
        setLoading(false);
        return;
      }

      let imagen_url = form.imagen_url?.trim() || null;
      if (file) {
        imagen_url = await uploadNoticiaFile(file);
      }

      if (noticia) {
        // ✏️ modo edición
        await updateNoticia(noticia.id, {
          titulo: form.titulo,
          contenido: form.contenido,
          imagen_url,
        });
        onUpdated?.(); // refresca lista
      } else {
        // 🆕 modo creación
        await createNoticia({
          titulo: form.titulo,
          contenido: form.contenido,
          imagen_url,
        });
        onCreated?.();
      }

      setForm({ titulo: "", contenido: "", imagen_url: "" });
      setFile(null);
      onClose?.();
    } catch (ex) {
      console.error("❌ Error guardando noticia:", ex);
      setErr(ex.message || "Error al guardar la noticia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>
          {noticia ? "Editar noticia" : "Nueva noticia"}
        </h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="row">
            <label>Título</label>
            <input
              name="titulo"
              value={form.titulo}
              onChange={onChange}
              required
            />
          </div>
          <div className="row">
            <label>Contenido</label>
            <textarea
              name="contenido"
              value={form.contenido}
              onChange={onChange}
              required
              rows={5}
            />
          </div>
          <div className="row">
            <label>Imagen (opcional)</label>
            <input
              type="url"
              name="imagen_url"
              placeholder="https://..."
              value={form.imagen_url}
              onChange={onChange}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                o sube un archivo:
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {err && <div className="error">{err}</div>}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              className="btn outline"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Guardando…" : noticia ? "Guardar cambios" : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
