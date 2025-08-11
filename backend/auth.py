# backend/auth.py
from flask import Blueprint, request, jsonify
from db import mysql

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    datos = request.get_json() or {}
    email = datos.get('email')
    password = datos.get('password')

    if not email or not password:
        return jsonify({'mensaje': 'Email y password son obligatorios'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT id, nombre, email, password, rol_id, estado FROM usuarios WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()

    if not row:
        return jsonify({'mensaje': 'Usuario no existe'}), 404

    # por ahora comparamos tal cual (plaintext). Luego lo cambiamos a hash.
    if row[3] != password:
        return jsonify({'mensaje': 'Credenciales inválidas'}), 401

    usuario = {
        'id': row[0],
        'nombre': row[1],
        'email': row[2],
        'rol_id': row[4],
        'estado': row[5],
    }
    return jsonify({'mensaje': 'Login exitoso', 'usuario': usuario}), 200
