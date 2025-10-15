from flask import Blueprint, request, jsonify
from db import get_connection

jornadas_bp = Blueprint('jornadas', __name__)

ALLOWED_ESTADOS = ('pendiente', 'realizada', 'cancelada')


def validar_lat_lng(lat, lng):
    try:
        if lat is None or lng is None:
            return True  # opcional
        lat = float(lat)
        lng = float(lng)
        return -90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0
    except:
        return False


# ======================================================
# GET - Listar con filtros + nombre de catálogo
# ======================================================
@jornadas_bp.route('/api/jornadas', methods=['GET'])
def obtener_jornadas():
    cat_id = request.args.get('catalogo_jornada_id')
    estado = request.args.get('estado')
    f_desde = request.args.get('fecha_desde')
    f_hasta = request.args.get('fecha_hasta')
    q = request.args.get('q', '').strip()

    where, params = [], []
    if cat_id:
        where.append("j.catalogo_jornada_id = %s")
        params.append(cat_id)
    if estado:
        where.append("j.estado = %s")
        params.append(estado)
    if f_desde:
        where.append("j.fecha >= %s")
        params.append(f_desde)
    if f_hasta:
        where.append("j.fecha <= %s")
        params.append(f_hasta)
    if q:
        where.append("(j.lugar LIKE %s OR j.descripcion LIKE %s)")
        params += [f"%{q}%", f"%{q}%"]

    where_sql = " WHERE " + " AND ".join(where) if where else ""

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"""
        SELECT j.id, DATE(j.fecha) AS fecha, j.estado, j.lugar, j.descripcion,
               j.ubicacion_lat, j.ubicacion_lng, j.catalogo_jornada_id,
               c.nombre AS catalogo_nombre
        FROM jornadas j
        LEFT JOIN catalogo_jornadas c ON c.id = j.catalogo_jornada_id
        {where_sql}
        ORDER BY j.fecha DESC, j.id DESC
    """, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "data": rows})


# ======================================================
# GET - Detalle de una jornada
# ======================================================
@jornadas_bp.route('/api/jornadas/<int:id>', methods=['GET'])
def obtener_jornada_por_id(id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT j.id, DATE(j.fecha) AS fecha, j.estado, j.lugar, j.descripcion,
               j.ubicacion_lat, j.ubicacion_lng, j.catalogo_jornada_id,
               c.nombre AS catalogo_nombre
        FROM jornadas j
        LEFT JOIN catalogo_jornadas c ON c.id = j.catalogo_jornada_id
        WHERE j.id=%s
    """, (id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"ok": False, "error": "Jornada no encontrada"}), 404
    return jsonify({"ok": True, "data": row})


# ======================================================
# POST - Crear nueva jornada
# ======================================================
@jornadas_bp.route('/api/jornadas', methods=['POST'])
def crear_jornada():
    body = request.get_json(force=True)
    requeridos = ['fecha', 'lugar', 'descripcion', 'catalogo_jornada_id']
    faltantes = [k for k in requeridos if not (body.get(k) and str(body.get(k)).strip())]
    if faltantes:
        return jsonify({"ok": False, "error": f"Faltan: {', '.join(faltantes)}"}), 400

    fecha = body['fecha']
    lugar = body['lugar'].strip()
    descripcion = body['descripcion'].strip()
    cat_id = int(body['catalogo_jornada_id'])
    estado = body.get('estado', 'pendiente')
    if estado not in ALLOWED_ESTADOS:
        return jsonify({"ok": False, "error": "estado inválido"}), 400

    ubic_lat = body.get('ubicacion_lat')
    ubic_lng = body.get('ubicacion_lng')
    if not validar_lat_lng(ubic_lat, ubic_lng):
        return jsonify({"ok": False, "error": "Coordenadas inválidas"}), 400

    conn = get_connection()
    cur = conn.cursor()

    # validar catálogo existe y está activo
    cur.execute("SELECT 1 FROM catalogo_jornadas WHERE id=%s AND estado='activo'", (cat_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "catalogo_jornada_id no válido o inactivo"}), 400

    cur.execute("""
        INSERT INTO jornadas (fecha, estado, lugar, descripcion,
                              ubicacion_lat, catalogo_jornada_id, ubicacion_lng)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (fecha, estado, lugar, descripcion, ubic_lat, cat_id, ubic_lng))
    conn.commit()
    new_id = cur.lastrowid
    cur.close()
    conn.close()

    return jsonify({"ok": True, "data": {"id": new_id}, "message": "Jornada creada"}), 201


# ======================================================
# PUT - Actualizar jornada
# ======================================================
@jornadas_bp.route('/api/jornadas/<int:id>', methods=['PUT'])
def actualizar_jornada(id):
    body = request.get_json(force=True)
    sets, params = [], []

    def set_(col, val):
        sets.append(f"{col}=%s")
        params.append(val)

    if 'fecha' in body: set_('fecha', body['fecha'])
    if 'lugar' in body: set_('lugar', body['lugar'].strip())
    if 'descripcion' in body: set_('descripcion', body['descripcion'].strip())
    if 'ubicacion_lat' in body or 'ubicacion_lng' in body:
        lat = body.get('ubicacion_lat')
        lng = body.get('ubicacion_lng')
        if not validar_lat_lng(lat, lng):
            return jsonify({"ok": False, "error": "Coordenadas inválidas"}), 400
        if 'ubicacion_lat' in body: set_('ubicacion_lat', lat)
        if 'ubicacion_lng' in body: set_('ubicacion_lng', lng)
    if 'catalogo_jornada_id' in body:
        cat_id = int(body['catalogo_jornada_id'])
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM catalogo_jornadas WHERE id=%s AND estado='activo'", (cat_id,))
        ok = cur.fetchone()
        cur.close()
        conn.close()
        if not ok:
            return jsonify({"ok": False, "error": "catalogo_jornada_id no válido o inactivo"}), 400
        set_('catalogo_jornada_id', cat_id)
    if 'estado' in body:
        if body['estado'] not in ALLOWED_ESTADOS:
            return jsonify({"ok": False, "error": "estado inválido"}), 400
        set_('estado', body['estado'])

    if not sets:
        return jsonify({"ok": False, "error": "Nada para actualizar"}), 400

    params.append(id)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"UPDATE jornadas SET {', '.join(sets)} WHERE id=%s", params)
    conn.commit()
    updated = cur.rowcount
    cur.close()
    conn.close()

    if updated == 0:
        return jsonify({"ok": False, "error": "Jornada no encontrada"}), 404
    return jsonify({"ok": True, "message": "Jornada actualizada"})


# ======================================================
# DELETE jornada (borrado definitivo)
# ======================================================
@jornadas_bp.route('/api/jornadas/<int:id>', methods=['DELETE'])
def eliminar_jornada(id):
    try:
        conn = get_connection()
        cur = conn.cursor()

        # Primero elimina participaciones asociadas (si existen)
        cur.execute("DELETE FROM participaciones WHERE jornada_id = %s", (id,))
        conn.commit()

        # Luego elimina la jornada
        cur.execute("DELETE FROM jornadas WHERE id = %s", (id,))
        conn.commit()

        cur.close()
        conn.close()
        return jsonify({"ok": True, "message": "Jornada eliminada correctamente"}), 200
    except Exception as e:
        print("❌ Error al eliminar jornada:", e)
        return jsonify({"ok": False, "error": str(e)}), 500


# ======================================================
# PUT - Cancelar jornada (soft delete)
# ======================================================
@jornadas_bp.route('/api/jornadas/<int:id>/cancelar', methods=['PUT'])
def cancelar_jornada(id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE jornadas SET estado = %s WHERE id = %s", ("cancelada", id))
    conn.commit()
    updated = cur.rowcount
    cur.close()
    conn.close()

    if updated == 0:
        return jsonify({"ok": False, "error": "Jornada no encontrada"}), 404
    return jsonify({"ok": True, "message": "Jornada cancelada"})
