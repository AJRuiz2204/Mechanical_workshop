// src/services/DiagnosticService.js

export const createDiagnostic = async (diagnosticData) => {
  try {
    const response = await fetch("/api/Diagnostics", {
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

// Cargar la lista de diagnósticos
export const getDiagnostics = async () => {
  try {
    const response = await fetch("/api/Diagnostics"); // GET
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error al obtener diagnósticos.");
      }
    }
    return await response.json(); // array de DiagnosticReadDto
  } catch (error) {
    console.error("Error en getDiagnostics:", error);
    throw error;
  }
};


