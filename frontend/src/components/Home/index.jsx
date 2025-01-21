/* eslint-disable no-unused-vars */
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleTabClick = (route) => {
    navigate(route);
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const { profile, name, lastName } = user;

  return (
    <div className="side-menu">
      <div className="menu-items">
        <div
          className="side-menu-item"
          onClick={() => handleTabClick("/vehicle-list")}
        >
          VEHICLE LIST
        </div>
        <div
          className="side-menu-item"
          onClick={() => handleTabClick("/diagnostic-list")}
        >
          DIAGNOSTIC
        </div>
        <div
          className="side-menu-item"
          onClick={() => handleTabClick("/technicianDiagnosticList")}
          >
            MY DIAGNOSTICS
        </div>
        <div
          className="side-menu-item"
          onClick={() => handleTabClick("/estimates")}
        >
          ESTIMATES
        </div>
        <div
          className="side-menu-item"
          onClick={() => handleTabClick("/reports")}
        >
          REPORTS
        </div>
        <div
          className="side-menu-item"
          onClick={() => handleTabClick("/settings")}
        >
          SETTINGS
        </div>
      </div>
      <div className="welcome-message">
        Welcome {profile} {name} {lastName}
      </div>
    </div>
  );
};

export default Home;
