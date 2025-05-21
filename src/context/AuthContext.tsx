/**
 * Authentication context provider
 *
 * Manages user authentication state and provides authentication methods
 */
import React, { createContext, ReactNode, useContext } from "react";
import { useAuthProvider } from "@/hooks/use-auth-provider";
import { AuthContextType, UserProfile } from "@/types/auth";

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: false,
  signIn: async () => {},
  signInWithPassword: async () => {},
  signOut: async () => {},
  signUp: async () => Promise.resolve(null),
  updateProfile: async () => {},
  getProfile: async () => null,
});

/**
 * AuthProvider - Manages user authentication state and actions
 *
 * Provides methods for:
 * - Signing in/out using magic link or password
 * - Getting user profile
 * - Updating user profile
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const auth = useAuthProvider();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * useAuth - Hook to access auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context;
};

// Re-export the UserProfile type for convenience
export type { UserProfile };
