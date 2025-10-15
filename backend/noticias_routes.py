import os
import pymysql.cursors
from flask import Blueprint, request, jsonify, send_from_directory, g
from werkzeug.utils import secure_filename
from db import get_connection
from decorators import token_required  # decorador de autenticación

# --- Blueprint y Configuración ---
noticias_bp = Blueprint('noticias', __name__)

ALLOWED_IMG = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
UPLOAD_DIR = 'static/uploads'

# ======================================================
# GET - Listar todas las noticias (solo FECHA)
# ======================================================
@noticias_bp.route('/api/noticias', methods=['GET'])
def listar_noticias():
    estado = request.args.get('estado')
    where_clauses, params = [], []

    if estado:
        where_clauses.append("n.estado=%s")
        params.append(estado)

    where_sql = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""

    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute(f"""
        SELECT
            n.id, n.titulo, n.contenido, DATE(n.fecha_pub) AS fecha_pub,
            n.estado, n.usuario_id, u.nombre AS autor_nombre, n.imagen_url
        FROM noticias n
        LEFT JOIN usuarios u ON u.id = n.usuario_id
        {where_sql}
        ORDER BY n.fecha_pub DESC, n.id DESC
    """, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "data": rows}), 200

# ======================================================
# GET - Obtener noticia por ID (solo FECHA)
# ======================================================
@noticias_bp.route('/api/noticias/<int:id>', methods=['GET'])
def obtener_noticia_por_id(id):
    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("""
        SELECT
            n.id, n.titulo, n.contenido, DATE(n.fecha_pub) AS fecha_pub,
            n.estado, n.usuario_id, u.nombre AS autor_nombre, n.imagen_url
        FROM noticias n
        LEFT JOIN usuarios u ON u.id = n.usuario_id
        WHERE n.id = %s
    """, (id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return jsonify({"ok": False, "error": "Noticia no encontrada"}), 404
    return jsonify({"ok": True, "data": row}), 200

# ======================================================
# POST - Crear noticia (protegida)
# ======================================================
@noticias_bp.route('/api/noticias', methods=['POST'])
@token_required
def crear_noticia():
    body = request.get_json(silent=True) or {}
    titulo = (body.get('titulo') or '').strip()
    contenido = (body.get('contenido') or '').strip()
    imagen_url = (body.get('imagen_url') or '').strip() or None
    estado = body.get('estado', 'publicada')
    usuario_id = g.usuario['id']

    if not titulo or not contenido:
        return jsonify({"ok": False, "error": "Título y contenido son requeridos"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO noticias (titulo, contenido, fecha_pub, estado, usuario_id, imagen_url)
        VALUES (%s, %s, CURDATE(), %s, %s, %s)
    """, (titulo, contenido, estado, usuario_id, imagen_url))
    conn.commit()
    new_id = cur.lastrowid
    cur.close()
    conn.close()
    return jsonify({"ok": True, "mensaje": "Noticia creada correctamente", "data": {"id": new_id}}), 201

# ======================================================
# PUT - Actualizar noticia (protegida)
# ======================================================
@noticias_bp.route('/api/noticias/<int:id>', methods=['PUT'])
@token_required
def actualizar_noticia(id):
    # ✅ Verificación de permisos agregada al inicio
    usuario = g.usuario
    if usuario["rol_id"] not in [1, 3]:
        return jsonify({"error": "No autorizado"}), 403

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"ok": False, "error": "Cuerpo de la petición inválido o vacío"}), 400

    conn = get_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    cur.execute("SELECT id FROM noticias WHERE id = %s", (id,))
    noticia = cur.fetchone()
    if not noticia:
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "Noticia no encontrada"}), 404

    # (Se elimina la validación de permisos anterior de aquí)

    fields_to_update = []
    params = []
    allowed_fields = ['titulo', 'contenido', 'imagen_url', 'estado']

    for field in allowed_fields:
        if field in body:
            fields_to_update.append(f"{field} = %s")
            params.append(body[field])

    if not fields_to_update:
        cur.close()
        conn.close()
        return jsonify({"ok": False, "error": "No se proporcionaron campos para actualizar"}), 400

    params.append(id)
    query = f"UPDATE noticias SET {', '.join(fields_to_update)} WHERE id = %s"

    cur2 = conn.cursor()
    cur2.execute(query, tuple(params))
    conn.commit()
    cur2.close()
    cur.close()
    conn.close()
    return jsonify({"ok": True, "mensaje": "Noticia actualizada correctamente"}), 200

# ======================================================
# DELETE - Eliminar noticia (protegida)
# ======================================================
@noticias_bp.route('/api/noticias/<int:id>', methods=['DELETE'])
@token_required
def eliminar_noticia(id):
    # ✅ Verificación de permisos actualizada
    usuario = g.usuario
    if usuario["rol_id"] not in [1, 3]:
        return jsonify({"error": "No autorizado"}), 403

    try:
        conn = get_connection()
        cur = conn.cursor()
        # Verificar que la noticia existe antes de borrar (opcional pero buena práctica)
        cur.execute("DELETE FROM noticias WHERE id = %s", (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensaje": "Noticia eliminada correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ... (El resto del archivo permanece igual) ...

# ======================================================
# POST - Subir imagen para noticia (protegida)
# ======================================================
@noticias_bp.route('/api/noticias/upload', methods=['POST'])
@token_required
def subir_imagen_noticia():
    if 'file' not in request.files:
        return jsonify({"ok": False, "error": "No se envió ningún archivo"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"ok": False, "error": "Nombre de archivo inválido"}), 400
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_IMG:
        return jsonify({"ok": False, "error": "Formato de archivo no permitido"}), 400
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_DIR, filename)
    base, extension = os.path.splitext(filename)
    i = 1
    while os.path.exists(save_path):
        filename = f"{base}_{i}{extension}"
        save_path = os.path.join(UPLOAD_DIR, filename)
        i += 1
    file.save(save_path)
    public_url = f"/{save_path.replace(os.path.sep, '/')}"
    return jsonify({"ok": True, "url": public_url}), 201

# ======================================================
# GET - Servir archivos subidos
# ======================================================
@noticias_bp.route('/static/uploads/<path:fname>', methods=['GET'])
def serve_uploads(fname):
    return send_from_directory(UPLOAD_DIR, fname)