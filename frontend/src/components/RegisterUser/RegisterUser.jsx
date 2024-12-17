/* eslint-disable no-unused-vars */
// Frontend: src/components/RegisterUser/RegisterUser.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterUser.css";
import { addUser } from "../../services/userService"; // Import the correct function

const RegisterUser = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("Administrator");
  const [showPassword, setShowPassword] = useState(false);

  // Function to generate a secure random password
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create the user data object
    const userData = {
      email,
      name,
      lastName,
      username,
      password,
      profile, // "Administrator" or "Mechanical Technician"
    };

    try {
      await addUser(userData); // Call the addUser function
      alert("User registered successfully.");

      // Clear the form
      setEmail("");
      setName("");
      setLastName("");
      setUsername("");
      setPassword("");
      setProfile("Administrator");
      setShowPassword(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
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
              placeholder="Enter user email address"
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
              placeholder="Enter user's first name"
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
              placeholder="Enter user's last name"
              required
            />
          </div>
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
              The password must be at least 12 characters long, including uppercase letters, lowercase letters, numbers, and symbols.
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
              <option value="Administrator">Administrator</option>
              <option value="Mechanical Technician">Mechanical Technician</option>
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
