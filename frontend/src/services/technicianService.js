// frontend/src/services/technicianService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5121/api';

const technicianService = {
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
