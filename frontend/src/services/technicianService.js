// frontend/src/services/technicianService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5121/api';

/**
 * technicianService
 * Proporciona métodos para la interacción con el backend relacionado con los técnicos.
 * This object provides methods for interacting with the backend related to technicians.
 */
const technicianService = {
  /**
   * getTechnicians
   * Obtiene la lista de todos los técnicos.
   * This function fetches the list of all technicians.
   *
   * @async
   * @function
   * @returns {Promise<Array>} Un array con la información de los técnicos.
   * @throws Lanzará un error si la petición falla.
   */
  getTechnicians: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Technician`);
      return response.data;
    } catch (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }
  },
};

export default technicianService;
