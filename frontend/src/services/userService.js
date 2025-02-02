/* eslint-disable no-useless-catch */
// Frontend: src/services/userService.js

/**
 * Register
 * Registra un nuevo usuario.
 * This function registers a new user.
 *
 * @async
 * @function
 * @param {Object} userData - The data for the new user, including fields like username, password, and email.
 * @returns {Promise<Object>} Returns the created user data as JSON.
 * @throws Will throw an error if the registration fails.
 */
export const Register = async (userData) => {
  try {
    const response = await fetch("http://localhost:5121/api/Users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.Message || "Error creating the user.");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
