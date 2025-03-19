import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * technicianService
 * Provides methods for interacting with the backend related to technicians.
 */
const technicianService = {
  /**
   * getTechnicians
   * Retrieves the list of all technicians.
   * This function fetches the list of all technicians.
   *
   * @async
   * @function
   * @returns {Promise<Array>} An array containing the technicians' information.
   * @throws Throws an error if the request fails.
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
