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
import VehicleList from "./components/Home/VehicleList/VehicleList";
import Diagnostic from "./components/Home/Diagnostic/Diagnostic";

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
      <Route path="/vehicle-list" element={<VehicleList />} />
      <Route path="/create" element={<VehicleReception />} />
      <Route path="/edit/:vin" element={<VehicleReception />} />
      <Route path="/diagnostic/:id" element={<Diagnostic />} />
    </Routes>
  );
};

export default App;
