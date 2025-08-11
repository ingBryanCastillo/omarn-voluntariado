from flask import Blueprint, request, jsonify
from db import mysql

catalogo_bp = Blueprint('catalogo_jornadas', __name__)

def row_to_dict(row, cols):
    return {cols[i][0]: row[i] for i in range(len(cols))}

@catalogo_bp.route('/api/catalogo-jornadas', methods=['GET'])
def listar_catalogo():
    q = request.args.get('q', '').strip()
    estado = request.args.get('estado', 'activo').strip()  # enum('activo','inactivo')

    where = []
    params = []
    if estado in ('activo', 'inactivo'):
        where.append("estado = %s")
        params.append(estado)
    if q:
        where.append("nombre LIKE %s")
        params.append(f"%{q}%")
    where_sql = " WHERE " + " AND ".join(where) if where else ""

    conn = mysql.connection
    cur = conn.cursor()
    cur.execute(f"""SELECT id, nombre, estado
                    FROM catalogo_jornadas {where_sql}
                    ORDER BY id DESC""", params)
    rows = cur.fetchall()
    data = [row_to_dict(r, cur.description) for r in rows]
    return jsonify(ok=True, data=data)

@catalogo_bp.route('/api/catalogo-jornadas/<int:id>', methods=['GET'])
def detalle_catalogo(id):
    conn = mysql.connection
    cur = conn.cursor()
    cur.execute("""SELECT id, nombre, estado
                   FROM catalogo_jornadas WHERE id=%s""", (id,))
    row = cur.fetchone()
    if not row:
        return jsonify(ok=False, error="No encontrado"), 404
    return jsonify(ok=True, data=row_to_dict(row, cur.description))
