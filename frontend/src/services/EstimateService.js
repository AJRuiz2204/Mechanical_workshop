// src/services/EstimateService.js

const API_URL = '/api/Estimates';
const VEHICLE_API_URL = '/api/UserWorkshops/vehicles'; // Asegúrate de que esta ruta es correcta
const GET_VEHICLE_BY_ID_URL = (id) => `/api/UserWorkshops/vehicle/${id}`; // Asegúrate de que esta ruta es correcta

export const getEstimates = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error al obtener los Estimates.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getEstimates:', error);
    throw error;
  }
};

export const getEstimateById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener el Estimate con ID ${id}.`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getEstimateById:', error);
    throw error;
  }
};

export const createEstimate = async (estimateData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estimateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error('Error al crear el Estimate.');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error en createEstimate:', error);
    throw error;
  }
};

export const updateEstimate = async (id, estimateData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estimateData),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el Estimate.');
    }

    return;
  } catch (error) {
    console.error('Error en updateEstimate:', error);
    throw error;
  }
};

export const deleteEstimate = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el Estimate.');
    }

    return;
  } catch (error) {
    console.error('Error en deleteEstimate:', error);
    throw error;
  }
};

// Nuevas funciones para manejar vehículos
export const getAllVehicles = async () => {
  try {
    const response = await fetch(VEHICLE_API_URL);
    if (!response.ok) {
      throw new Error('Error al obtener la lista de vehículos.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getAllVehicles:', error);
    throw error;
  }
};

export const getVehicleById = async (id) => {
  try {
    const response = await fetch(GET_VEHICLE_BY_ID_URL(id));
    if (!response.ok) {
      throw new Error(`Error al obtener el vehículo con ID ${id}.`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getVehicleById:', error);
    throw error;
  }
};
