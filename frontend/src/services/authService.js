// src/services/authService.js
const API = 'http://72.60.173.25';


/* =======================
   REGISTRO DE USUARIOS
======================= */
// src/services/authService.js
export async function registerUser(userData) {
  const res = await fetch(`${API}/api/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: userData.nombre,
      email: userData.email,
      password: userData.contrasena,  // 👈 CAMBIO AQUÍ
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error en el registro");
  return data;
}


/* =======================
   LOGIN DE USUARIOS
======================= */
export async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || "Error en el login");

  saveSession(data.token);
  return data;
}

/* =======================
   SESIÓN Y TOKEN
======================= */
export function saveSession(token) {
  if (token) localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function handleExpiredToken(errorMessage) {
  if (errorMessage && errorMessage.toLowerCase().includes("token expirado")) {
    localStorage.removeItem("token");
    window.location.reload();
  }
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded;
  } catch {
    return null;
  }
}
