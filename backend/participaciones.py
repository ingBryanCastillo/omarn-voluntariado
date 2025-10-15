from flask import Blueprint, request, jsonify, g # ✅ 'g' importado
from db import get_connection
import pymysql.cursors
from decorators import token_required # ✅ decorador importado

participaciones_bp = Blueprint('participaciones', __name__)

# POST - Inscribir usuario en una jornada
@participaciones_bp.route('/api/participaciones/inscribir', methods=['POST'])
def inscribir_usuario():
    # ... (código sin cambios)
    body = request.get_json(force=True)
    usuario_id = body.get("usuario_id")
    jornada_id = body.get("jornada_id")

    if not usuario_id or not jornada_id:
        return jsonify({"ok": False, "error": "usuario_id y jornada_id requeridos"}), 400

    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT j.id, j.estado, j.lugar, j.fecha, j.descripcion, c.puntos
        FROM jornadas j
        LEFT JOIN catalogo_jornadas c ON c.id = j.catalogo_jornada_id
        WHERE j.id=%s
    """, (jornada_id,))
    jornada = cur.fetchone()
    if not jornada:
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "Jornada no encontrada"}), 404
    if jornada["estado"] != "pendiente":
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "La jornada no está disponible"}), 400

    cur.execute("SELECT id FROM participaciones WHERE usuario_id=%s AND jornada_id=%s", (usuario_id, jornada_id))
    ya = cur.fetchone()
    if ya:
        cur.close()
        conn.close()
        return jsonify({
            "ok": False,
            "error": f"Ya estás inscrito en '{jornada['descripcion']}' en {jornada['lugar']} el {jornada['fecha'].strftime('%d/%m/%Y')}"
        }), 409

    cur.execute("""
        INSERT INTO participaciones (usuario_id, jornada_id, asistencia_confirmada, puntos)
        VALUES (%s, %s, 0, 0)
    """, (usuario_id, jornada_id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "ok": True,
        "success": True,
        "jornada_id": jornada_id,
        "usuario_id": usuario_id,
        "message": f"Fuiste inscrito a '{jornada['descripcion']}' en {jornada['lugar']} el {jornada['fecha'].strftime('%d/%m/%Y')}"
    }), 200


# GET - Listar participaciones (con filtro por rol)
@participaciones_bp.route('/api/participaciones', methods=['GET'])
@token_required # ✅ Ruta protegida
def listar_participaciones():
    user = g.usuario # ✅ Obtenemos el usuario del token
    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    
    # ✅ Query base
    query = """
        SELECT p.id, p.usuario_id, u.nombre, u.email, j.lugar, j.fecha, c.nombre AS tipo,
               p.asistencia_confirmada, p.puntos
        FROM participaciones p
        LEFT JOIN usuarios u ON u.id = p.usuario_id
        LEFT JOIN jornadas j ON j.id = p.jornada_id
        LEFT JOIN catalogo_jornadas c ON c.id = j.catalogo_jornada_id
    """
    params = []

    # ✅ Si el usuario es voluntario (rol 2), solo ve sus participaciones
    if user["rol_id"] == 2:
        query += " WHERE p.usuario_id = %s"
        params.append(user['id'])

    query += " ORDER BY p.id DESC"
    
    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "data": rows})


# ... (el resto de las rutas como top_voluntarios, confirmar, etc. no necesitan cambios)

# GET - Participaciones de un usuario específico
@participaciones_bp.route('/api/participaciones/usuario/<int:usuario_id>', methods=['GET'])
def participaciones_por_usuario(usuario_id):
    # ... (código sin cambios)
    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("""
        SELECT p.id, j.lugar, j.fecha, c.nombre AS tipo,
               p.asistencia_confirmada, p.puntos
        FROM participaciones p
        LEFT JOIN jornadas j ON j.id = p.jornada_id
        LEFT JOIN catalogo_jornadas c ON c.id = j.catalogo_jornada_id
        WHERE p.usuario_id=%s
        ORDER BY j.fecha DESC
    """, (usuario_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "data": rows})


# PUT - Confirmar asistencia y asignar puntos automáticamente
@participaciones_bp.route('/api/participaciones/<int:id>/confirmar', methods=['PUT'])
def confirmar_asistencia(id):
    # ... (código sin cambios)
    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)

    cur.execute("""
        SELECT j.id, c.puntos
        FROM participaciones p
        JOIN jornadas j ON j.id = p.jornada_id
        LEFT JOIN catalogo_jornadas c ON c.id = j.catalogo_jornada_id
        WHERE p.id=%s
    """, (id,))
    jornada = cur.fetchone()

    if not jornada:
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "Participación no encontrada"}), 404

    puntos = jornada["puntos"] if jornada["puntos"] else 0

    cur.execute("""
        UPDATE participaciones 
        SET asistencia_confirmada=1, puntos=%s 
        WHERE id=%s
    """, (puntos, id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"ok": True, "message": f"Asistencia confirmada, se asignaron {puntos} puntos"})


# GET - Top voluntarios (ranking por puntos)
@participaciones_bp.route('/api/top_voluntarios', methods=['GET'])
def top_voluntarios():
    # ... (código sin cambios)
    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("""
        SELECT u.id, u.nombre, u.email, SUM(p.puntos) as total_puntos
        FROM usuarios u
        JOIN participaciones p ON p.usuario_id = u.id
        WHERE p.asistencia_confirmada = 1
        GROUP BY u.id, u.nombre, u.email
        ORDER BY total_puntos DESC
        LIMIT 10
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "data": rows})