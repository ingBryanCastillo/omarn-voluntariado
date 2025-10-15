from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from scheduler import iniciar_cron
# --- 1. Creación e Inicialización ---
app = Flask(__name__)
bcrypt = Bcrypt(app)

# --- 2. Configuración ---
app.config['SECRET_KEY'] = 'esta-es-una-clave-muy-secreta'

# --- 3. Inicializar extensiones ---
CORS(app)

iniciar_cron()

# --- 4. Registro de Blueprints ---
from auth import auth_bp
from usuarios import usuarios_bp
from jornadas import jornadas_bp
from catalogo_jornadas import catalogo_bp
from noticias_routes import noticias_bp
from participaciones import participaciones_bp
from solicitudes import solicitudes_bp
from contacto_routes import contacto_bp


app.register_blueprint(contacto_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(usuarios_bp)
app.register_blueprint(jornadas_bp)
app.register_blueprint(noticias_bp)
app.register_blueprint(catalogo_bp)
app.register_blueprint(participaciones_bp)
app.register_blueprint(solicitudes_bp)


# --- 5. Punto de entrada ---
if __name__ == '__main__':
    app.run(debug=True)
