// src/components/PersonasList.js
import React, { useState, useEffect } from 'react';
import { obtenerPersonas } from '../services/personasService';

const PersonasList = () => {
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const data = await obtenerPersonas();  // Llamamos al servicio para obtener las personas
        console.log(data);  // Este es el console.log que agregamos para ver los datos
        setPersonas(data);  // Guardamos los datos de las personas en el estado
      } catch (error) {
        console.error("Error al obtener personas:", error);
      }
    };

    fetchPersonas();  // Ejecutamos la función para obtener las personas
  }, []);  // El array vacío significa que solo se ejecuta una vez, al montar el componente.

  return (
    <div>
      <h1>Lista de Personas</h1>
      {personas.length > 0 ? (
        <ul>
          {personas.map((persona) => (
            <li key={persona.id}>
              {persona.nombres} {persona.apellidos} - {persona.genero}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay personas para mostrar.</p>
      )}
    </div>
  );
};

export default PersonasList;
