import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/useAuthStore";

// Views
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Interviews } from "./pages/Interviews";
import { InterviewDetail } from "./pages/InterviewDetail";
import { MySchedule } from "./pages/MySchedule";
import { Calendar } from "./pages/Calendar";
import { Notices } from "./pages/Notices";
import { VerifyEmail } from "./pages/VerifyEmail";

// Components
import { RoleGuard } from "./components/RoleGuard";
import { Toast } from "./components/Toast";
import { InterviewModal } from "./components/InterviewModal";
import { ProfileModal } from "./components/ProfileModal";

// Index Redirect Helper
const IndexRedirect: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Perform session hydration check on app mount
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      {/* Dynamic Popups Shell */}
      <InterviewModal />
      <ProfileModal />
      <Toast />

      <Routes>
        {/* Public auth pathways */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Gated Dashboard View */}
        <Route
          path="/dashboard"
          element={
            <RoleGuard allowedRoles={["ADMIN", "CANDIDATE"]}>
              <Dashboard />
            </RoleGuard>
          }
        />

        {/* Directory View */}
        <Route
          path="/interviews"
          element={
            <RoleGuard allowedRoles={["ADMIN", "VIEWER", "CANDIDATE"]}>
              <Interviews />
            </RoleGuard>
          }
        />

        {/* Thread and details View (All Roles) */}
        <Route
          path="/interviews/:id"
          element={
            <RoleGuard allowedRoles={["ADMIN", "CANDIDATE", "VIEWER"]}>
              <InterviewDetail />
            </RoleGuard>
          }
        />

        {/* Candidate Scheduler Portal */}
        <Route
          path="/my-schedule"
          element={
            <RoleGuard allowedRoles={["CANDIDATE"]}>
              <MySchedule />
            </RoleGuard>
          }
        />

        {/* Calendar visual (All Roles) */}
        <Route
          path="/calendar"
          element={
            <RoleGuard allowedRoles={["ADMIN", "CANDIDATE", "VIEWER"]}>
              <Calendar />
            </RoleGuard>
          }
        />

        {/* Notices Visual (All Roles) */}
        <Route
          path="/notices"
          element={
            <RoleGuard allowedRoles={["ADMIN", "CANDIDATE", "VIEWER"]}>
              <Notices />
            </RoleGuard>
          }
        />

        {/* Index and fallback pathways */}
        <Route path="/" element={<IndexRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
