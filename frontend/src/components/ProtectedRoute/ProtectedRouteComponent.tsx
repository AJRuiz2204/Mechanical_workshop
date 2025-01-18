import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.profile !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
