import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"ADMIN" | "CANDIDATE" | "VIEWER">;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuthStore();

  // If still loading profile data, show a full screen premium spinner
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Securing session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated? Reroute to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Unauthorized? Reroute to appropriate homepage based on their role
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "CANDIDATE") {
      return <Navigate to="/my-schedule" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
export default RoleGuard;
