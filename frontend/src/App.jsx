/* eslint-disable no-unused-vars */
// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import RegisterUser from "./components/RegisterUser/RegisterUser";
import Home from "./components/Home/index";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register-user" element={<RegisterUser />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<h2 className="text-center mt-5">404 - Page Not Found</h2>} />
    </Routes>
  );
};

export default App;
