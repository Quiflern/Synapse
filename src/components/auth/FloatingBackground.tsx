import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

/**
 * Animated floating background for auth pages
 *
 * Creates a dynamic, animated background with floating elements
 */
export const FloatingBackground: React.FC = () => {
  const { isDarkTheme } = useTheme();

  // Generate random position for floating elements
  const generateRandomPosition = () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  });

  // Create array of floating elements
  const floatingElements = Array.from({ length: 20 }).map((_, index) => {
    const pos = generateRandomPosition();
    const size = Math.random() * 60 + 20; // Random size between 20px and 80px

    return (
      <motion.div
        key={index}
        className="absolute rounded-full opacity-20"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          width: size,
          height: size,
          background:
            index % 3 === 0
              ? "var(--primary)"
              : index % 3 === 1
                ? "var(--secondary)"
                : "var(--accent)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 10, -10, 0],
          y: [0, -15, 5, 0],
        }}
        transition={{
          duration: 10 + Math.random() * 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Grid overlay */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]",
          "bg-[size:4rem_4rem]",
          isDarkTheme ? "opacity-30" : "opacity-15",
        )}
      ></div>
      {floatingElements}
    </div>
  );
};

export default FloatingBackground;
