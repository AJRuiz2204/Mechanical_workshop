// src/services/DiagnosticService.js

// Create Diagnostic
export const createDiagnostic = async (diagnosticData) => {
  try {
    const response = await fetch(`/api/Diagnostics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagnosticData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error creating the diagnostic.");
      }
    }

    return await response.json(); // DiagnosticReadDto
  } catch (error) {
    console.error("Error in createDiagnostic:", error);
    throw error;
  }
};

// Get All Diagnostics
export const getDiagnostics = async () => {
  try {
    const response = await fetch(`/api/Diagnostics`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error fetching the list of diagnostics.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getDiagnostics:", error);
    throw error;
  }
};

// Get Diagnostic by ID
export const getDiagnosticById = async (id) => {
  try {
    const response = await fetch(`/api/Diagnostics/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error fetching the diagnostic by ID.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getDiagnosticById:", error);
    throw error;
  }
};

// Update Diagnostic
export const updateDiagnostic = async (id, diagnosticData) => {
  try {
    const response = await fetch(`/api/Diagnostics/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagnosticData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error updating the diagnostic.");
      }
    }
    return;
  } catch (error) {
    console.error("Error in updateDiagnostic:", error);
    throw error;
  }
};

// Delete Diagnostic
export const deleteDiagnostic = async (id) => {
  try {
    const response = await fetch(`/api/Diagnostics/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error deleting the diagnostic.");
      }
    }
    return;
  } catch (error) {
    console.error("Error in deleteDiagnostic:", error);
    throw error;
  }
};
