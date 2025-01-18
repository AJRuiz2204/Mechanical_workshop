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
      <div className="content" style={{ flexGrow: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;