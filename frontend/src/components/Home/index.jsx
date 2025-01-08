import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleTabClick = (route) => {
    navigate(route);
  };

  return (
    <div className="side-menu">
      <div className="side-menu-item" onClick={() => handleTabClick("/vehicle-list")}>
        VEHICLE LIST
      </div>
      <div className="side-menu-item" onClick={() => handleTabClick("/vehicle-reception")}>
        VEHICLE RECEPTION
      </div>
      <div className="side-menu-item" onClick={() => handleTabClick("/diagnostic-list")}>
        DIAGNOSTIC
      </div>
      <div className="side-menu-item" onClick={() => handleTabClick("/estimates")}>
        ESTIMATES
      </div>
      <div className="side-menu-item" onClick={() => handleTabClick("/invoice")}>
        INVOICE
      </div>
      <div className="side-menu-item" onClick={() => handleTabClick("/reports")}>
        REPORTS
      </div>
    </div>
  );
};

export default Home;
