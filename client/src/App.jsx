import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Mines from "./pages/Mines.jsx";
import MineDetails from "./pages/MineDetails.jsx";
import Compliance from "./pages/Compliance.jsx";
import Inspections from "./pages/Inspections.jsx";
import Violations from "./pages/Violations.jsx";
import CorrectiveActions from "./pages/CorrectiveActions.jsx";
import RiskAnalysis from "./pages/RiskAnalysis.jsx";
import GisMap from "./pages/GisMap.jsx";
import Contractors from "./pages/Contractors.jsx";
import Documents from "./pages/Documents.jsx";
import Reports from "./pages/Reports.jsx";
import Alerts from "./pages/Alerts.jsx";
import AuditTrail from "./pages/AuditTrail.jsx";
import SettingsPage from "./pages/Settings.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="mines" element={<Mines />} />
        <Route path="mines/:id" element={<MineDetails />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="inspections" element={<Inspections />} />
        <Route path="violations" element={<Violations />} />
        <Route path="corrective-actions" element={<CorrectiveActions />} />
        <Route path="risk-analysis" element={<RiskAnalysis />} />
        <Route path="gis-map" element={<GisMap />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="documents" element={<Documents />} />
        <Route path="reports" element={<Reports />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="audit-trail" element={<AuditTrail />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
