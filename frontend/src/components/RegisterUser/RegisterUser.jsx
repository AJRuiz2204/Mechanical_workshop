/* eslint-disable no-unused-vars */
// Frontend: src/components/RegisterUser/RegisterUser.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterUser.css";
import { Register } from "../../services/userService";

/**
 * RegisterUser Component
 * Handles new user registration by collecting user details and sending them to the backend service.
 *
 * @returns {JSX.Element} The RegisterUser component.
 */
const RegisterUser = () => {
  // State variables for managing form inputs
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("Manager");
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Generates a secure random password and updates the password state.
   * The password includes uppercase letters, lowercase letters, numbers, and symbols.
   */
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

  /**
   * Handles the form submission for user registration.
   * Sends the user data to the backend service and manages the response.
   *
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create the user data object
    const userData = {
      email,
      name,
      lastName,
      username,
      password,
      profile,
    };

    try {
      await Register(userData); // Call the Register function from the userService
      alert("User registered successfully.");

      // Clear the form fields after successful registration
      setEmail("");
      setName("");
      setLastName("");
      setUsername("");
      setPassword("");
      setProfile("Manager");
      setShowPassword(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  /**
   * Handles form cancellation by resetting all form fields.
   */
  const handleCancel = () => {
    setEmail("");
    setName("");
    setLastName("");
    setUsername("");
    setPassword("");
    setProfile("Manager");
    setShowPassword(false);
  };

  return (
    <div className="register-user-container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 register-user-card">
        <h2 className="text-center mb-4">REGISTER USER</h2>
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
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
              placeholder="Enter user email address"
              required
            />
          </div>

          {/* First Name Input */}
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
              placeholder="Enter user's first name"
              required
            />
          </div>

          {/* Last Name Input */}
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
              placeholder="Enter user's last name"
              required
            />
          </div>

          {/* Username Input */}
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              USERNAME
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          {/* Password Input with Generate and Show/Hide functionality */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              PASSWORD
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
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
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="form-text">
              The password must be at least 12 characters long, including
              uppercase letters, lowercase letters, numbers, and symbols.
            </div>
          </div>

          {/* Profile Selection */}
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
              <option value="Manager">Administrator</option>
              <option value="Technician">Mechanical Technician</option>
            </select>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              ADD USER
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;
