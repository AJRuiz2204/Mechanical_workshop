/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";

const ManagerProtectedRoute = ({ children }) => {
  const location = useLocation();
  let user = {};

  try {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : {};
  } catch (error) {
    console.error("Error al parsear el usuario desde localStorage:", error);
    localStorage.removeItem("user");
  }

  if (user.profile !== "Manager") {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ManagerProtectedRoute;
