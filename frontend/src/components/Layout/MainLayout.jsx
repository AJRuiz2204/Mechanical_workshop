import { Outlet, useLocation } from "react-router-dom";
import Home from "../Home/index";

const MainLayout = () => {
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/login") {
    return <Outlet />;
  }

  return <Home />;
};

export default MainLayout;
