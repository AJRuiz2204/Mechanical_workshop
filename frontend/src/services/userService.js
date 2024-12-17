/* eslint-disable no-useless-catch */
// Frontend: src/services/userService.js
export const addUser = async (userData) => {
  try {
    const response = await fetch("/api/Users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.Message || "Error al crear el usuario.");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
