import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export interface AuthFormProps {
  onSuccess?: () => void;
}

// Animation variants for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0 },
};

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AnimatePresence mode="wait">
        {authMode === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LoginForm
              onSuccess={onSuccess}
              onSwitchToSignup={() => setAuthMode("signup")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SignupForm
              onSuccess={onSuccess}
              onSwitchToLogin={() => setAuthMode("login")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AuthForm;
