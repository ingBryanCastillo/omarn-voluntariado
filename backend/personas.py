# backend/personas.py
from flask import Blueprint, jsonify, request
from db import get_connection

personas_bp = Blueprint('personas', __name__)

# GET todas las personas
@personas_bp.route('/api/personas', methods=['GET'])
def obtener_personas():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM personas ORDER BY id DESC")
    data = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(data), 200


# GET persona por ID
@personas_bp.route('/api/personas/<int:id>', methods=['GET'])
def obtener_persona(id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM personas WHERE id=%s", (id,))
    data = cur.fetchone()
    cur.close()
    conn.close()
    if not data:
        return jsonify({"error": "Persona no encontrada"}), 404
    return jsonify(data), 200


# POST crear persona
@personas_bp.route('/api/personas', methods=['POST'])
def crear_persona():
    datos = request.get_json()
    campos = ['usuario_id', 'nombres', 'apellidos', 'genero', 'telefono', 'fecha_nacimiento']
    if not all(k in datos for k in campos):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
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
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"mensaje": "Persona creada correctamente"}), 201


# PUT actualizar persona
@personas_bp.route('/api/personas/<int:id>', methods=['PUT'])
def actualizar_persona(id):
    datos = request.get_json()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE personas
        SET usuario_id=%s, nombres=%s, apellidos=%s, genero=%s, telefono=%s, fecha_nacimiento=%s
        WHERE id=%s
    """, (
        datos['usuario_id'], datos['nombres'], datos['apellidos'],
        datos['genero'], datos['telefono'], datos['fecha_nacimiento'], id
    ))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"mensaje": "Persona actualizada correctamente"}), 200


# DELETE eliminar persona
@personas_bp.route('/api/personas/<int:id>', methods=['DELETE'])
def eliminar_persona(id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM personas WHERE id=%s", (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"mensaje": "Persona eliminada correctamente"}), 200
