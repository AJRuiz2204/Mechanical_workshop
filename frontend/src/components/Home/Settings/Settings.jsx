/* eslint-disable no-unused-vars */
// src/components/Settings/Settings.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkshopSettingsForm from "./WorkshopSettingsForm";
import LaborTaxMarkupSettingsForm from "./LaborTaxMarkupSettingsForm";
import "./Settings.css";

/**
 * Settings Component
 *
 * Description:
 * The Settings component serves as a container for different settings forms related to the workshop.
 * It provides a tabbed interface allowing users to switch between PDF Settings and Labor Settings.
 * Depending on the active tab, the corresponding form is displayed.
 *
 * Features:
 * - Tabbed navigation between PDF Settings and Labor Settings.
 * - Integration of WorkshopSettingsForm and LaborTaxMarkupSettingsForm components.
 * - Responsive design with active tab highlighting.
 *
 * Usage:
 * This component is typically rendered within a route dedicated to application settings.
 */
const Settings = () => {
  const navigate = useNavigate();

  // Local state to control the active tab ('pdf' or 'labor')
  const [activeTab, setActiveTab] = useState("pdf"); // 'pdf' or 'labor'

  /**
   * handleTabClick Function
   *
   * Description:
   * Updates the activeTab state based on the tab clicked by the user.
   *
   * @param {string} tabName - The name of the tab to activate ('pdf' or 'labor').
   */
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  /**
   * handleTabClicknav Function
   *
   * Description:
   * Navigates to a different route when a tab is clicked.
   * Useful if you want tabs to correspond to different routes.
   *
   * @param {string} route - The route path to navigate to.
   */
  const handleTabClicknav = (route) => {
    navigate(route);
  };

  return (
    <div className="settings-container">
      {/* Header or General Title */}
      <h2>Settings</h2>

      {/* Tabs Bar */}
      <div className="settings-tabs">
        {/* PDF Settings Tab */}
        <div
          className={`settings-tab ${activeTab === "pdf" ? "active" : ""}`}
          onClick={() => handleTabClick("pdf")}
        >
          PDF Settings
        </div>
        {/* Labor Settings Tab */}
        <div
          className={`settings-tab ${activeTab === "labor" ? "active" : ""}`}
          onClick={() => handleTabClick("labor")}
        >
          Labor Settings
        </div>
      </div>

      {/* Conditional Content Based on Active Tab */}
      <div className="settings-content">
        {/* PDF Settings Content */}
        {activeTab === "pdf" && (
          <div>
            <WorkshopSettingsForm />
          </div>
        )}
        {/* Labor Settings Content */}
        {activeTab === "labor" && (
          <div>
            <h3>Labor Settings</h3>
            <LaborTaxMarkupSettingsForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
