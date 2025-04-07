/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ManagerProtectedRoute from "./components/ProtectedRoute/ManagerProtectedRoute";
import Login from "./components/login/Login";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import RegisterUser from "./components/Home/RegisterUser/RegisterUser";
import VehicleReception from "./components/Home/VehicleReception/VehicleReception";
import ChangePassword from "./components/ForgotPassword/ChangePassword";
import VehicleList from "./components/Home/VehicleList/VehicleList";
import Diagnostic from "./components/Home/Diagnostic/Diagnostic";
import TechnicianDiagnostic from "./components/Home/Diagnostic/TechnicianDiagnostic";
import DiagnosticList from "./components/Home/Diagnostic/DiagnosticList";
// import TechnicianDiagnosticEdit from "./components/Home/Diagnostic/TechnicianDiagnosticEdit";
import EstimateList from "./components/Home/Estimate/EstimateList";
import Estimate from "./components/Home/Estimate/Estimate";
import MainLayout from "./components/Layout/MainLayout";
import Home from "./components/Home/index";
import WorkshopSettingsForm from "./components/Home/Settings/WorkshopSettingsForm";
import Settings from "./components/Home/Settings/Settings";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRouteComponent";
import ErrorBoundary from "./components/ProtectedRoute/ErrorBoundary";
import TechnicianDiagnosticList from "./components/Home/Diagnostic/TechnicianDiagnosticList";
import AccountsReceivableView from "./components/Home/Accounting/AccountsReceivableView";
import PaymentList from "./components/Home/Accounting/PaymentList";
import ClientPaymentPDFViewer from "./components/Home/Accounting/ClientPaymentPDFViewer";
import SalesReportView from "./components/Home/Reports/SalesReportsListView";
import SalesReportPDFViewer from "./components/Home/Reports/SalesReportPDFViewer";
import SalesReportAllPreviewView from "./components/Home/Reports/SalesReportAllPreviewView";
import VehicleXlsx from "./components/Home/Diagnostic/xlsx/VehicleXlsx";

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/vehicle-reception/:id"
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
              <ProtectedRoute requiredRole="Technician">
                <TechnicianDiagnostic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicianDiagnostic/edit/:techDiagId"
            element={
              <ProtectedRoute requiredRole="Technician">
                <TechnicianDiagnostic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicianDiagnostic/create/:diagnosticId"
            element={
              <ProtectedRoute requiredRole="Technician">
                <TechnicianDiagnostic />
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
            path="/wsettings"
            element={
              <ProtectedRoute requiredRole="Manager">
                <WorkshopSettingsForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="technicianDiagnosticList"
            element={
              <ProtectedRoute requiredRoles={["Technician", "Manager"]}>
                <TechnicianDiagnosticList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ProtectedRoute requiredRoles={"Manager"}>
                <ForgotPassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-user"
            element={
              <ManagerProtectedRoute requiredRoles={"Manager"}>
                <RegisterUser />
              </ManagerProtectedRoute>
            }
          />
          <Route
            path="/accounts-receivable"
            element={
              <ProtectedRoute requiredRoles={"Manager"}>
                <AccountsReceivableView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-list"
            element={
              <ProtectedRoute requiredRoles={"Manager"}>
                <PaymentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-payment-pdf/:customerId"
            element={
              <ProtectedRoute requiredRoles={"Manager"}>
                <ClientPaymentPDFViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRoles={"Manager"}>
                <SalesReportView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-report-pdf/:salesReportId"
            element={
              <ProtectedRoute requiredRoles={"Manager"}>
                <SalesReportPDFViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-report-preview"
            element={
              <ProtectedRoute requiredRoles={"Manager"}>
                <SalesReportAllPreviewView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/VehicleXlsx"
            element={
              <ProtectedRoute requiredRole="Manager">
                <VehicleXlsx />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
