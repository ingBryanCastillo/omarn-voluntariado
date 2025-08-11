from flask import Blueprint, jsonify
from db import mysql

roles_bp = Blueprint('roles', __name__)

@roles_bp.route('/api/roles', methods=['GET'])
def listar_roles():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, nombre FROM roles ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    return jsonify([{'id': r[0], 'nombre': r[1]} for r in rows])

@roles_bp.route('/api/roles/<int:id>', methods=['GET'])
def obtener_rol(id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, nombre FROM roles WHERE id=%s", (id,))
    r = cur.fetchone()
    cur.close()
    if not r:
        return jsonify({'mensaje': 'Rol no encontrado'}), 404
    return jsonify({'id': r[0], 'nombre': r[1]})
