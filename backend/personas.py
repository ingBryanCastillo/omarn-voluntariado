from flask import Blueprint, jsonify, request
from db import mysql

personas_bp = Blueprint('personas', __name__)

# GET todas las personas
@personas_bp.route('/api/personas', methods=['GET'])
def obtener_personas():
    conexion = mysql.connection
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM personas")
    filas = cursor.fetchall()
    cursor.close()

    personas = []
    for fila in filas:
        personas.append({
            'id': fila[0],
            'usuario_id': fila[1],
            'nombres': fila[2],
            'apellidos': fila[3],
            'genero': fila[4],
            'telefono': fila[5],
            'fecha_nacimiento': str(fila[6])
        })

    return jsonify(personas)

# GET persona por ID
@personas_bp.route('/api/personas/<int:id>', methods=['GET'])
def obtener_persona(id):
    conexion = mysql.connection
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM personas WHERE id = %s", (id,))
    fila = cursor.fetchone()
    cursor.close()

    if fila:
        persona = {
            'id': fila[0],
            'usuario_id': fila[1],
            'nombres': fila[2],
            'apellidos': fila[3],
            'genero': fila[4],
            'telefono': fila[5],
            'fecha_nacimiento': str(fila[6])
        }
        return jsonify(persona)
    else:
        return jsonify({'mensaje': 'Persona no encontrada'}), 404

# POST crear persona
@personas_bp.route('/api/personas', methods=['POST'])
def crear_persona():
    datos = request.json
    conexion = mysql.connection
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO personas (usuario_id, nombres, apellidos, genero, telefono, fecha_nacimiento)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        datos['usuario_id'],
        datos['nombres'],
        datos['apellidos'],
        datos['genero'],
        datos['telefono'],
        datos['fecha_nacimiento']
    ))
    conexion.commit()
    cursor.close()
    return jsonify({'mensaje': 'Persona creada correctamente'})

# PUT actualizar persona
@personas_bp.route('/api/personas/<int:id>', methods=['PUT'])
def actualizar_persona(id):
    datos = request.json
    conexion = mysql.connection
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE personas
        SET usuario_id = %s, nombres = %s, apellidos = %s, genero = %s, telefono = %s, fecha_nacimiento = %s
        WHERE id = %s
    """, (
        datos['usuario_id'],
        datos['nombres'],
        datos['apellidos'],
        datos['genero'],
        datos['telefono'],
        datos['fecha_nacimiento'],
        id
    ))
    conexion.commit()
    cursor.close()
    return jsonify({'mensaje': 'Persona actualizada correctamente'})

# DELETE eliminar persona
@personas_bp.route('/api/personas/<int:id>', methods=['DELETE'])
def eliminar_persona(id):
    conexion = mysql.connection
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM personas WHERE id = %s", (id,))
    conexion.commit()
    cursor.close()
    return jsonify({'mensaje': 'Persona eliminada correctamente'})
