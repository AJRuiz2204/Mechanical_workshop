// Frontend: src/services/NotesService.js

// Get notes by TechnicianDiagnostic ID
export const getNotesByTechDiag = async (techDiagId) => {
    try {
      const response = await fetch(`/api/notes/techniciandiagnostic/${techDiagId}`);
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
  
  // Create a new note
  export const createNote = async (noteData) => {
    try {
      const response = await fetch(`/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error creating note.");
      }
      return await response.json(); // NoteReadDto
    } catch (error) {
      console.error("Error in createNote:", error);
      throw error;
    }
  };
  
  // Delete a note by ID
  export const deleteNote = async (noteId) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
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
  