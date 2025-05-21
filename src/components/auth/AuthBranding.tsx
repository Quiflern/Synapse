import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Branding component for authentication page
 *
 * Displays app logo and branding
 */
export const AuthBranding: React.FC = () => {
  const { isDarkTheme } = useTheme();

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

  return (
    <>
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center justify-center mb-6"
      >
        <div className="flex items-center justify-center mb-2">
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center mr-2",
              isDarkTheme ? "bg-electric" : "bg-primary",
            )}
          >
            <Music
              className={cn(
                "h-6 w-6",
                isDarkTheme ? "text-black" : "text-white",
              )}
            />
          </div>
          <span
            className={cn(
              "font-orbitron text-2xl font-bold",
              isDarkTheme ? "text-electric" : "text-primary",
            )}
          >
            Synapse
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to Synapse</h1>
        <p
          className={`mt-2 ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
        >
          Your digital music platform
        </p>
      </motion.div>
    </>
  );
};

export default AuthBranding;
