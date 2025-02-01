/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/UserLoginServices"; // New import
import "./Home.css";

/**
 * Home Component
 * Renders a side menu with navigation items based on the user's role.
 * Includes a logout button to allow users to sign out of the application.
 *
 * @returns {JSX.Element} The Home component.
 */
const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Define menu items with their corresponding roles
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
      label: "SETTINGS",
      route: "/settings",
      roles: ["Manager"],
    },
    {
      label: "ADD USER",
      route: "/register-user",
      roles: ["Manager"],
    },
    {
      label: "CHANGE PASSWORD",
      route: "/change-password",
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
    }
  ];

  /**
   * Fetches the user data from localStorage when the component mounts.
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        // Optional: handle the error, e.g., redirect to login
      }
    } else {
      // Optional: handle the case when there is no user, e.g., redirect to login
    }
  }, []);

  /**
   * Handles the click event on a menu item by navigating to the specified route.
   *
   * @param {string} route - The route to navigate to.
   */
  const handleTabClick = (route) => {
    navigate(route);
  };

  /**
   * Handles user logout by calling the logout service and navigating to the login page.
   */
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (!user) {
    // Optional: show a loader or message while fetching the user
    return <div>Loading...</div>;
  }

  const { profile, name, lastName } = user;

  // Filter the menu items based on the user's profile
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(profile)
  );

  return (
    <div className="side-menu">
      <div className="menu-items">
        {filteredMenuItems.map((item) => (
          <div
            key={item.route}
            className="side-menu-item"
            onClick={() => handleTabClick(item.route)}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className="welcome-section">
        <div className="welcome-message">
          Welcome {profile} {name} {lastName}
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
