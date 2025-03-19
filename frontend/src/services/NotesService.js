const BASE_API = import.meta.env.VITE_API_URL || "/api";

/**
 * getNotesByTechDiag - Retrieves notes associated with a specific Technician Diagnostic.
 * / Obtiene las notas asociadas a un Diagnóstico de Técnico específico.
 *
 * @async
 * @function getNotesByTechDiag
 * @param {number} techDiagId - The ID of the Technician Diagnostic to retrieve notes for.
 * @returns {Promise<Array>} An array of note objects.
 * @throws Will throw an error if the request fails.
 */
export const getNotesByTechDiag = async (techDiagId) => {
  try {
    const response = await fetch(
      `${BASE_API}/notes/techniciandiagnostic/${techDiagId}`
    );

    if (response.status === 404) {
      console.warn(
        `No notes found for Technician Diagnostic ID: ${techDiagId}`
      );
      return [];
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Error fetching notes.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getNotesByTechDiag:", error);
    throw error;
  }
};

/**
 * getNotesByDiagnostic - Retrieves notes associated with a specific Diagnostic.
 * / Obtiene las notas asociadas a un Diagnóstico específico.
 *
 * @async
 * @function getNotesByDiagnostic
 * @param {number} diagId - The ID of the Diagnostic to retrieve notes for.
 * @returns {Promise<Array>} An array of note objects.
 * @throws Will throw an error if the request fails.
 */
export const getNotesByDiagnostic = async (diagId) => {
  try {
    const response = await fetch(`${BASE_API}/notes/diagnostic/${diagId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Error fetching notes.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getNotesByDiagnostic:", error);
    throw error;
  }
};

/**
 * createNote - Creates a new note with the provided data.
 * / Crea una nueva nota con los datos proporcionados.
 *
 * @async
 * @function createNote
 * @param {Object} noteData - The data for the new note.
 * @param {number} [noteData.DiagnosticId] - ID of the associated Diagnostic.
 * @param {number} [noteData.TechnicianDiagnosticId] - ID of the associated Technician Diagnostic.
 * @param {string} noteData.Content - The text content of the note.
 * @returns {Promise<Object>} Returns the created note object.
 * @throws Will throw an error if the request fails.
 */
export const createNote = async (noteData) => {
  try {
    const response = await fetch(`${BASE_API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Error creating note.");
    }
    return await response.json(); // Returns the created note
  } catch (error) {
    console.error("Error in createNote:", error);
    throw error;
  }
};

/**
 * deleteNote - Deletes a note by its ID.
 * / Elimina una nota por su ID.
 *
 * @async
 * @function deleteNote
 * @param {number} noteId - The ID of the note to delete.
 * @throws Will throw an error if the request fails.
 */
export const deleteNote = async (noteId) => {
  try {
    const response = await fetch(`${BASE_API}/notes/${noteId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Error deleting note.");
    }
    return;
  } catch (error) {
    console.error("Error in deleteNote:", error);
    throw error;
  }
};
