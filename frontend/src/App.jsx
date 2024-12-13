/* eslint-disable no-unused-vars */
// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/login/Login"; // Asegúrate de que la ruta es correcta

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default App;
