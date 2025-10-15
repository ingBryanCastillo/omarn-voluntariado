import pymysql
from flask import Blueprint, request, jsonify, g # ✅ 'g' importado
from db import get_connection
from decorators import token_required # ✅ decorador importado

contacto_bp = Blueprint("contacto", __name__)

# -------------------------
# POST - Guardar mensaje
# -------------------------
@contacto_bp.route("/api/contacto", methods=["POST"])
def enviar_contacto():
    # ... (código sin cambios)
    data = request.json
    nombre = data.get("nombre")
    correo = data.get("correo")
    mensaje = data.get("mensaje")

    if not nombre or not correo or not mensaje:
        return jsonify({"ok": False, "error": "Todos los campos son requeridos"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO mensajes_contacto (nombre, correo, mensaje)
        VALUES (%s, %s, %s)
        """,
        (nombre, correo, mensaje),
    )
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"ok": True, "mensaje": "Mensaje enviado correctamente"}), 201


# -------------------------
# GET - Listar mensajes (solo admin/trabajador)
# -------------------------
@contacto_bp.route("/api/contacto", methods=["GET"])
@token_required # ✅ Ruta protegida
def listar_mensajes():
    user = g.usuario # ✅ Obtenemos el usuario del token
    
    # ✅ Solo admin (1) y trabajador (3) pueden ver los mensajes
    if user["rol_id"] not in [1, 3]:
        return jsonify({"ok": False, "error": "No tienes permisos para ver los mensajes"}), 403

    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        """
        SELECT id, nombre, correo, mensaje, fecha AS fecha_envio
        FROM mensajes_contacto
        ORDER BY fecha DESC
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({"ok": True, "data": rows}), 200


# -------------------------
# DELETE - Eliminar/marcar visto un mensaje
# -------------------------
@contacto_bp.route("/api/contacto/<int:id>", methods=["DELETE"])
def eliminar_mensaje(id):
    # ... (código sin cambios)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM mensajes_contacto WHERE id = %s", (id,))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"ok": True, "mensaje": "Mensaje eliminado"}), 200