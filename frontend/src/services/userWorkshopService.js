// src/services/userWorkshopService.js
export const addUserWorkshop = async (userData) => {
    const response = await fetch("http://localhost:5232/api/userworkshop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al crear el usuario del taller");
    }
  
    return response.json();
  };
  