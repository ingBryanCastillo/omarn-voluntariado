import os
from flask import Blueprint, request, jsonify, g # ✅ 'g' importado
from werkzeug.utils import secure_filename
from db import get_connection
from decorators import token_required # ✅ decorador importado

solicitudes_bp = Blueprint('solicitudes', __name__)

UPLOAD_DIR = "static/uploads/solicitudes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ... (rutas 'solicitudes_por_usuario' y 'crear_solicitud' sin cambios)
# ======================================================
# 1. Listar solicitudes de un usuario específico
# ======================================================
@solicitudes_bp.route('/api/solicitudes/usuario/<int:usuario_id>', methods=['GET'])
def solicitudes_por_usuario(usuario_id):
    # ... (código sin cambios)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT s.id, s.descripcion, DATE(s.fecha_solicitud) AS fecha_solicitud,
               s.estado, s.catalogo_jornada_id, s.archivo, c.nombre AS tipo
        FROM solicitudes s
        JOIN catalogo_jornadas c ON c.id = s.catalogo_jornada_id
        WHERE s.usuario_id = %s
        ORDER BY s.fecha_solicitud DESC, s.id DESC
    """, (usuario_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "data": rows}), 200

# ======================================================
# 2. Crear nueva solicitud (con archivo opcional)
# ======================================================
@solicitudes_bp.route('/api/solicitudes', methods=['POST'])
def crear_solicitud():
    # ... (código sin cambios)
    usuario_id = request.form.get("usuario_id")
    catalogo_jornada_id = request.form.get("catalogo_jornada_id")
    descripcion = request.form.get("descripcion", "")
    archivo = request.files.get("archivo")

    if not usuario_id or not catalogo_jornada_id:
        return jsonify({"ok": False, "error": "usuario_id y catalogo_jornada_id requeridos"}), 400

    archivo_nombre = None
    if archivo:
        archivo_nombre = secure_filename(archivo.filename)
        archivo.save(os.path.join(UPLOAD_DIR, archivo_nombre))

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, nombre, estado FROM catalogo_jornadas WHERE id=%s", (catalogo_jornada_id,))
    cat = cur.fetchone()
    if not cat:
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "Tipo de jornada no encontrado"}), 404
    if cat["estado"] != "activo":
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "El tipo seleccionado no está activo"}), 400

    cur.execute("""
        INSERT INTO solicitudes (usuario_id, catalogo_jornada_id, descripcion, fecha_solicitud, estado, archivo)
        VALUES (%s, %s, %s, CURDATE(), 'pendiente', %s)
    """, (usuario_id, catalogo_jornada_id, descripcion, archivo_nombre))
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"ok": True, "message": f"Solicitud creada para '{cat['nombre']}'"}), 201

# ======================================================
# 3. Listar todas las solicitudes (admin o filtrado para voluntario)
# ======================================================
@solicitudes_bp.route('/api/solicitudes', methods=['GET'])
@token_required # ✅ Ruta protegida
def listar_solicitudes():
    user = g.usuario # ✅ Obtenemos el usuario del token
    conn = get_connection()
    cur = conn.cursor()
    
    # ✅ Query base
    query = """
        SELECT s.id, s.usuario_id, u.nombre, u.email,
               s.descripcion, DATE(s.fecha_solicitud) AS fecha_solicitud,
               s.estado, s.catalogo_jornada_id, s.archivo, c.nombre AS tipo
        FROM solicitudes s
        JOIN usuarios u ON u.id = s.usuario_id
        JOIN catalogo_jornadas c ON c.id = s.catalogo_jornada_id
    """
    params = []

    # ✅ Si es voluntario, filtramos por su ID
    if user["rol_id"] == 2:
        query += " WHERE s.usuario_id = %s"
        params.append(user['id'])

    query += " ORDER BY s.fecha_solicitud DESC, s.id DESC"
    
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "data": rows}), 200

# ... (el resto de las rutas no necesitan cambios)
# ======================================================
# 4. Actualizar estado de una solicitud
# ======================================================
@solicitudes_bp.route('/api/solicitudes/<int:id>/estado', methods=['PUT'])
def actualizar_estado(id):
    # ... (código sin cambios)
    body = request.get_json(force=True)
    nuevo_estado = body.get("estado")

    if nuevo_estado not in ["pendiente", "aprobada", "rechazada"]:
        return jsonify({"ok": False, "error": "Estado inválido"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE solicitudes SET estado=%s WHERE id=%s", (nuevo_estado, id))
    conn.commit()
    actualizado = cur.rowcount
    cur.close()
    conn.close()

    if actualizado == 0:
        return jsonify({"ok": False, "error": "Solicitud no encontrada"}), 404
    return jsonify({"ok": True, "message": f"Solicitud marcada como {nuevo_estado}"}), 200

# ======================================================
# 5. Eliminar solicitud
# ======================================================
@solicitudes_bp.route('/api/solicitudes/<int:id>', methods=['DELETE'])
def eliminar_solicitud(id):
    # ... (código sin cambios)
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT estado FROM solicitudes WHERE id=%s", (id,))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "Solicitud no encontrada"}), 404

    if row["estado"] == "pendiente":
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "No se pueden eliminar solicitudes pendientes"}), 400

    cur.execute("DELETE FROM solicitudes WHERE id=%s", (id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"ok": True, "message": "Solicitud eliminada correctamente"}), 200