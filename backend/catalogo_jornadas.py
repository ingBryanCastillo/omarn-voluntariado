# catalogo_jornadas.py
from flask import Blueprint, request, jsonify
from db import get_connection
import pymysql.cursors   # 👈 necesario para usar DictCursor

catalogo_bp = Blueprint('catalogo_jornadas', __name__)

@catalogo_bp.route('/api/catalogo_jornadas', methods=['GET'])
def listar_catalogo():
    estado = request.args.get('estado')  # 'activo' / 'inactivo' / None
    where, params = [], []
    if estado:
        where.append("estado = %s")
        params.append(estado)
    where_sql = (" WHERE " + " AND ".join(where)) if where else ""

    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)  # 👈 aquí el cambio

    cur.execute(
        f"SELECT id, nombre, estado FROM catalogo_jornadas{where_sql} ORDER BY nombre ASC",
        params
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"ok": True, "data": rows})
