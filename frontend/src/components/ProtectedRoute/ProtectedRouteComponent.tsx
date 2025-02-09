import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
}

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredRoles,
}: ProtectedRouteProps) => {
  const location = useLocation();
  let user: any = {};

  try {
    const userString = localStorage.getItem("user");
    user = userString ? JSON.parse(userString) : {};
  } catch (error) {
    console.error("Error al parsear el usuario desde localStorage:", error);
    localStorage.removeItem("user");
  }

  console.log("user", user);
  console.log("Token", localStorage.getItem("token")); // Obtener el token directamente

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.profile)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole && user.profile !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
