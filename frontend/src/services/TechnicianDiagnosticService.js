// src/services/TechnicianDiagnosticService.js

// Create TechnicianDiagnostic
export const createTechnicianDiagnostic = async (techDiagData) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(techDiagData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error creating the technician diagnostic.");
      }
    }
    return await response.json(); // TechnicianDiagnosticReadDto
  } catch (error) {
    console.error("Error in createTechnicianDiagnostic:", error);
    throw error;
  }
};

// Get TechnicianDiagnostic by ID
export const getTechnicianDiagnostic = async (id) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error fetching the technician diagnostic.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getTechnicianDiagnostic:", error);
    throw error;
  }
};

// Update TechnicianDiagnostic
export const updateTechnicianDiagnostic = async (id, techDiagData) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(techDiagData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error updating the technician diagnostic.");
      }
    }
    return;
  } catch (error) {
    console.error("Error in updateTechnicianDiagnostic:", error);
    throw error;
  }
};

// Delete TechnicianDiagnostic
export const deleteTechnicianDiagnostic = async (id) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error deleting the technician diagnostic.");
      }
    }
    return;
  } catch (error) {
    console.error("Error in deleteTechnicianDiagnostic:", error);
    throw error;
  }
};
