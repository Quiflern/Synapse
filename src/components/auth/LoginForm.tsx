import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup: () => void;
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

// Variants for the main form content container that animates with AnimatePresence
const formContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignup,
}) => {
  const { isDarkTheme } = useTheme();
  const { signIn, signInWithPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (loginMethod === "magic") {
        if (!email) {
          toast.error("Please enter your email");
          setIsLoading(false);
          return;
        }
        await signIn(email);
        // Assuming signIn shows its own success/failure toasts or handles onSuccess
      } else {
        if (!email || !password) {
          toast.error("Please enter your email and password");
          setIsLoading(false);
          return;
        }
        await signInWithPassword(email, password);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("Authentication failed", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* This motion.div is outside AnimatePresence; itemVariants apply on mount/unmount */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="mb-6"
      >
        <div className="flex rounded-md overflow-hidden border border-gray-300">
          <button
            type="button"
            onClick={() => setLoginMethod("magic")}
            className={`flex-1 py-2 transition-colors ${
              loginMethod === "magic"
                ? "bg-primary text-primary-foreground"
                : isDarkTheme
                  ? "bg-transparent text-gray-300 hover:bg-white/10"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("password")}
            className={`flex-1 py-2 transition-colors ${
              loginMethod === "password"
                ? "bg-primary text-primary-foreground"
                : isDarkTheme
                  ? "bg-transparent text-gray-300 hover:bg-white/10"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            Password
          </button>
        </div>
      </motion.div>

      <form onSubmit={handleLogin}>
        <AnimatePresence mode="wait">
          <motion.div
            key={loginMethod}
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <div className="space-y-2 p-2">
              <label
                className={`block text-sm text-left ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
              >
                Email
              </label>
              <Input
                type="email"
                placeholder="your.email@synapse.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={isDarkTheme ? "bg-black/50" : "bg-white"}
              />
            </div>

            {loginMethod === "password" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 overflow-hidden p-2"
              >
                <label
                  className={`block text-sm text-left ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                >
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required={loginMethod === "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={isDarkTheme ? "bg-black/50" : "bg-white"}
                />
              </motion.div>
            )}

            {loginMethod === "magic" && (
              <motion.p
                variants={itemVariants}
                className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
              >
                We'll send you a magic link to your email for a passwordless
                sign in
              </motion.p>
            )}

            <motion.div variants={itemVariants}>
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
                  <span>
                    {loginMethod === "magic" ? "Send Magic Link" : "Sign In"}
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
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
          Don't have an account?
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="ml-2 text-primary hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </>
  );
};
