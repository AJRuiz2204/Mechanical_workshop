const BASE_API = import.meta.env.VITE_API_URL || "/api";

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
  const response = await fetch(`${BASE_API}/Users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.Message || "Error creating the user.");
  }

  return await response.json();
};
