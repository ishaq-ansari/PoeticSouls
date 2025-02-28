import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = <AuthModal isOpen={true} />,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">Loading...</div>
    );
  }

  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthGuard;
