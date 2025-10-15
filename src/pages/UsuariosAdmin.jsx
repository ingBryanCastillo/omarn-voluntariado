import React, { useEffect, useState } from "react";
import { getToken, logout } from "../services/authService";
import Swal from "sweetalert2";

const API = "http://127.0.0.1:5000";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // 🔍 filtro de búsqueda
  const [filtered, setFiltered] = useState([]); // lista filtrada

  const token = getToken();

  const handleExpiredToken = (errorMsg) => {
    const msg = (errorMsg || "").toLowerCase();
    if (
      msg.includes("expirado") ||
      msg.includes("vencido") ||
      msg.includes("token has expired")
    ) {
      Swal.fire({
        title: "Sesión Expirada",
        text: "Tu sesión ha terminado. Por favor, inicia sesión de nuevo.",
        icon: "warning",
        confirmButtonText: "Aceptar",
      }).then(() => {
        logout();
        window.location.reload();
      });
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API}/api/usuarios`);
      const data = await res.json();
      setUsuarios(data);
      setFiltered(data); // 👈 iniciar lista filtrada
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API}/api/roles`);
      if (!res.ok) throw new Error("No se pudo cargar roles");
      const data = await res.json();
      setRoles(data);
    } catch (e) {
      setRoles([
        { id: 1, nombre: "Admin" },
        { id: 2, nombre: "Voluntario" },
        { id: 3, nombre: "Trabajador" },
      ]);
    }
  };

  const cambiarRol = async (userId, nuevoRol) => {
    try {
      const res = await fetch(`${API}/api/usuarios/${userId}/rol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rol_id: nuevoRol }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || "No se pudo actualizar el rol";
        Swal.fire("Error", errorMsg, "error");
        handleExpiredToken(errorMsg);
      } else {
        Swal.fire("Éxito", "Rol actualizado correctamente", "success");
        fetchUsuarios();
      }
    } catch (err) {
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    }
  };

  const cambiarEstado = async (userId, nuevoEstado) => {
    try {
      const res = await fetch(`${API}/api/usuarios/${userId}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || "No se pudo actualizar el estado";
        Swal.fire("Error", errorMsg, "error");
        handleExpiredToken(errorMsg);
      } else {
        Swal.fire("Éxito", "Estado actualizado correctamente", "success");
        fetchUsuarios();
      }
    } catch (err) {
      Swal.fire("Error", "Error de conexión con el servidor", "error");
    }
  };

  const mostrarSelectorRol = async (userId, rolActual) => {
    const inputOptions = roles.reduce((acc, r) => {
      acc[r.id] = r.nombre;
      return acc;
    }, {});

    const { value: nuevoRol } = await Swal.fire({
      title: "Selecciona el nuevo rol",
      input: "select",
      inputOptions,
      inputValue: String(rolActual),
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      background: "#ffffff",
      color: "#1f2937",
      customClass: {
        popup: "swal-omarn-popup",
        title: "swal-omarn-title",
        confirmButton: "swal-omarn-confirm",
        cancelButton: "swal-omarn-cancel",
        input: "swal-omarn-select",
      },
      buttonsStyling: false,
    });

    if (nuevoRol) {
      await cambiarRol(userId, parseInt(nuevoRol, 10));
    }
  };

  // 🔍 Filtro en tiempo real
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    if (!value.trim()) {
      setFiltered(usuarios);
    } else {
      const filtrados = usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(value) ||
          u.email.toLowerCase().includes(value)
      );
      setFiltered(filtrados);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="window">
      <div className="window-bar">
        <span className="win-dot win-red"></span>
        <span className="win-dot win-amber"></span>
        <span className="win-dot win-green"></span>
        <span className="window-title">Gestión de Usuarios</span>
      </div>

      <div className="section">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Usuarios registrados
        </h2>

        {/* 🔍 Buscador centrado */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Buscar usuario por nombre o email..."
            value={search}
            onChange={handleSearch}
            style={{
              width: "60%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cddbd5",
              outline: "none",
              fontSize: "14px",
              boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
            }}
          />
        </div>

        <table className="styled-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>
                    <button
                      className="btn-sm"
                      onClick={() => mostrarSelectorRol(u.id, u.rol_id)}
                    >
                      Cambiar rol
                    </button>
                  </td>
                  <td>{u.estado}</td>
                  <td>
                    <button
                      className={`btn-sm ${
                        u.estado === "activo" ? "danger" : ""
                      }`}
                      onClick={() =>
                        cambiarEstado(
                          u.id,
                          u.estado === "activo" ? "inactivo" : "activo"
                        )
                      }
                    >
                      {u.estado === "activo" ? "Desactivar" : "Activar"}
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        Swal.fire(
                          "En construcción",
                          "Aquí irá eliminar usuario",
                          "info"
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
