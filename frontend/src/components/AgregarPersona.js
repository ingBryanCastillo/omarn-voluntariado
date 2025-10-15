// src/components/AgregarPersona.js
import React, { useState } from 'react';
import axios from 'axios';
import './AgregarPersona.css';

const AgregarPersona = () => {
  const [usuarioId, setUsuarioId] = useState(1); // Asignamos un valor por defecto para el usuario_id
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [genero, setGenero] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar si todos los campos están completos
    if (!nombres || !apellidos || !genero || !telefono || !fechaNacimiento) {
      setMensaje("Por favor, complete todos los campos.");
      return;
    }

    // Crear el objeto con los datos del formulario
    const nuevaPersona = {
      usuario_id: usuarioId,
      nombres,
      apellidos,
      genero,
      telefono,
      fecha_nacimiento: fechaNacimiento, // Ahora la fecha es texto
    };

    try {
      const response = await axios.post('http://localhost:5000/api/personas', nuevaPersona);
      setMensaje('Persona agregada exitosamente');
      
      // Limpiar los campos del formulario
      setUsuarioId(1); // Restablecer usuario_id (si es necesario)
      setNombres('');
      setApellidos('');
      setGenero('');
      setTelefono('');
      setFechaNacimiento('');
    } catch (error) {
      setMensaje('Hubo un error al agregar la persona');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Agregar Persona</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuario ID (opcional):</label>
          <input
            type="number"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            placeholder="Ingrese el ID del usuario"
          />
        </div>
        <div>
          <label>Nombres:</label>
          <input
            type="text"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Apellidos:</label>
          <input
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Género:</label>
          <select value={genero} onChange={(e) => setGenero(e.target.value)} required>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Fecha de Nacimiento:</label>
          <input
            type="text"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            placeholder="Formato: YYYY-MM-DD"
            required
          />
        </div>
        <button type="submit">Agregar Persona</button>
      </form>
      {mensaje && <div>{mensaje}</div>}
    </div>
  );
};

export default AgregarPersona;
