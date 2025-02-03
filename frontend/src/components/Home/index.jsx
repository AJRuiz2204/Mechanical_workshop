/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/UserLoginServices"; // Service for logging out
import "./Home.css";

/**
 * Home Component
 *
 * This component renders the main home page which includes a side menu and a content area.
 * The side menu displays different navigation items based on the user's role,
 * and includes a welcome message and a logout button.
 *
 * The main content area is used to display the content for the selected route.
 *
 * @returns {JSX.Element} The Home component.
 */
const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Define the menu items with their labels, routes, and the roles that can view them.
  const menuItems = [
    {
      label: "VEHICLE RECEPTION",
      route: "/vehicle-list",
      roles: ["Manager"],
    },
    {
      label: "DIAGNOSTIC",
      route: "/diagnostic-list",
      roles: ["Manager"],
    },
    {
      label: "ESTIMATES",
      route: "/estimates",
      roles: ["Manager"],
    },
    {
      label: "REPORTS",
      route: "/reports",
      roles: ["Manager"],
    },
    {
      label: "MY DIAGNOSTICS",
      route: "/technicianDiagnosticList",
      roles: ["Technician"],
    },
    {
      label: "ACCOUNTS RECEIVABLE",
      route: "/accounts-receivable",
      roles: ["Manager"],
    },
    {
      label: "PAYMENT LIST",
      route: "/payment-list",
      roles: ["Manager"],
    },
    {
      label: "SETTINGS",
      route: "/settings",
      roles: ["Manager"],
    },
    {
      label: "ADD USER",
      route: "/register-user",
      roles: ["Manager"],
    },
  ];

  // When the component mounts, retrieve the user data from localStorage.
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  /**
   * handleTabClick - Handles the click event on a menu item and navigates to the specified route.
   *
   * @param {string} route - The route to navigate to.
   */
  const handleTabClick = (route) => {
    navigate(route);
  };

  /**
   * handleLogout - Handles the logout action by calling the logout service and navigating to the login page.
   */
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (!user) {
    // Display a loading message while the user information is being retrieved.
    return <div>Loading...</div>;
  }

  // Filter menu items based on the user's profile (role).
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.profile)
  );

  return (
    <div className="home-container">
      {/* Side Menu */}
      <div className="side-menu">
        {/* Menu Items */}
        <div className="menu-items">
          {filteredMenuItems.map((item) => (
            <button
              key={item.route}
              className="side-menu-item"
              onClick={() => handleTabClick(item.route)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {/* Welcome Message and Logout Button */}
        <div className="welcome-section">
          <div className="welcome-message">
            Welcome {user.profile} {user.name} {user.lastName}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="content-area">
        {/* Additional components or routes can be included here */}
      </div>
    </div>
  );
};

export default Home;
