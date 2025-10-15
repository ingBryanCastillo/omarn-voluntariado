from flask import Blueprint, request, jsonify
from db import get_connection
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    from app import app, bcrypt

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        conn = get_connection()
        cur = conn.cursor()
        # ✅ Se agregó 'estado' a la consulta
        cur.execute("SELECT id, nombre, password, rol_id, estado FROM usuarios WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404

        if bcrypt.check_password_hash(user['password'], password):
            # ✅ Bloque agregado para verificar si el usuario está activo
            if user['estado'] != 'activo':
                return jsonify({'mensaje': 'Tu cuenta está inactiva. Contacta al administrador.'}), 403

            payload = {
                'usuario_id': user['id'],
                'rol_id': user['rol_id'],
                'nombre': user['nombre'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
            return jsonify({'token': token}), 200
        else:
            return jsonify({'mensaje': 'Contraseña incorrecta'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500