import api from "./api";

/**
 * getVehicleById
 * Retrieves a vehicle by its ID.
 *
 * @async
 * @function getVehicleById
 * @param {number|string} id - The ID of the vehicle to retrieve.
 * @returns {Promise<Object>} The vehicle data (must match VehicleReadDto).
 * @throws Will throw an error if the request fails.
 */
export const getVehicleById = async (id) => {
  try {
    const response = await api.get(`/UserWorkshops/vehicle/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    throw error;
  }
};

/**
 * updateVehicleStatus
 * Updates a vehicle's status (optional, if needed).
 *
 * @async
 * @function updateVehicleStatus
 * @param {number|string} vehicleId - The ID of the vehicle to update.
 * @param {string} newStatus - The new status to assign to the vehicle.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const updateVehicleStatus = async (vehicleId, newStatus) => {
  try {
    const response = await api.put(`/Vehicles/${vehicleId}/status`, { status: newStatus }, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateVehicleStatus:", error);
    throw error;
  }
};
