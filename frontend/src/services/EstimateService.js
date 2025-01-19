const API_URL = "/api/Estimates";
const VEHICLE_API_URL = "/api/UserWorkshops/vehicles";
const GET_VEHICLE_BY_ID_URL = (id) => `/api/UserWorkshops/vehicle/${id}`;
const TECH_DIAGNOSTIC_API_URL = "/api/TechnicianDiagnostics";
const GET_TECH_DIAGNOSTIC_BY_ID_URL = (id) =>
  `/api/TechnicianDiagnostics/${id}`;
const GET_DIAGNOSTIC_BY_VEHICLE_ID_URL = (vehicleId) =>
  `/api/TechnicianDiagnostics/vehicle/${vehicleId}`;

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

// En EstimateService.js (updateEstimate)
export const updateEstimate = async (id, estimateData) => {
  try {
    const response = await fetch(`/api/Estimates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(estimateData),
    });

    if (!response.ok) {
      // Lee el JSON una sola vez
      const errorData = await response.json().catch(() => null);

      console.error("SERVER RESPONSE:", errorData);
      console.error("SERVER ERRORS DETAIL:", errorData?.errors);

      let errorMsg = "Error updating the estimate.";
      if (errorData && errorData.message) {
        errorMsg = errorData.message;
      }

      if (errorData && Array.isArray(errorData.errors)) {
        const detail = errorData.errors
          .map((err) => err.Error || err.ErrorMessage || "")
          .join(" | ");
        errorMsg += ` ${detail}`;
      }

      throw new Error(errorMsg);
    }

    // Si todo va bien, parseamos la respuesta una sola vez
    const updatedEstimate = await response.json();
    return updatedEstimate;
  } catch (error) {
    console.error("Error in updateEstimate:", error);
    throw new Error(error.message || "Error updating the estimate.");
  }
};

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

export const getTechnicianDiagnosticById = async (id) => {
  try {
    const response = await fetch(GET_TECH_DIAGNOSTIC_BY_ID_URL(id));
    if (!response.ok) {
      throw new Error(
        `Error fetching the Technician Diagnostic with ID ${id}.`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getTechnicianDiagnosticById:", error);
    throw error;
  }
};

export const getDiagnosticByVehicleId = async (vehicleId) => {
  try {
    const response = await fetch(GET_DIAGNOSTIC_BY_VEHICLE_ID_URL(vehicleId));
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(
        `Error fetching Technician Diagnostic for Vehicle ID ${vehicleId}.`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getDiagnosticByVehicleId:", error);
    throw error;
  }
};
