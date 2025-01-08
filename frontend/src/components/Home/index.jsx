import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import EstimateList from './Estimate/EstimateList';

const Home = () => {
  const navigate = useNavigate();

  const handleTabClick = (route) => {
    navigate(route);
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
            activeTab === "invoice" ? "active" : ""
          }`}
          onClick={() => handleTabClick("invoice")}
        >
          INVOICE
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
            activeTab === "accounts-receivable" ? "active" : ""
          }`}
          onClick={() => handleTabClick("accounts-receivable")}
        >
          ACCOUNTS RECEIVABLE
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
        {activeTab === "accounts-receivable" && (
          <div>Accounts Receivable Content</div>
        )}
        {activeTab === "reports" && <ShopReports />}
      </div>
    </div>
  );
};

export default Home;
