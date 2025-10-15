from functools import wraps
from flask import request, jsonify, g, current_app
from db import get_connection
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"ok": False, "error": "Token faltante"}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            conn = get_connection()
            cur = conn.cursor()
            cur.execute("SELECT id, nombre, email, rol_id FROM usuarios WHERE id = %s", (data['usuario_id'],))
            user = cur.fetchone()
            cur.close()
            conn.close()

            if not user:
                return jsonify({"ok": False, "error": "Usuario inválido"}), 401

            g.usuario = user

        except jwt.ExpiredSignatureError:
            return jsonify({"ok": False, "error": "Token expirado"}), 401
        except Exception as e:
            return jsonify({"ok": False, "error": f"Token inválido: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated
