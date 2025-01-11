/* eslint-disable no-unused-vars */
// src/components/Settings/Settings.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkshopSettingsForm from "./WorkshopSettingsForm";
import LaborTaxMarkupSettingsForm from "./LaborTaxMarkupSettingsForm";
import "./Settings.css";

const Settings = () => {
    const navigate = useNavigate();
  // Estado local para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("pdf"); // 'pdf' o 'labor'

  // Función para cambiar de pestaña
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };
  const handleTabClicknav = (route) => {
    navigate(route);
  };

  return (
    <div className="settings-container">
      {/* Encabezado o Título General */}
      <h2>Settings</h2>

      {/* Barra de Tabs */}
      <div className="settings-tabs">
        <div
          className={`settings-tab ${activeTab === "pdf" ? "active" : ""}`}
          onClick={() => handleTabClick("pdf")}
        >
          PDF Settings
        </div>
        <div
          className={`settings-tab ${activeTab === "labor" ? "active" : ""}`}
          onClick={() => handleTabClick("labor")}
        >
          Labor Settings
        </div>
      </div>

      {/* Contenido Condicional según la pestaña activa */}
      <div className="settings-content">
        {activeTab === "pdf" && (
          <div>
            <WorkshopSettingsForm />
          </div>
        )}
        {activeTab === "labor" && (
          <div >
            <h3>Labor Settings</h3>
            <LaborTaxMarkupSettingsForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
