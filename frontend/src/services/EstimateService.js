// src/services/EstimateService.js

const API_URL = '/api/Estimates';
const VEHICLE_API_URL = '/api/UserWorkshops/vehicles';
const GET_VEHICLE_BY_ID_URL = (id) => `/api/UserWorkshops/vehicle/${id}`;

export const getEstimates = async () => {
  try {
    const response = await fetch('/api/Estimates');
    if (!response.ok) {
      throw new Error('Error fetching the Estimates.');
    }
    return await response.json(); // Esto retorna un array de EstimateFullDto
  } catch (error) {
    console.error('Error in getEstimates:', error);
    throw error;
  }
};

export const getEstimateById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching the Estimate with ID ${id}.`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getEstimateById:', error);
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
        throw new Error('Error creating the Estimate.');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createEstimate:', error);
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
      throw new Error('Error updating the Estimate.');
    }

    return;
  } catch (error) {
    console.error('Error in updateEstimate:', error);
    throw error;
  }
};

export const deleteEstimate = async (id) => {
  try {
    const response = await fetch(`/api/Estimates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error deleting the Estimate.');
    }
    return; // Eliminado con éxito
  } catch (error) {
    console.error('Error in deleteEstimate:', error);
    throw error;
  }
};

// New functions to handle vehicles
export const getAllVehicles = async () => {
  try {
    const response = await fetch(VEHICLE_API_URL);
    if (!response.ok) {
      throw new Error('Error fetching the list of vehicles.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllVehicles:', error);
    throw error;
  }
};

export const getVehicleById = async (id) => {
  try {
    const response = await fetch(GET_VEHICLE_BY_ID_URL(id));
    if (!response.ok) {
      throw new Error(`Error fetching the vehicle with ID ${id}.`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getVehicleById:', error);
    throw error;
  }
};





