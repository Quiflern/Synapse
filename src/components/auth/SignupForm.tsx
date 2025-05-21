import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin: () => void;
}

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
    },
  },
};

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { isDarkTheme } = useTheme();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        toast.error("Passwords don't match");
        setIsLoading(false);
        return;
      }

      if (!email || !password || !username) {
        toast.error("Please fill out all fields");
        setIsLoading(false);
        return;
      }

      await signUp(email, password);

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Signup failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignup}>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="space-y-2">
            <label
              className={`block text-sm text-left ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
            >
              Username
            </label>
            <Input
              type="text"
              placeholder="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={isDarkTheme ? "bg-black/50" : "bg-white"}
            />
          </div>

          <div className="space-y-2">
            <label
              className={`block text-sm text-left ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
            >
              Email
            </label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={isDarkTheme ? "bg-black/50" : "bg-white"}
            />
          </div>

          <div className="space-y-2">
            <label
              className={`block text-sm text-left ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
            >
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={isDarkTheme ? "bg-black/50" : "bg-white"}
            />
          </div>

          <div className="space-y-2">
            <label
              className={`block text-sm text-left ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
            >
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={isDarkTheme ? "bg-black/50" : "bg-white"}
            />
          </div>

          <Button
            type="submit"
            className="w-full py-6 mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>Create Account</span>
            )}
          </Button>
        </motion.div>
      </form>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 text-center"
      >
        <p
          className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
        >
          Already have an account?
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="ml-2 text-primary hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </>
  );
};
