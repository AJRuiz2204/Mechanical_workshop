/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Home from "../Home/index";

const MainLayout = () => {
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/login") {
    return <Outlet />;
  }

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Home />
    </div>
  );
};

export default MainLayout;
