import emailjs from "emailjs-com";
import api from "./api";

/**
 * loginUser
 * Logs in a user with the given credentials.
 *
 * @async
 * @function loginUser
 * @param {Object} credentials - User credentials (e.g., { email, password }).
 * @returns {Promise<Object>} The session object or token returned by the server.
 * @throws Will throw an error if the request fails.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post(`/Users/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * isLoggedIn
 * Checks if a user is logged in.
 *
 * @function isLoggedIn
 * @returns {boolean} `true` if a token exists in localStorage; otherwise, `false`.
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

/**
 * logoutUser
 * Logs out the user.
 *
 * @function logoutUser
 * @returns {void}
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * forgotPassword
 * Requests a password reset code by sending the user's email.
 *
 * @async
 * @function forgotPassword
 * @param {string} email - The user's email address.
 * @returns {Promise<string>} The code returned by the backend.
 * @throws Will throw an error if the request fails.
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post(`/Users/forgot-password`, { email }, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Code received from backend:", response.data.code);
    return response.data.code;
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    throw new Error(error.response?.data?.Message || "Error requesting password reset.");
  }
};

/**
 * sendEmailWithCode
 * Sends an email with a verification code using EmailJS.
 *
 * @async
 * @function sendEmailWithCode
 * @param {string} email - The user's email address to which the code will be sent.
 * @param {string|number} code - The code to include in the email.
 * @returns {Promise<Object>} The result of the EmailJS operation.
 * @throws Will throw an error if sending the email fails.
 */
export const sendEmailWithCode = async (email, code) => {
  const templateParams = {
    to_email: email,
    verification_code: code.toString(),
  };

  console.log("Parameters sent to EmailJS:", templateParams);

  try {
    const result = await emailjs.send(
      "service_9tqk6il", // Your Service ID
      "template_9uo1y37", // Your Template ID
      templateParams,
      "FKbbn9NFIEk2ZxxX7" // Your Public Key
    );

    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending the email:", error);
    throw new Error("Error sending the email.");
  }
};

/**
 * verifyCode
 * Verifies the reset code received for password reset.
 *
 * @async
 * @function verifyCode
 * @param {string} email - The user's email address.
 * @param {string|number} code - The code to verify.
 * @returns {Promise<Object|string>} The message or JSON returned by the backend.
 * @throws Will throw an error if the verification fails.
 */
export const verifyCode = async (email, code) => {
  try {
    const response = await api.post(`/Users/verify-code`, { Email: email, Code: code }, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in verifyCode:", error);
    throw new Error(error.response?.data?.Message || "Invalid or expired code.");
  }
};

/**
 * changePassword
 * Changes the user's password after the reset code is verified.
 *
 * @async
 * @function changePassword
 * @param {string} email - The user's email address.
 * @param {string} newPassword - The new password.
 * @returns {Promise<Object>} The backend response containing a message and details of the affected user.
 * @throws Will throw an error if the request fails.
 */
export const changePassword = async (email, newPassword) => {
  try {
    const response = await api.post(`/Users/change-password`, { Email: email, NewPassword: newPassword }, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Password changed successfully:", response.data.Message);
    console.log("Affected user:", response.data.User);
    return response.data;
  } catch (error) {
    console.error("Error in changePassword:", error);
    throw new Error(error.response?.data?.Message || "Error changing the password.");
  }
};
