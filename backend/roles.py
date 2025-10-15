# backend/roles.py
from flask import Blueprint, jsonify
from db import get_connection

roles_bp = Blueprint('roles', __name__)

@roles_bp.route('/api/roles', methods=['GET'])
def listar_roles():
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, nombre FROM roles ORDER BY id")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@roles_bp.route('/api/roles/<int:id>', methods=['GET'])
def obtener_rol(id):
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, nombre FROM roles WHERE id=%s", (id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return jsonify({'mensaje': 'Rol no encontrado'}), 404
        return jsonify(row), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
