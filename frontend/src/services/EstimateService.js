// src/services/EstimateService.js

/**
 * @fileoverview This file contains all API calls related to estimates, vehicles,
 * and technician diagnostics.
 */

const API_URL = "/api/Estimates";
const VEHICLE_API_URL = "/api/UserWorkshops/vehicles";
const GET_VEHICLE_BY_ID_URL = (id) => `/api/UserWorkshops/vehicle/${id}`;
const TECH_DIAGNOSTIC_API_URL = "/api/TechnicianDiagnostics";
const GET_TECH_DIAGNOSTIC_BY_ID_URL = (id) => `/api/TechnicianDiagnostics/${id}`;
const GET_DIAGNOSTIC_BY_VEHICLE_ID_URL = (vehicleId) =>
  `/api/TechnicianDiagnostics/vehicle/${vehicleId}`;

/**
 * Fetches all estimates.
 * @async
 * @function getEstimates
 * @returns {Promise<Array>} An array of estimates.
 * @throws Will throw an error if the request fails.
 */
export const getEstimates = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error fetching the Estimates.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getEstimates:", error);
    throw error;
  }
};

/**
 * Fetches a specific estimate by its ID.
 * @async
 * @function getEstimateById
 * @param {number|string} id - The ID of the estimate.
 * @returns {Promise<Object>} The estimate data.
 * @throws Will throw an error if the request fails.
 */
export const getEstimateById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching the Estimate with ID ${id}.`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getEstimateById:", error);
    throw error;
  }
};

/**
 * Creates a new estimate.
 * @async
 * @function createEstimate
 * @param {Object} estimateData - The data for the new estimate.
 * @returns {Promise<Object>} The newly created estimate.
 * @throws Will throw an error if the request fails.
 */
export const createEstimate = async (estimateData) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(estimateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error creating the Estimate.");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createEstimate:", error);
    throw error;
  }
};

/**
 * Updates an existing estimate by its ID.
 * @async
 * @function updateEstimate
 * @param {number|string} id - The ID of the estimate to update.
 * @param {Object} estimateData - The updated estimate data.
 * @returns {Promise<Object>} The updated estimate data.
 * @throws Will throw an error if the request fails.
 */
export const updateEstimate = async (id, estimateData) => {
  try {
    const response = await fetch(`http://localhost:5173/api/Estimates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estimateData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SERVER RESPONSE:", data);
      throw new Error(data.details || data.message || "Error updating the estimate.");
    }

    return data;
  } catch (error) {
    console.error("Error in updateEstimate:", error);
    throw error;
  }
};

/**
 * Deletes an estimate by its ID.
 * @async
 * @function deleteEstimate
 * @param {number|string} id - The ID of the estimate to delete.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const deleteEstimate = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error deleting the Estimate.");
    }
    return;
  } catch (error) {
    console.error("Error in deleteEstimate:", error);
    throw error;
  }
};

/**
 * Fetches all vehicles.
 * @async
 * @function getAllVehicles
 * @returns {Promise<Array>} An array of vehicles.
 * @throws Will throw an error if the request fails.
 */
export const getAllVehicles = async () => {
  try {
    const response = await fetch(VEHICLE_API_URL);
    if (!response.ok) {
      throw new Error("Error fetching the list of vehicles.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getAllVehicles:", error);
    throw error;
  }
};

/**
 * Fetches a specific vehicle by its ID.
 * @async
 * @function getVehicleById
 * @param {number|string} id - The ID of the vehicle.
 * @returns {Promise<Object>} The vehicle data.
 * @throws Will throw an error if the request fails.
 */
export const getVehicleById = async (id) => {
  try {
    const response = await fetch(GET_VEHICLE_BY_ID_URL(id));
    if (!response.ok) {
      throw new Error(`Error fetching the vehicle with ID ${id}.`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    throw error;
  }
};

/**
 * Fetches all technician diagnostics.
 * @async
 * @function getAllTechnicianDiagnostics
 * @returns {Promise<Array>} An array of technician diagnostics.
 * @throws Will throw an error if the request fails.
 */
export const getAllTechnicianDiagnostics = async () => {
  try {
    const response = await fetch(TECH_DIAGNOSTIC_API_URL);
    if (!response.ok) {
      throw new Error("Error fetching the list of Technician Diagnostics.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getAllTechnicianDiagnostics:", error);
    throw error;
  }
};

/**
 * Fetches a specific technician diagnostic by its ID.
 * @async
 * @function getTechnicianDiagnosticById
 * @param {number|string} id - The ID of the technician diagnostic.
 * @returns {Promise<Object>} The technician diagnostic data.
 * @throws Will throw an error if the request fails.
 */
export const getTechnicianDiagnosticById = async (id) => {
  try {
    const response = await fetch(GET_TECH_DIAGNOSTIC_BY_ID_URL(id));
    if (!response.ok) {
      throw new Error(`Error fetching the Technician Diagnostic with ID ${id}.`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getTechnicianDiagnosticById:", error);
    throw error;
  }
};

/**
 * Fetches a technician diagnostic by a vehicle ID.
 * If the diagnostic is not found, returns null.
 * @async
 * @function getDiagnosticByVehicleId
 * @param {number|string} vehicleId - The ID of the vehicle.
 * @returns {Promise<Object|null>} The technician diagnostic data or null if not found.
 * @throws Will throw an error if the request fails.
 */
export const getDiagnosticByVehicleId = async (vehicleId) => {
  try {
    const response = await fetch(GET_DIAGNOSTIC_BY_VEHICLE_ID_URL(vehicleId));
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching Technician Diagnostic for Vehicle ID ${vehicleId}.`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getDiagnosticByVehicleId:", error);
    throw error;
  }
};
