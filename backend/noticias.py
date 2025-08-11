from flask import Blueprint, request, jsonify
from db import mysql

noticias_bp = Blueprint('noticias', __name__)

@noticias_bp.route('/api/noticias', methods=['GET'])
def obtener_noticias():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM noticias")
    data = cur.fetchall()
    noticias = []
    for row in data:
        noticias.append({
            'id': row[0],
            'titulo': row[1],
            'contenido': row[2],
            'imagen_url': row[3],
            'fecha': row[4],
            'usuario_id': row[5]
        })
    cur.close()
    return jsonify(noticias)

# POST - Crear nueva noticia
@noticias_bp.route('/api/noticias', methods=['POST'])
def crear_noticia():
    datos = request.get_json()

    titulo = datos.get('titulo')
    contenido = datos.get('contenido')
    imagen_url = datos.get('imagen_url')
    fecha = datos.get('fecha')
    usuario_id = datos.get('usuario_id')  # debe existir en la tabla usuarios

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO noticias (titulo, contenido, imagen_url, fecha, usuario_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (titulo, contenido, imagen_url, fecha, usuario_id))

    mysql.connection.commit()
    cur.close()

    return jsonify({'mensaje': 'Noticia creada correctamente'}), 201

# GET - Obtener noticia por ID
@noticias_bp.route('/api/noticias/<int:id>', methods=['GET'])
def obtener_noticia_por_id(id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM noticias WHERE id = %s", (id,))
    row = cur.fetchone()
    cur.close()

    if row:
        noticia = {
            'id': row[0],
            'titulo': row[1],
            'contenido': row[2],
            'imagen_url': row[3],
            'fecha': row[4],
            'usuario_id': row[5]
        }
        return jsonify(noticia)
    else:
        return jsonify({'mensaje': 'Noticia no encontrada'}), 404

# PUT - Actualizar noticia por ID
@noticias_bp.route('/api/noticias/<int:id>', methods=['PUT'])
def actualizar_noticia(id):
    datos = request.get_json()

    titulo = datos.get('titulo')
    contenido = datos.get('contenido')
    imagen_url = datos.get('imagen_url')
    fecha = datos.get('fecha')
    usuario_id = datos.get('usuario_id')

    cur = mysql.connection.cursor()
    cur.execute("""
        UPDATE noticias
        SET titulo = %s,
            contenido = %s,
            imagen_url = %s,
            fecha = %s,
            usuario_id = %s
        WHERE id = %s
    """, (titulo, contenido, imagen_url, fecha, usuario_id, id))

    mysql.connection.commit()
    cur.close()

    return jsonify({'mensaje': 'Noticia actualizada correctamente'})

# DELETE - Eliminar noticia por ID
@noticias_bp.route('/api/noticias/<int:id>', methods=['DELETE'])
def eliminar_noticia(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM noticias WHERE id = %s", (id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'mensaje': 'Noticia eliminada correctamente'})

