// src/services/VehicleService.js

// Get Vehicle by ID
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
    return await response.json(); // Must match VehicleReadDto
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    throw error;
  }
};

// Update vehicle status (optional, if needed)
export const updateVehicleStatus = async (vehicleId, newStatus) => {
  try {
    const response = await fetch(`/api/Vehicles/${vehicleId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }), // Adjust according to the backend
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
