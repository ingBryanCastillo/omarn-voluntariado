import React, { useEffect, useState } from 'react';
import NoticiaFormModal from './components/NoticiaFormModal';
import { getToken, logout } from './services/authService';
import { getJornadas } from './services/jornadasService';
import { getNoticias } from './services/noticiasService';
import { inscribirParticipacion } from './services/participacionesService';
import JornadasAdmin from './pages/JornadasAdmin';
import NoticiasFeed from './components/NoticiasFeed';
import Swal from 'sweetalert2';
import './App.css';
import TopVoluntarios from "./pages/TopVoluntarios";
import ParticipacionesAdmin from "./pages/ParticipacionesAdmin";
import Solicitudes from "./pages/Solicitudes.jsx";
import Contacto from "./pages/Contacto.jsx";
import MensajesAdmin from "./pages/MensajesAdmin.jsx";
import UsuariosAdmin from "./pages/UsuariosAdmin.jsx";
import LoginFull from "./pages/LoginFull";
import RegisterFull from "./pages/RegisterFull";

// 👇 Decodificar token
const decodeToken = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return { ...decoded, id: decoded.usuario_id, rol_id: decoded.rol_id, nombre: decoded.nombre };
  } catch (e)
  {
    console.error("Error al decodificar el token:", e);
    return null;
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("noticias");
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [openNewsForm, setOpenNewsForm] = useState(false);
  const [jornadas, setJornadas] = useState([]);
  const [loadingJ, setLoadingJ] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subTab, setSubTab] = useState("top");

  useEffect(() => {
    const token = getToken();
    if (token) {
      const userData = decodeToken(token);
      if (userData) {
        setUser(userData);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const noticias = await getNoticias();
          setNews(noticias);
        } catch (e) {
          console.error("Error cargando noticias:", e);
        } finally {
          setLoadingNews(false);
        }
      })();
  
      (async () => {
        try {
          const list = await getJornadas({ estado: 'pendiente' });
          setJornadas(list);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingJ(false);
        }
      })();
    }
  }, [user]);
  
  const [authView, setAuthView] = useState("login");
  if (!user) {
    return authView === "login" ? (
      <div className="fade-transition">
        <LoginFull onLoginSuccess={(next) => {
          if (next === "register") setAuthView("register");
          else window.location.reload();
        }} />
      </div>
    ) : (
      <div className="fade-transition">
        <RegisterFull onBack={() => setAuthView("login")} />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setUser(null);
    window.location.reload();
  };

  const handleInscribir = async (j) => {
    if (!user) {
      return;
    }

    try {
      const { status, data } = await inscribirParticipacion(user.id, j.id);

      if (status === 200 && data.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Inscripción exitosa!',
          text: data.message,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d6b'
        });
      } else if (status === 409) {
        Swal.fire({
          icon: 'info',
          title: 'Ya estás inscrito',
          text: data.error,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d6b'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'No se pudo inscribir a la jornada'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo comunicar con el servidor'
      });
    }
  };

  const canSeeAdmin = !!user && user.rol_id === 1;
  // ✅ Línea eliminada
  const canSeeAdminOrWorker = !!user && (user.rol_id === 1 || user.rol_id === 3);
  const canCreateNews = !!user && (user.rol_id === 1 || user.rol_id === 3);
  const claseEstado = (txt) => (txt || '').toLowerCase();

  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <img
            src="/images/logo_omarn.jpg"
            alt="OMARN"
            className="brand-logo"
            height={38}
            width={38}
          />
          <span className="brand-name">OMARN</span>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(true)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`mobile-menu ${menuOpen ? "show" : ""}`}>
          <div className="mobile-overlay" onClick={() => setMenuOpen(false)}></div>
          <div className="mobile-panel left">
            <div className="mobile-header">
              <img src="/images/logo_omarn.jpg" alt="OMARN" />
              <h3>Menú</h3>
            </div>

            <button onClick={() => { setActiveTab("noticias"); setMenuOpen(false); }}>📰 Noticias</button>
            <button onClick={() => { setActiveTab("jornadas"); setMenuOpen(false); }}>🌱 Jornadas</button>
            {canSeeAdminOrWorker && (
              <button onClick={() => { setActiveTab("admin"); setMenuOpen(false); }}>
                🗂️ Administrar Jornadas
              </button>
            )}
            <button onClick={() => { setActiveTab("voluntarios"); setMenuOpen(false); }}>🙋‍♂️ Voluntarios</button>
            {user && (
              <button onClick={() => { setActiveTab("solicitudes"); setMenuOpen(false); }}>📝 Solicitudes</button>
            )}
            <button onClick={() => { setActiveTab("contacto"); setMenuOpen(false); }}>📩 Contacto</button>
            {canSeeAdminOrWorker && (
              <button onClick={() => { setActiveTab("mensajes"); setMenuOpen(false); }}>💬 Mensajes</button>
            )}
            {canSeeAdmin && (
              <button onClick={() => { setActiveTab("usuarios"); setMenuOpen(false); }}>👤 Usuarios</button>
            )}

            <hr />
            <button className="logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
          </div>
        </div>

        <nav className="header-buttons nav-tabs desktop-only">
          <button onClick={() => setActiveTab("noticias")} className={activeTab === "noticias" ? "active" : ""}>Noticias</button>
          <button onClick={() => setActiveTab("jornadas")} className={activeTab === "jornadas" ? "active" : ""}>Jornadas</button>
          {canSeeAdminOrWorker && (
            <button
              onClick={() => setActiveTab("admin")}
              className={activeTab === "admin" ? "active" : ""}
            >
              Administrar Jornadas
            </button>
          )}
          <button
            onClick={() => setActiveTab("voluntarios")}
            className={activeTab === "voluntarios" ? "active" : ""}
          >
            Voluntarios
          </button>
          {user && <button onClick={() => setActiveTab("solicitudes")} className={activeTab === "solicitudes" ? "active" : ""}>Solicitudes</button>}
          <button onClick={() => setActiveTab("contacto")} className={activeTab === "contacto" ? "active" : ""}>Ayuda / Contacto</button>
          {canSeeAdminOrWorker && <button onClick={() => setActiveTab("mensajes")} className={activeTab === "mensajes" ? "active" : ""}>Mensajes</button>}
          {canSeeAdmin && <button onClick={() => setActiveTab("usuarios")} className={activeTab === "usuarios" ? "active" : ""}>Usuarios</button>}
          <span>Hola, {user.nombre}</span>
          <button onClick={handleLogout} className="logout">Cerrar sesión</button>
        </nav>
      </header>

      <main className="hero">
        {activeTab === "noticias" && (
          <div className="window">
            <div className="window-bar">
              <span className="win-dot win-red"></span>
              <span className="win-dot win-amber"></span>
              <span className="win-dot win-green"></span>
              <span className="window-title">Noticias</span>
            </div>
            <div className="section">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <h1 style={{ margin: 0 }}>Jornadas de Voluntariado</h1>
                {canCreateNews && (
                  <button className="btn" onClick={() => setOpenNewsForm(true)}>
                    Nueva noticia
                  </button>
                )}
              </div>
              <p style={{ textAlign: 'center', color: 'var(--muted)' }}>
                Entérate de las últimas noticias, anuncios y reportes.
              </p>
              <NoticiasFeed items={news} loading={loadingNews} user={user} />
            </div>
          </div>
        )}

        {activeTab === "jornadas" && (
          <div className="window">
            <div className="window-bar">
              <span className="win-dot win-red"></span>
              <span className="win-dot win-amber"></span>
              <span className="win-dot win-green"></span>
              <span className="window-title">Inscribirme a una jornada</span>
            </div>
            <div className="section">
              {loadingJ ? (
                <p style={{ textAlign: 'center' }}>Cargando jornadas…</p>
              ) : jornadas.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No hay jornadas por ahora.</p>
              ) : (
                <div className="jornadas-grid">
                  {jornadas.map((j) => (
                    <article key={j.id} className="jornada-card">
                      <div className="jornada-header">
                        <span className={`jornada-badge ${claseEstado(j.estado)}`}>
                          {claseEstado(j.estado)}
                        </span>
                      </div>
                      <h3>{j.lugar}</h3>
                      <p style={{ color: 'var(--muted)' }}>
                        {j.descripcion?.length > 120
                          ? j.descripcion.slice(0, 120) + '…'
                          : j.descripcion}
                      </p>
                      {j.ubicacion_lat && j.ubicacion_lng && (
                        <p style={{ margin: '8px 0' }}>
                          <a
                            href={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.2739340{j.ubicacion_lat},${j.ubicacion_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1d4ed8', textDecoration: 'underline' }}
                          >
                            Ver ubicación en Google Maps
                          </a>
                        </p>
                      )}
                      <button onClick={() => handleInscribir(j)} className="btn-inscribirme">
                        Inscribirme
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "solicitudes" && user && <Solicitudes />}
        
        {activeTab === "admin" && canSeeAdminOrWorker && (
          <div className="section" style={{ padding: "2rem" }}>
            <JornadasAdmin />
          </div>
        )}
        
        {activeTab === "contacto" && <Contacto />}
        {activeTab === "mensajes" && canSeeAdminOrWorker && <MensajesAdmin />}
        {activeTab === "usuarios" && canSeeAdmin && <UsuariosAdmin />}

        {activeTab === "voluntarios" && (
          <div className="window">
            <div className="window-bar">
              <span className="win-dot win-red"></span>
              <span className="win-dot win-amber"></span>
              <span className="win-dot win-green"></span>
              <span className="window-title">Gestión de Voluntarios</span>
            </div>

            <div className="section">
              <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginBottom: "20px",
                flexWrap: "wrap"
              }}>
                <button
                  className={`btn ${subTab === "top" ? "" : "outline"}`}
                  onClick={() => setSubTab("top")}
                >
                  🏆 Top Voluntarios
                </button>

                {canSeeAdminOrWorker && (
                  <button
                    className={`btn ${subTab === "inscritos" ? "" : "outline"}`}
                    onClick={() => setSubTab("inscritos")}
                  >
                    👥 Voluntarios Inscritos
                  </button>
                )}
              </div>

              {subTab === "top" && <TopVoluntarios />}
              {subTab === "inscritos" && canSeeAdminOrWorker && <ParticipacionesAdmin />}
            </div>
          </div>
        )}
      </main>
      
      <NoticiaFormModal
        open={openNewsForm}
        onClose={() => setOpenNewsForm(false)}
        onCreated={async () => {
          setOpenNewsForm(false);
          setLoadingNews(true);
          try {
            const noticias = await getNoticias();
            setNews(noticias);
          } finally {
            setLoadingNews(false);
          }
        }}
      />
    </div>
  );
}

export default App;