import api from "./api";

/**
 * Register
 * Registers a new user.
 *
 * @async
 * @function Register
 * @param {Object} userData - The data for the new user, including fields like username, password, and email.
 * @returns {Promise<Object>} Returns the created user data as JSON.
 * @throws Will throw an error if the registration fails.
 */
export const Register = async (userData) => {
  try {
    const response = await api.post(`/Users/register`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.Message || "Error creating the user.");
  }
};
