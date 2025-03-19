import axios from "axios";

const BASE_API = import.meta.env.VITE_API_URL || "/api";
const API_URL = `${BASE_API}/EstimatesSumary`;

export const getEstimateData = async () => {
  try {
    const response = await axios.get(`${API_URL}/GetEstimateData`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos del resumen de estimados:", error);

    if (error.response) {
      throw new Error(`Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor.");
    } else {
      throw new Error(`Error en la solicitud: ${error.message}`);
    }
  }
};
