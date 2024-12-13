/* eslint-disable no-unused-vars */
// src/components/RegisterUser/RegisterUser.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterUser.css";

const RegisterUser = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("Administrador");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Función para generar una contraseña aleatoria segura
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let generatedPassword = "";
    for (let i = 0; i < 12; i++) {
      generatedPassword += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }
    setPassword(generatedPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Name:", name);
    console.log("Last Name:", lastName);
    console.log("Password:", password);
    console.log("Profile:", profile);
    console.log("Role:", role);
    // Simulamos una confirmación
    alert("Usuario registrado exitosamente.");
    // Limpiar el formulario
    setEmail("");
    setName("");
    setLastName("");
    setPassword("");
    setProfile("Administrador");
    setRole("");
    setShowPassword(false); // Resetear la visibilidad de la contraseña
  };

  return (
    <div className="register-user-container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 register-user-card">
        <h2 className="text-center mb-4">REGISTER USER</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              EMAIL
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              NAME
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">
              LAST NAME
            </label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              PASSWORD
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"} // Cambiar tipo basado en el estado
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
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
                onClick={() => setShowPassword(!showPassword)} // Toggle de visibilidad
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                } // Mejora de accesibilidad
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="form-text">
              La contraseña debe tener al menos 12 caracteres, incluyendo
              mayúsculas, minúsculas, números y símbolos.
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="profile" className="form-label">
              PROFILE
            </label>
            <select
              className="form-select"
              id="profile"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            >
              <option value="Administrador">Administrador</option>
              <option value="Técnico de Mecánica">Técnico de Mecánica</option>
            </select>
          </div>
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              ADD USER
            </button>
            <Link to="/" className="btn btn-secondary text-decoration-none">
              CANCEL
            </Link>
          </div>
        </form>
        <div className="text-center mt-3">
          <Link to="/" className="text-decoration-none">
            ← BACK TO LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
