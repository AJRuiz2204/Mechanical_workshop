// src/services/DiagnosticService.js

// Crear Diagnostic
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
        throw new Error("Error al crear el diagnóstico.");
      }
    }

    return await response.json(); // DiagnosticReadDto
  } catch (error) {
    console.error("Error en createDiagnostic:", error);
    throw error;
  }
};

// Obtener todos los Diagnostics
export const getDiagnostics = async () => {
  try {
    const response = await fetch(`/api/Diagnostics`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error al obtener la lista de diagnósticos.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getDiagnostics:", error);
    throw error;
  }
};

// Obtener Diagnostic por ID
export const getDiagnosticById = async (id) => {
  try {
    const response = await fetch(`/api/Diagnostics/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error al obtener el diagnóstico por ID.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getDiagnosticById:", error);
    throw error;
  }
};

// Actualizar Diagnostic
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
        throw new Error("Error al actualizar el diagnóstico.");
      }
    }
    return;
  } catch (error) {
    console.error("Error en updateDiagnostic:", error);
    throw error;
  }
};

// Eliminar Diagnostic
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
        throw new Error("Error al eliminar el diagnóstico.");
      }
    }
    return;
  } catch (error) {
    console.error("Error en deleteDiagnostic:", error);
    throw error;
  }
};
