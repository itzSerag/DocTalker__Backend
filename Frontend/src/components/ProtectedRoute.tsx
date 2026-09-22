import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show a full-screen spinner while auth state is being determined
  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--color-canvas)" }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "var(--color-brand-400)" }}
        />
      </div>
    );
  }

  // Not authenticated at all — send to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but email not verified — send to OTP page
  if (!user.isVerified && location.pathname !== "/verify-otp") {
    return <Navigate to="/verify-otp" state={{ email: user.email }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
