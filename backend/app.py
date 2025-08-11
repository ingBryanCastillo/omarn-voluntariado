from flask import Flask, jsonify
from db import mysql  # <- importás desde db.py
import config
from auth import auth_bp
from flask_cors import CORS  # <- Importamos CORS

app = Flask(__name__)
app.register_blueprint(auth_bp)


# Habilitamos CORS para toda la aplicación
CORS(app)

# Configurar conexión
app.config['MYSQL_HOST'] = config.MYSQL_HOST
app.config['MYSQL_USER'] = config.MYSQL_USER
app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
app.config['MYSQL_DB'] = config.MYSQL_DB

mysql.init_app(app)  # <- inicializás la conexión

# Registrar los Blueprints
from usuarios import usuarios_bp
app.register_blueprint(usuarios_bp)

from jornadas import jornadas_bp
app.register_blueprint(jornadas_bp)

from noticias import noticias_bp
app.register_blueprint(noticias_bp)

from personas import personas_bp
app.register_blueprint(personas_bp)

from roles import roles_bp
app.register_blueprint(roles_bp)

from catalogo_jornadas import catalogo_bp
app.register_blueprint(catalogo_bp)


if __name__ == '__main__':
    app.run(debug=True)
