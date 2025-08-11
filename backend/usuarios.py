from flask import Blueprint, request, jsonify
from db import mysql

usuarios_bp = Blueprint('usuarios', __name__)

# GET - Listar todos los usuarios
@usuarios_bp.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM usuarios")
    data = cur.fetchall()
    usuarios = []
    for row in data:
        usuarios.append({
            'id': row[0],
            'nombre': row[1],
            'email': row[2],
            'password': row[3],
            'rol_id': row[4],
            'estado': row[5]
        })
    cur.close()
    return jsonify(usuarios)

# POST - Crear nuevo usuario
@usuarios_bp.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    datos = request.get_json()

    nombre = datos.get('nombre')
    email = datos.get('email')
    password = datos.get('password')

    # Valor por defecto: voluntario (2)
    rol_id = datos.get('rol_id', 2)
    estado = datos.get('estado', 'activo')  # opcional, por defecto activo

    # Validar rol_id permitido
    if rol_id not in (1, 2, 3):
        return jsonify({'mensaje': 'rol_id inválido (use 1=admin, 2=voluntario, 3=personal)'}), 400

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO usuarios (nombre, email, password, rol_id, estado)
        VALUES (%s, %s, %s, %s, %s)
    """, (nombre, email, password, rol_id, estado))

    mysql.connection.commit()
    cur.close()

    return jsonify({'mensaje': 'Usuario creado correctamente'}), 201


# GET - Obtener usuario por ID
@usuarios_bp.route('/api/usuarios/<int:id>', methods=['GET'])
def obtener_usuario_por_id(id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM usuarios WHERE id = %s", (id,))
    row = cur.fetchone()
    cur.close()

    if row:
        usuario = {
            'id': row[0],
            'nombre': row[1],
            'email': row[2],
            'password': row[3],
            'rol_id': row[4],
            'estado': row[5]
        }
        return jsonify(usuario)
    else:
        return jsonify({'mensaje': 'Usuario no encontrado'}), 404

# PUT - Actualizar usuario
@usuarios_bp.route('/api/usuarios/<int:id>', methods=['PUT'])
def actualizar_usuario(id):
    datos = request.get_json()

    nombre = datos.get('nombre')
    email = datos.get('email')
    password = datos.get('password')
    rol_id = datos.get('rol_id')
    estado = datos.get('estado')

    cur = mysql.connection.cursor()
    cur.execute("""
        UPDATE usuarios
        SET nombre = %s, email = %s, password = %s, rol_id = %s, estado = %s
        WHERE id = %s
    """, (nombre, email, password, rol_id, estado, id))

    mysql.connection.commit()
    cur.close()

    return jsonify({'mensaje': 'Usuario actualizado correctamente'})

# DELETE - Eliminar usuario
@usuarios_bp.route('/api/usuarios/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM usuarios WHERE id = %s", (id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Usuario eliminado correctamente'})
