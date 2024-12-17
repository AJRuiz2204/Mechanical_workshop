/* eslint-disable no-unused-vars */
// Frontend: src/components/logout/Logout.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  return null;
};

export default Logout;
