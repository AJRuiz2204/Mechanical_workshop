// Frontend: src/services/TechnicianDiagnosticService.js

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

// Get TechnicianDiagnostic by Diagnostic ID
export const getTechnicianDiagnosticByDiagId = async (diagnosticId) => {
  try {
    const response = await fetch(
      `/api/TechnicianDiagnostics/byDiagnostic/${diagnosticId}`
    );

    if (response.status === 404) {
      throw new Error("Not found");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error fetching technician diagnostic"
      );
    }

    return await response.json();
  } catch (error) {
    if (error.message !== "Not found") {
      console.error("Error in getTechnicianDiagnosticByDiagId:", error);
    }
    throw error;
  }
};

// Get TechnicianDiagnostics Batch
export const getTechnicianDiagnosticsBatch = async (diagnosticIds) => {
  try {
    const idsParam = diagnosticIds.join("&diagnosticIds=");
    const response = await fetch(
      `/api/TechnicianDiagnostics/byDiagnostics?diagnosticIds=${idsParam}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error fetching batch diagnostics");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getTechnicianDiagnosticsBatch:", error);
    throw error;
  }
};
