/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Home.css";
import VehicleReception from "./VehicleReception/VehicleReception";
import VehicleList from "./VehicleList/VehicleList";
import Diagnostic from "./Diagnostic/Diagnostic";
import DiagnosticList from "./Diagnostic/DiagnosticList";
import TechnicianDiagnostic from "./Diagnostic/TechnicianDiagnostic";
import Estimate from "./Estimate/Estimate";
import Invoice from "./Invoice/Invoice";
import ShopReports from "./Reports/ShopReports";
import EstimateList from './Estimate/EstimateList';

const Home = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [diagnosticSubTab, setDiagnosticSubTab] = useState("list");
  const location = useLocation();

  useEffect(() => {
    // Actualiza el tab activo basado en la ruta actual
    if (location.pathname === "/vehicle-reception") {
      setActiveTab("vehicle-reception");
    } else if (location.pathname === "/vehicle-list") {
      setActiveTab("vehicle-list");
    } else if (location.pathname === "/home") {
      setActiveTab("home");
    } else {
      // Otros casos para diferentes rutas que puedas tener
      setActiveTab("home");
    }
  }, [location]); // Recalcular cuando cambie la ruta

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleDiagnosticSubTabClick = (subTab) => {
    setDiagnosticSubTab(subTab);
  };

  return (
    <div className="home-container">
      <div className="side-menu">
        <div
          className={`side-menu-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => handleTabClick("home")}
        >
          HOME
        </div>
        <div
          className={`side-menu-item ${
            activeTab === "vehicle-list" ? "active" : ""
          }`}
          onClick={() => handleTabClick("vehicle-list")}
        >
          VEHICLE LIST
        </div>
        <div
          className={`side-menu-item ${
            activeTab === "diagnostic" ? "active" : ""
          }`}
          onClick={() => handleTabClick("diagnostic")}
        >
          DIAGNOSTIC
        </div>
        <div
          className={`side-menu-item ${
            activeTab === "estimates" ? "active" : ""
          }`}
          onClick={() => handleTabClick("estimates")}
        >
          ESTIMATES
        </div>
        <div
          className={`side-menu-item ${
            activeTab === "invoice-history" ? "active" : ""
          }`}
          onClick={() => handleTabClick("invoice-history")}
        >
          INVOICE HISTORY
        </div>
        <div
          className={`side-menu-item ${
            activeTab === "reports" ? "active" : ""
          }`}
          onClick={() => handleTabClick("reports")}
        >
          REPORTS
        </div>
      </div>

      <div className="content-area">
        {activeTab === "home"}
        {activeTab === "vehicle-list" && <VehicleList />}
        {activeTab === "diagnostic" && <DiagnosticList />}
        {activeTab === "estimates" && <Estimate />}
        {activeTab === "invoice" && <Invoice />}
        {activeTab === "invoice-history" && <div><EstimateList /></div>}
        {activeTab === "reports" && <ShopReports />}
      </div>
    </div>
  );
};

export default Home;
