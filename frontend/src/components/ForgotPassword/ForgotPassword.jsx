/* eslint-disable no-unused-vars */
// src/components/forgotPassword/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    alert(
      "Se han enviado las instrucciones de restablecimiento de contraseña."
    );
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 forgot-password-card">
        <h2 className="text-center mb-4">FORGOT PASSWORD</h2>
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
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              SUBMIT
            </button>
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

export default ForgotPassword;
