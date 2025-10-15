import React, { useState } from "react";
import Swal from "sweetalert2";
import { login as apiLogin } from "../services/authService";
import "./LoginFull.css";

export default function LoginFull({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !contrasena.trim()) {
      Swal.fire("Campos vacíos", "Completa todos los campos", "warning");
      return;
    }

    try {
      setLoading(true);
      const success = await apiLogin(email, contrasena);
      if (success) {
        onLoginSuccess(); // ✅ Llama a App para cambiar vista
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Credenciales inválidas", "error");
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
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu_correo@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Entrando..." : "Ingresar"}
          </button>
        </form>

        <p className="register-hint">
  ¿No tienes una cuenta?{" "}
  <button type="button" onClick={() => onLoginSuccess("register")}>
    Regístrate
  </button>
</p>

      </div>
    </div>
  );
}
