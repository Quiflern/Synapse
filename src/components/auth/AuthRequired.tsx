import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { HoverCard } from "@/components/ui/card-hover-effect";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName: string;
}

/**
 * AuthRequired - Component that checks if user is authenticated
 *
 * Renders children if user is authenticated, otherwise renders
 * a login prompt with the option to navigate to auth page
 *
 * @param {React.ReactNode} children - Content to show when authenticated
 * @param {React.ReactNode} fallback - Optional custom fallback content
 * @param {string} featureName - Name of feature requiring authentication
 */
export const AuthRequired: React.FC<AuthRequiredProps> = ({
  children,
  fallback,
  featureName,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <HoverCard className="p-8 text-center flex flex-col items-center justify-center">
      <LogIn size={32} className="mb-4 text-primary opacity-70" />
      <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
      <p className="text-muted-foreground mb-4">
        Please log in to use the {featureName} feature
      </p>
      <Button onClick={() => navigate("/auth")} className="px-6">
        Log In or Sign Up
      </Button>
    </HoverCard>
  );
};

export default AuthRequired;
