/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import RegisterUser from "./components/RegisterUser/RegisterUser";
import VehicleReception from "./components/Home/VehicleReception/VehicleReception";
import ChangePassword from "./components/ForgotPassword/ChangePassword";
import VehicleList from "./components/Home/VehicleList/VehicleList";
import Diagnostic from "./components/Home/Diagnostic/Diagnostic";
import TechnicianDiagnostic from "./components/Home/Diagnostic/TechnicianDiagnostic";
import DiagnosticList from "./components/Home/Diagnostic/DiagnosticList";
import TechnicianDiagnosticEdit from "./components/Home/Diagnostic/TechnicianDiagnosticEdit";
import EstimateList from "./components/Home/Estimate/EstimateList";
import Estimate from "./components/Home/Estimate/Estimate";
import MainLayout from "./components/Layout/MainLayout";
import Home from "./components/Home/index";
import WorkshopSettingsForm from "./components/Home/Settings/WorkshopSettingsForm";
import Settings from "./components/Home/Settings/Settings";
import ShopReports from "./components/Home/Reports/ShopReports";
import Invoice from "./components/Home/Invoice/Invoice";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRouteComponent";
import ErrorBoundary from "./components/ProtectedRoute/ErrorBoundary";
import TechnicianDiagnosticList from "./components/Home/Diagnostic/TechnicianDiagnosticList";

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route path="/home" element={<Home />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/vehicle-reception"
            element={
              <ProtectedRoute requiredRole="Manager">
                <VehicleReception />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicle-list"
            element={
              <ProtectedRoute requiredRole="Manager">
                <VehicleList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:vin"
            element={
              <ProtectedRoute requiredRole="Manager">
                <VehicleReception />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnostic/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Diagnostic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicianDiagnostic/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <TechnicianDiagnostic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicianDiagnostic/edit/:techDiagId"
            element={
              <ProtectedRoute requiredRole="Manager">
                <TechnicianDiagnosticEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicianDiagnostic/create/:diagnosticId"
            element={
              <ProtectedRoute requiredRole="Manager">
                <TechnicianDiagnostic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Invoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Invoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnostic-list"
            element={
              <ProtectedRoute requiredRole="Manager">
                <DiagnosticList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimates"
            element={
              <ProtectedRoute requiredRole="Manager">
                <EstimateList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimates/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Estimate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimate/create"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Estimate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimate/edit/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Estimate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimate/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Estimate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ShopReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicianDiagnostic/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <TechnicianDiagnostic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicianDiagnostic/edit/:techDiagId"
            element={
              <ProtectedRoute requiredRole="Manager">
                <TechnicianDiagnosticEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice"
            element={
              <ProtectedRoute requiredRole="Manager">
                <invoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnostic-list"
            element={
              <ProtectedRoute requiredRole="Manager">
                <DiagnosticList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimates/"
            element={
              <ProtectedRoute requiredRole="Manager">
                <EstimateList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimate/create"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Estimate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimate/edit/:id"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Estimate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wsettings"
            element={
              <ProtectedRoute requiredRole="Manager">
                <WorkshopSettingsForm />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/technicianDiagnosticList"
          element={
            <ProtectedRoute requiredRole="Technician">
              <TechnicianDiagnosticList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
