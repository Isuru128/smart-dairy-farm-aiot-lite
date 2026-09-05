import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import OverviewDashboard from './pages/dashboard/OverviewDashboard';
import LivestockManagement from './pages/livestock/LivestockManagement';
import MilkProductionDashboard from './pages/milk-production/MilkProductionDashboard';
import LiveSensorMonitoring from './pages/iot-sensors/LiveSensorMonitoring';
import FeedingAutomation from './pages/feeding-grazing/FeedingAutomation';
import AIPredictionsView from './pages/ai-predictions/AIPredictionsView';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import EmployeeDirectory from './pages/operations/EmployeeDirectory';
import FinancialReports from './pages/finance/FinancialReports';
import AlertsCenter from './pages/alerts/AlertsCenter';
import SystemSettings from './pages/settings/SystemSettings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Authenticating session...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <FarmProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OverviewDashboard />} />
              <Route path="livestock" element={<LivestockManagement />} />
              <Route path="milk-production" element={<MilkProductionDashboard />} />
              <Route path="iot-sensors" element={<LiveSensorMonitoring />} />
              <Route path="feeding-grazing" element={<FeedingAutomation />} />
              <Route path="ai-predictions" element={<AIPredictionsView />} />
              <Route path="inventory" element={<InventoryDashboard />} />
              <Route path="operations" element={<EmployeeDirectory />} />
              <Route path="finance" element={<FinancialReports />} />
              <Route path="alerts" element={<AlertsCenter />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FarmProvider>
    </AuthProvider>
  );
}

export default App;
