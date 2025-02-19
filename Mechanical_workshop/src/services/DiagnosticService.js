async function deleteDiagnostic(id) {
    const response = await fetch(`http://localhost:5121/api/Diagnostics/${id}`, {
        method: 'DELETE'
    });
    // Comprobar respuesta y extraer texto de error si no es exitosa.
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error deleting the diagnostic: ${errorText}`);
    }
    return response;
}

export { deleteDiagnostic };
