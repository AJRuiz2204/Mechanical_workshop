import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
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
    localStorage.removeItem("token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("user", user);
  console.log("Token", localStorage.getItem("token"));

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific role requirements, allow any authenticated user
  if (!requiredRole && !requiredRoles) {
    return <>{children}</>;
  }

  // Check if user object has profile property
  if (!user.profile) {
    console.error("User profile is missing", user);
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.profile)) {
    console.log("User profile not in required roles:", user.profile, "Required:", requiredRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole && user.profile !== requiredRole) {
    console.log("User profile doesn't match required role:", user.profile, "Required:", requiredRole);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
