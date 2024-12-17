export const createUserWorkshop = async (userWorkshopData) => {
  try {
    const response = await fetch("/api/UserWorkshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userWorkshopData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || "Error al crear el usuario del taller.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createUserWorkshop:", error);
    throw error;
  }
};
