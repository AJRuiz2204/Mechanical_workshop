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
<<<<<<< HEAD
import Home from "./components/Home/index";
import WorkshopSettingsForm from "./components/Home/Settings/WorkshopSettingsForm";
import Settings from "./components/Home/Settings/Settings";
import ShopReports from "./components/Home/Reports/ShopReports";
import Invoice from "./components/Home/Invoice/Invoice";
=======
import WorkshopSettingsForm from "./components/Home/Settings/WorkshopSettingsForm";
import Settings from "./components/Home/Settings/Settings";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRouteComponent";
>>>>>>> new_change

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register-user" element={<RegisterUser />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/vehicle-reception" element={<VehicleReception />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/vehicle-list" element={<VehicleList />} />
        <Route path="/edit/:vin" element={<VehicleReception />} />
        <Route path="/diagnostic/:id" element={<Diagnostic />} />
<<<<<<< HEAD
        <Route path="/technicianDiagnostic/:id" element={<TechnicianDiagnostic />} />
        <Route path="/technicianDiagnostic/edit/:techDiagId" element={<TechnicianDiagnosticEdit />} />
        <Route path="/technicianDiagnostic/create/:diagnosticId" element={<TechnicianDiagnostic />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/diagnostic-list" element={<DiagnosticList />} />
        <Route path="/estimates" element={<EstimateList />} />
        <Route path="/estimates/:id" element={<Estimate />} />
        <Route path="/estimate/create" element={<Estimate />} />
        <Route path="/estimate/edit/:id" element={<Estimate />} />
        <Route path="/estimate/:id" element={<Estimate />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<ShopReports />} />
        
=======
        <Route
          path="/technicianDiagnostic/:id"
          element={
            <ProtectedRoute requiredRole="Technician">
              <TechnicianDiagnostic />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicianDiagnostic/edit/:techDiagId"
          element={
            <ProtectedRoute requiredRole="Technician">
              <TechnicianDiagnosticEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice"
          element={
            <ProtectedRoute requiredRole="Accountant">
              <invoice />
            </ProtectedRoute>
          }
        />
        <Route path="/diagnostic-list" element={<DiagnosticList />} />
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
        <Route path="/settings" element={<Settings />} />
        <Route path="/wsettings" element={<WorkshopSettingsForm />} />
>>>>>>> new_change
      </Route>
    </Routes>
  );
};

export default App;
