import React, { useState } from "react";
import Swal from "sweetalert2";
import { registerUser } from "../services/authService";
import "./LoginFull.css";

export default function RegisterFull({ onBack }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    contrasena: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.contrasena) {
      Swal.fire("Campos vacíos", "Completa todos los campos", "warning");
      return;
    }

    try {
      setLoading(true);
      await registerUser(form);
      Swal.fire("Éxito", "Tu cuenta fue creada correctamente", "success");
      onBack();
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo registrar el usuario", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginfull-container">
      <div className="banner-area">
        <img src="/images/banner_omarn.png" alt="Banner OMARN" className="banner-img" />
        <div className="banner-overlay"></div>
        <div className="logos">
          <img src="/images/logo_muni.png" alt="Municipalidad" className="logo" />
          <img src="/images/logo_omarn.jpg" alt="OMARN" className="logo" />
        </div>
      </div>

      <div className="login-box">
        <h2>Crear cuenta</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu_correo@ejemplo.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="********"
              required
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Creando..." : "Registrarme"}
          </button>
        </form>
        <p className="register-hint">
          ¿Ya tienes cuenta?{" "}
          <button type="button" onClick={onBack}>
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
