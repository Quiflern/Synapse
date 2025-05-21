import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import AuthForm from "@/components/auth/AuthForm";
import AuthBranding from "@/components/auth/AuthBranding";
import AuthContainer from "@/components/auth/AuthContainer";
import FloatingBackground from "@/components/auth/FloatingBackground";

/**
 * Auth - Authentication page with animated background and hybrid login options
 *
 * Allows users to authenticate via:
 * - Email/Password login
 * - Magic link (passwordless) login
 * - Sign up for a new account
 */
export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkTheme, themeColors } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button with theme-aware styling */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-4 left-4 z-50 rounded-full hover:bg-opacity-80 transition-colors",
          isDarkTheme
            ? `hover:bg-${themeColors.primary.replace("#", "")}/20 text-white`
            : `hover:bg-${themeColors.primary.replace("#", "")}/10 text-gray-800`,
        )}
        onClick={() => navigate("/")}
        aria-label="Back to home"
      >
        <ArrowLeft size={20} />
      </Button>

      {/* Animated background elements */}
      <FloatingBackground />

      {/* Glass panel for authentication */}
      <AuthContainer>
        {/* Synapse branding */}
        <AuthBranding />

        {/* Authentication form */}
        <AuthForm onSuccess={() => navigate("/app/dashboard")} />
      </AuthContainer>
    </div>
  );
};
