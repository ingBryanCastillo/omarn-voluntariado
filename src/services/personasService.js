// src/services/personasService.js
import axios from 'axios';

const API = 'http://72.60.173.25';



// Función para obtener todas las personas
export const obtenerPersonas = async () => {
  try {
    const response = await axios.get(API_URL);  // Realiza la solicitud GET a la API
    return response.data;  // Retorna los datos
  } catch (error) {
    console.error("Error al obtener personas:", error);  // Manejo de errores
    throw error;
  }
};
