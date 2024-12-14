/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import './Home.css';
import VehicleReception from './VehicleReception/VehicleReception';
import VehicleList from './VehicleList/VehicleList';
import Diagnostic from './Diagnostic/Diagnostic';
import DiagnosticList from './Diagnostic/DiagnosticList';
import TechnicianDiagnostic from './Diagnostic/TechnicianDiagnostic';
import Estimate from './Estimate/Estimate';
import Invoice from './Invoice/Invoice';
import ShopReports from './Reports/ShopReports';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [diagnosticSubTab, setDiagnosticSubTab] = useState('list');

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
          className={`side-menu-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleTabClick('home')}
        >
          HOME
        </div>
        <div
          className={`side-menu-item ${activeTab === 'vehicle-reception' ? 'active' : ''}`}
          onClick={() => handleTabClick('vehicle-reception')}
        >
          VEHICLE RECEPTION
        </div>
        <div
          className={`side-menu-item ${activeTab === 'diagnostic' ? 'active' : ''}`}
          onClick={() => handleTabClick('diagnostic')}
        >
          DIAGNOSTIC
        </div>
        <div
          className={`side-menu-item ${activeTab === 'estimates' ? 'active' : ''}`}
          onClick={() => handleTabClick('estimates')}
        >
          ESTIMATES
        </div>
        <div
          className={`side-menu-item ${activeTab === 'invoice' ? 'active' : ''}`}
          onClick={() => handleTabClick('invoice')}
        >
          INVOICE
        </div>
        <div
          className={`side-menu-item ${activeTab === 'invoice-history' ? 'active' : ''}`}
          onClick={() => handleTabClick('invoice-history')}
        >
          INVOICE HISTORY
        </div>
        <div
          className={`side-menu-item ${activeTab === 'accounts-receivable' ? 'active' : ''}`}
          onClick={() => handleTabClick('accounts-receivable')}
        >
          ACCOUNTS RECEIVABLE
        </div>
        <div
          className={`side-menu-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => handleTabClick('reports')}
        >
          REPORTS
        </div>
      </div>

      <div className="content-area">
        {activeTab === 'home' && <VehicleList />}
        {activeTab === 'vehicle-reception' && <VehicleReception />}
        {activeTab === 'diagnostic' && (
          <div>
            <div className="diagnostic-tabs">
              <div
                className={`diagnostic-tab ${diagnosticSubTab === 'list' ? 'active' : ''}`}
                onClick={() => handleDiagnosticSubTabClick('list')}
              >
                Diagnostic List
              </div>
              <div
                className={`diagnostic-tab ${diagnosticSubTab === 'vehicle' ? 'active' : ''}`}
                onClick={() => handleDiagnosticSubTabClick('vehicle')}
              >
                Diagnostic Vehicle
              </div>
              <div
                className={`diagnostic-tab ${diagnosticSubTab === 'technical' ? 'active' : ''}`}
                onClick={() => handleDiagnosticSubTabClick('technical')}
              >
                Technical Diagnostic
              </div>
            </div>

            <div className="diagnostic-content">
              {diagnosticSubTab === 'list' && <DiagnosticList />}
              {diagnosticSubTab === 'vehicle' && <Diagnostic />}
              {diagnosticSubTab === 'technical' && <TechnicianDiagnostic />}
            </div>
          </div>
        )}
        {activeTab === 'estimates' && <Estimate />}
        {activeTab === 'invoice' && <Invoice />}
        {activeTab === 'invoice-history' && <div>Invoice History Content</div>}
        {activeTab === 'accounts-receivable' && <div>Accounts Receivable Content</div>}
        {activeTab === 'reports' && <ShopReports />}
      </div>
    </div>
  );
};

export default Home;
