// src/services/EstimateService.js

/**
 * @fileoverview This file contains all API calls related to estimates, vehicles,
 * and technician diagnostics.
 */
import api from './api';
const API_URL = '/Estimates';
const VEHICLE_API_URL = '/UserWorkshops/vehicles';
const GET_VEHICLE_BY_ID_URL = (id) => `/UserWorkshops/vehicle/${id}`;
const TECH_DIAGNOSTIC_API_URL = '/TechnicianDiagnostics';
const GET_TECH_DIAGNOSTIC_BY_ID_URL = (id) =>
  `/TechnicianDiagnostics/${id}`;
const GET_DIAGNOSTIC_BY_VEHICLE_ID_URL = (vehicleId) =>
  `/TechnicianDiagnostics/vehicle/${vehicleId}`;
const VEHICLE_DIAGNOSTIC_API_URL = '/VehicleDiagnostic';
const API_URL_WITHACCOUNT = '/EstimateWithAccountReceivable';

/**
 * Fetches the list of estimates along with their account receivable information.
 * @async
 * @function getEstimatesWithAccounts
 * @returns {Promise<Array>} An array of EstimateWithAccountReceivableDto objects.
 * @throws Will throw an error if the request fails.
 */
export const getEstimatesWithAccounts = async () => {
  try {
    const response = await api.get(API_URL_WITHACCOUNT);
    return response.data;
  } catch (error) {
    console.error("Error in getEstimatesWithAccounts:", error);
    throw error;
  }
};

/**
 * Fetches all vehicles with their diagnostics and technician diagnostics.
 * @async
 * @function getVehicleDiagnostics
 * @returns {Promise<Array>} An array of VehicleDiagnosticOwnerDto objects.
 * @throws Will throw an error if the request fails.
 */
export const getVehicleDiagnostics = async () => {
  try {
    const response = await api.get(VEHICLE_DIAGNOSTIC_API_URL);
    return response.data;
  } catch (error) {
    console.error("Error in getVehicleDiagnostics:", error);
    throw error;
  }
};

/**
 * Fetches all estimates.
 * @async
 * @function getEstimates
 * @returns {Promise<Array>} An array of estimates.
 * @throws Will throw an error if the request fails.
 */
export const getEstimates = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
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
    const response = await api.get(`${API_URL}/${id}`);
    return response.data;
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
    const response = await api.post(API_URL, estimateData);
    return response.data;
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
    const response = await api.put(`${API_URL}/${id}`, estimateData);
    return response.data;
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
    await api.delete(`${API_URL}/${id}`);
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
    const response = await api.get(VEHICLE_API_URL);
    return response.data;
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
    const response = await api.get(GET_VEHICLE_BY_ID_URL(id));
    return response.data;
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
    const response = await api.get(TECH_DIAGNOSTIC_API_URL);
    return response.data;
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
    const response = await api.get(GET_TECH_DIAGNOSTIC_BY_ID_URL(id));
    return response.data;
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
    const response = await api.get(GET_DIAGNOSTIC_BY_VEHICLE_ID_URL(vehicleId));
    return response.data;
  } catch (error) {
    console.error("Error in getDiagnosticByVehicleId:", error);
    throw error;
  }
};
