/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { changePassword } from "../../services/UserLoginServices";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  // Generar una contraseña aleatoria segura
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let generatedPassword = "";
    for (let i = 0; i < 12; i++) {
      generatedPassword += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }
    setNewPassword(generatedPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      await changePassword(email, newPassword); // Llama al servicio
      alert("Contraseña cambiada exitosamente.");
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al cambiar la contraseña.");
    }
  };
  
  

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">CHANGE PASSWORD</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              NEW PASSWORD
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={generatePassword}
              >
                Generate Password
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="form-text">
              La contraseña debe tener al menos 12 caracteres, incluyendo
              mayúsculas, minúsculas, números y símbolos.
            </div>
          </div>
          {error && <div className="text-danger mb-3">{error}</div>}
          {success && (
            <div className="text-success mb-3">¡Contraseña cambiada exitosamente!</div>
          )}
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              CHANGE PASSWORD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
