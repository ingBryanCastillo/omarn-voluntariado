import React, { useState } from "react";
import { enviarMensajeContacto } from "../services/contactoService";
import Swal from "sweetalert2";

export default function Contacto() {
  const [form, setForm] = useState({ nombre: "", correo: "", mensaje: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await enviarMensajeContacto(form);
      setLoading(false);

      if (res.ok) {
        Swal.fire(
          "Enviado ✅",
          "Tu mensaje fue enviado correctamente. Recibirás una respuesta por correo electrónico en un plazo máximo de 48 horas.",
          "success"
        );
        setForm({ nombre: "", correo: "", mensaje: "" });
      } else {
        Swal.fire("Error", res.error || "No se pudo enviar el mensaje", "error");
      }
    } catch (err) {
      setLoading(false);
      Swal.fire("Error", "No se pudo comunicar con el servidor", "error");
    }
  };

  return (
    <div className="window">
      <div className="window-bar">
        <span className="win-dot win-red"></span>
        <span className="win-dot win-amber"></span>
        <span className="win-dot win-green"></span>
        <span className="window-title">Ayuda / Contacto</span>
      </div>

      <div className="section contacto-section">

        {/* 🔹 ENCABEZADO */}
        <div className="banner">
          <img src="/images/logo_muni.png" alt="Municipalidad" className="logo" />
          <img src="/images/logo_omarn.jpg" alt="OMARN" className="logo" />
          <h1>Oficina Municipal de Ambiente y Recursos Naturales (OMARN)</h1>
          <p>Huehuetenango, Guatemala</p>
        </div>

        {/* 🔹 QUIÉNES SOMOS */}
        <h2>Quiénes Somos</h2>
        <p>
          La <strong>Oficina Municipal de Ambiente y Recursos Naturales (OMARN)</strong> es una dependencia especializada de la Municipalidad de Huehuetenango, cuya finalidad es coordinar, ejecutar y supervisar las políticas ambientales locales, en concordancia con la legislación nacional vigente y los planes de desarrollo municipal. Esta unidad representa el brazo técnico y administrativo en materia de medio ambiente dentro del gobierno municipal y se encarga de articular esfuerzos interinstitucionales, comunitarios y académicos para la conservación de los recursos naturales del municipio.
        </p>

        {/* 🔹 MISIÓN Y VISIÓN */}
        <h2>Misión</h2>
        <p>
          Realizar actividades que vengan en pro de la conservación y el mejoramiento de los recursos naturales, coordinadas con organizaciones gubernamentales, no gubernamentales, organismos internacionales, COCODES y demás actores relacionados con el entorno ambiental del municipio de Huehuetenango.
        </p>

        <h2>Visión</h2>
        <p>
          Ser una dependencia municipal que vela por la conservación, protección y manejo adecuado de los recursos naturales que se encuentran dentro de la jurisdicción del municipio de Huehuetenango.
        </p>

        {/* 🔹 PREGUNTAS FRECUENTES */}
        <h2 style={{ marginTop: 40 }}>Preguntas Frecuentes</h2>
        <div className="faq">

          <details>
            <summary>¿Qué necesito para solicitar una certificación forestal?</summary>
            <ul>
              <li>1 fotocopia de escritura</li>
              <li>1 fotocopia de DPI</li>
              <li>1 copia de boleto de ornato</li>
              <li>1 copia de solvencia municipal</li>
            </ul>
          </details>

          <details>
            <summary>¿Qué necesito para tramitar una resolución de consumo familiar? (Permiso para corte de arboles)</summary>
            <ul>
              <li>1 copia de escritura</li>
              <li>1 copia de DPI</li>
              <li>1 copia de boleto de ornato</li>
              <li>1 copia de solvencia municipal</li>
              <li>Pago dependiendo la especie</li>
              <li>Pago de árboles</li>
              <li>Inspección de campo</li>
            </ul>
          </details>

          <details>
            <summary>¿Qué se requiere para presentar una denuncia ambiental?</summary>
            <ul>
              <li>Solicitud dirigida al Alcalde Municipal con copia a la Oficina de Ambiente.</li>
            </ul>
          </details>

          <details>
            <summary>¿Dónde se encuentra ubicada la Oficina Municipal de Ambiente y Recursos Naturales (OMARN)?</summary>
            <p>6ta calle, 8va avenida, interior antiguo hospital, Huehuetenango.</p>
          </details>

          <details>
            <summary>¿Cuál es el número de teléfono de contacto?</summary>
            <p>Puedes comunicarte al <strong>5763-2531</strong> en horario de oficina.</p>
          </details>
        </div>

        {/* 🔹 FORMULARIO DE CONTACTO */}
        <h2 style={{ marginTop: 40 }}>Contáctanos</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="row">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="row">
            <label>Correo</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
          </div>
          <div className="row">
            <label>Mensaje</label>
            <textarea name="mensaje" rows="4" value={form.mensaje} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>

        {/* 🔹 MAPA */}
        <section style={{ marginTop: 50 }}>
          <h2>Ubicación</h2>
          <p>
            Oficina Municipal de Ambiente y Recursos Naturales (OMARN) <br />
            6ta calle, 8va avenida, interior antiguo hospital, Huehuetenango.
          </p>
          <iframe
            title="Mapa de Ubicación"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1831.3473394787868!2d-91.47357084022315!3d15.317661388186307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x858c142f88eaaaab%3A0xddb9d5ffc320a38b!2sAntiguo%20Hospital!5e1!3m2!1ses!2sgt!4v1760321960156!5m2!1ses!2sgt"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "12px" }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </section>
      </div>
    </div>
  );
}
