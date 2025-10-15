from flask import Blueprint, request, jsonify, g # ✅ 'g' importado aquí
from db import get_connection  # usamos la nueva función en db.py

usuarios_bp = Blueprint('usuarios', __name__)

# GET - Listar todos los usuarios
@usuarios_bp.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, nombre, email, rol_id, estado FROM usuarios")
        data = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# POST - Crear nuevo usuario (con encriptación)
@usuarios_bp.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    from app import bcrypt

    datos = request.get_json()
    nombre = datos.get('nombre')
    email = datos.get('email')
    password_plano = datos.get('password')

    if not nombre or not email or not password_plano:
        return jsonify({'mensaje': 'Nombre, email y contraseña son obligatorios'}), 400

    password_encriptada = bcrypt.generate_password_hash(password_plano).decode('utf-8')
    rol_id = datos.get('rol_id', 2)
    estado = datos.get('estado', 'activo')

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO usuarios (nombre, email, password, rol_id, estado)
            VALUES (%s, %s, %s, %s, %s)
        """, (nombre, email, password_encriptada, rol_id, estado))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'mensaje': 'Usuario creado correctamente'}), 201
    except Exception as e:
        return jsonify({'mensaje': 'Error al crear el usuario', 'error': str(e)}), 500


# GET - Obtener usuario por ID
@usuarios_bp.route('/api/usuarios/<int:id>', methods=['GET'])
def obtener_usuario_por_id(id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, nombre, email, rol_id, estado FROM usuarios WHERE id = %s", (id,))
        usuario = cur.fetchone()
        cur.close()
        conn.close()
        if usuario:
            return jsonify(usuario)
        else:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# PUT - Actualizar usuario
@usuarios_bp.route('/api/usuarios/<int:id>', methods=['PUT'])
def actualizar_usuario(id):
    from app import bcrypt

    datos = request.get_json()
    campos_a_actualizar = []
    valores = []

    if 'nombre' in datos:
        campos_a_actualizar.append("nombre = %s")
        valores.append(datos['nombre'])
    if 'email' in datos:
        campos_a_actualizar.append("email = %s")
        valores.append(datos['email'])
    if 'rol_id' in datos:
        campos_a_actualizar.append("rol_id = %s")
        valores.append(datos['rol_id'])
    if 'estado' in datos:
        campos_a_actualizar.append("estado = %s")
        valores.append(datos['estado'])

    if 'password' in datos and datos['password']:
        password_encriptada = bcrypt.generate_password_hash(datos['password']).decode('utf-8')
        campos_a_actualizar.append("password = %s")
        valores.append(password_encriptada)

    if not campos_a_actualizar:
        return jsonify({'mensaje': 'No se proporcionaron datos para actualizar'}), 400

    query = f"UPDATE usuarios SET {', '.join(campos_a_actualizar)} WHERE id = %s"
    valores.append(id)

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(query, tuple(valores))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'mensaje': 'Usuario actualizado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# DELETE - Eliminar usuario
@usuarios_bp.route('/api/usuarios/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM usuarios WHERE id = %s", (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'mensaje': 'Usuario eliminado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# PUT - Cambiar rol (solo admin)
from decorators import token_required

@usuarios_bp.route('/api/usuarios/<int:id>/rol', methods=['PUT'])
@token_required
def cambiar_rol(id):
    usuario_solicitante = getattr(g, "usuario", None)
    if not usuario_solicitante or usuario_solicitante["rol_id"] != 1:
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()
    nuevo_rol = data.get("rol_id")

    if not nuevo_rol:
        return jsonify({"error": "rol_id requerido"}), 400

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE usuarios SET rol_id = %s WHERE id = %s", (nuevo_rol, id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensaje": "Rol actualizado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ PUT - Cambiar estado (activo/inactivo) - NUEVO ENDPOINT
@usuarios_bp.route('/api/usuarios/<int:id>/estado', methods=['PUT'])
@token_required
def cambiar_estado_usuario(id):
    usuario_solicitante = getattr(g, "usuario", None)
    if not usuario_solicitante or usuario_solicitante["rol_id"] != 1:
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()
    nuevo_estado = data.get("estado")
    if nuevo_estado not in ["activo", "inactivo"]:
        return jsonify({"error": "Estado inválido"}), 400

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE usuarios SET estado = %s WHERE id = %s", (nuevo_estado, id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensaje": "Estado actualizado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500