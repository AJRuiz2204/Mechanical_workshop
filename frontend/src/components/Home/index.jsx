/* eslint-disable no-unused-vars */
// src/components/Home/Home.jsx
import React, { useState } from 'react';
import './Home.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="home-container">
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      <div className={`side-menu-container ${isMenuOpen ? 'open' : ''}`}>
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
      </div>

      <div className="content-area">
        {activeTab === 'home' && <div>Home Content</div>}
        {activeTab === 'vehicle-reception' && <div>Vehicle Reception Content</div>}
        {activeTab === 'diagnostic' && <div>Diagnostic Content</div>}
        {activeTab === 'estimates' && <div>Estimates Content</div>}
        {activeTab === 'invoice' && <div>Invoice Content</div>}
        {activeTab === 'invoice-history' && <div>Invoice History Content</div>}
        {activeTab === 'accounts-receivable' && <div>Accounts Receivable Content</div>}
        {activeTab === 'reports' && <div>Reports Content</div>}
      </div>
    </div>
  );
};

export default Home;
