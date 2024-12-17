/* eslint-disable no-unused-vars */
// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import RegisterUser from "./components/RegisterUser/RegisterUser";
import Home from "./components/Home/index";
import VehicleReception from "./components/Home/VehicleReception/VehicleReception";
import ChangePassword from "./components/ForgotPassword/ChangePassword";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register-user" element={<RegisterUser />} />
      <Route path="/home" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/vehicle-reception" element={<VehicleReception />} />
      <Route path="/change-password" element={<ChangePassword />} />
    </Routes>
  );
};

export default App;
