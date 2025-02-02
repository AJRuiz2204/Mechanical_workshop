import emailjs from "emailjs-com";
import axios from "axios";

const API_URL = "http://localhost:5121/api/Users";

/**
 * loginUser
 * Inicia sesión de un usuario con las credenciales dadas.
 * This function logs in a user with the given credentials.
 *
 * @async
 * @function
 * @param {Object} credentials - Credenciales del usuario (por ejemplo, { email, password }).
 * @returns {Promise<Object>} El objeto de sesión o token devuelto por el servidor.
 * @throws Lanzará un error si la solicitud falla.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * isLoggedIn
 * Verifica si un usuario está autenticado.
 * This function checks if a user is logged in.
 *
 * @function
 * @returns {boolean} `true` si hay un token en localStorage; de lo contrario, `false`.
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

/**
 * logoutUser
 * Cierra la sesión del usuario.
 * This function logs out the user.
 *
 * @function
 * @returns {void}
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * forgotPassword
 * Solicita un código de reinicio de contraseña enviando el correo.
 * This function requests a password reset code by sending the user's email.
 *
 * @async
 * @function
 * @param {string} email - El correo electrónico del usuario.
 * @returns {Promise<string>} El código devuelto por el backend.
 * @throws Lanzará un error si la solicitud falla.
 */
export const forgotPassword = async (email) => {
  try {
    const response = await fetch("/api/Users/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || "Error requesting password reset.");
    }

    const data = await response.json();
    console.log("Code received from backend:", data.code);
    return data.code; // Returns the code
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    throw error;
  }
};

/**
 * sendEmailWithCode
 * Envía un correo electrónico con un código de verificación usando EmailJS.
 * This function sends an email with a verification code using EmailJS.
 *
 * @async
 * @function
 * @param {string} email - El correo electrónico del usuario al que se enviará el código.
 * @param {string|number} code - El código que se incluirá en el correo.
 * @returns {Promise<Object>} El resultado de la operación de EmailJS.
 * @throws Lanzará un error si el envío del correo falla.
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
 * Verifica el código recibido para el reinicio de contraseña.
 * This function verifies the reset code received for password reset.
 *
 * @async
 * @function
 * @param {string} email - El correo electrónico del usuario.
 * @param {string|number} code - El código a verificar.
 * @returns {Promise<Object|string>} El mensaje o JSON devuelto por el backend.
 * @throws Lanzará un error si la verificación falla.
 */
export const verifyCode = async (email, code) => {
  try {
    const response = await fetch("/api/Users/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, Code: code }),
    });

    let data;
    const contentType = response.headers.get("Content-Type");

    // Check if the response is JSON or plain text
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.Message || "Invalid or expired code.");
    }

    console.log("Code verified successfully:", data);
    return data; // Returns the message or JSON from the backend
  } catch (error) {
    console.error("Error in verifyCode:", error);
    throw error;
  }
};

/**
 * changePassword
 * Cambia la contraseña del usuario después de verificar el código.
 * This function changes the user's password after the code is verified.
 *
 * @async
 * @function
 * @param {string} email - El correo electrónico del usuario.
 * @param {string} newPassword - La nueva contraseña.
 * @returns {Promise<Object>} La respuesta del backend que contiene un mensaje y detalles del usuario afectado.
 * @throws Lanzará un error si la solicitud falla.
 */
export const changePassword = async (email, newPassword) => {
  try {
    const response = await fetch("/api/Users/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, NewPassword: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || "Error changing the password.");
    }

    const data = await response.json();
    console.log("Password changed successfully:", data.Message);
    console.log("Affected user:", data.User);
    return data; // Returns the backend response
  } catch (error) {
    console.error("Error in changePassword:", error);
    throw error;
  }
};
