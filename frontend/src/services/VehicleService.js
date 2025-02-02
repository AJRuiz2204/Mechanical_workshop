// src/services/VehicleService.js

/**
 * getVehicleById
 * Obtiene un vehículo por su ID.
 * This function retrieves a vehicle by its ID.
 *
 * @async
 * @function
 * @param {number|string} id - The ID of the vehicle to retrieve.
 * @returns {Promise<Object>} The vehicle data (must match VehicleReadDto).
 * @throws Will throw an error if the request fails.
 */
export const getVehicleById = async (id) => {
  try {
    const response = await fetch(`/api/UserWorkshops/vehicle/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error fetching the vehicle by ID.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    throw error;
  }
};

/**
 * updateVehicleStatus
 * Actualiza el estado de un vehículo (opcional, si es necesario).
 * This function updates a vehicle's status (optional, if needed).
 *
 * @async
 * @function
 * @param {number|string} vehicleId - The ID of the vehicle to update.
 * @param {string} newStatus - The new status to assign to the vehicle.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const updateVehicleStatus = async (vehicleId, newStatus) => {
  try {
    const response = await fetch(`/api/Vehicles/${vehicleId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error updating the vehicle status.");
      }
    }
  } catch (error) {
    console.error("Error in updateVehicleStatus:", error);
    throw error;
  }
};