/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Home from "../Home/index"; // Sidebar

const MainLayout = () => {
  const location = useLocation();

  // Si la ruta es login, no mostramos el sidebar
  if (location.pathname === "/" || location.pathname === "/login") {
    return <Outlet />; // Solo renderiza la vista sin sidebar
  }

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Home /> {/* Sidebar */}
      <div className="content" style={{ flexGrow: 1, padding: "20px" }}>
        <Outlet /> {/* Renderiza el contenido de la ruta actual */}
      </div>
    </div>
  );
};

export default MainLayout;
