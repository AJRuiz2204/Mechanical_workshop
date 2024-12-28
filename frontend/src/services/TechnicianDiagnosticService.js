// src/services/TechnicianDiagnosticService.js

// Crear TechnicianDiagnostic
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
        throw new Error("Error al crear el diagnóstico técnico.");
      }
    }
    return await response.json(); // TechnicianDiagnosticReadDto
  } catch (error) {
    console.error("Error en createTechnicianDiagnostic:", error);
    throw error;
  }
};

// Obtener TechnicianDiagnostic por ID
export const getTechnicianDiagnostic = async (id) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error al obtener el diagnóstico técnico.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getTechnicianDiagnostic:", error);
    throw error;
  }
};

// Actualizar TechnicianDiagnostic
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
        throw new Error("Error al actualizar el diagnóstico técnico.");
      }
    }
    return;
  } catch (error) {
    console.error("Error en updateTechnicianDiagnostic:", error);
    throw error;
  }
};

// Eliminar TechnicianDiagnostic
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
        throw new Error("Error al eliminar el diagnóstico técnico.");
      }
    }
    return;
  } catch (error) {
    console.error("Error en deleteTechnicianDiagnostic:", error);
    throw error;
  }
};
