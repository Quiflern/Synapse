/**
 * HeroSection - A component for the main landing section on the landing page
 *
 * This is a placeholder component that would normally display the main
 * promotional content for the site.
 */
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const HeroSection: React.FC = () => {
  const { themeColors, isDarkTheme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Add mouse position tracking for an interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section
      className={cn(
        "relative w-full py-20 overflow-hidden min-h-[80vh] flex items-center",
        isDarkTheme
          ? "bg-gradient-to-b from-black/40 to-black/20"
          : "bg-gradient-to-b from-gray-100/90 to-gray-50/80",
      )}
    >
      {/* More visible grid background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10">
        <div
          className={cn(
            "absolute inset-0 w-full h-full",
            isDarkTheme
              ? "bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40"
              : "bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50",
          )}
        ></div>
      </div>

      {/* Interactive gradient blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <motion.div
          className="absolute w-96 h-96 rounded-full filter blur-[100px] opacity-30"
          style={{
            background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
            left: mousePosition.x * 0.05,
            top: mousePosition.y * 0.05,
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full filter blur-[120px] opacity-20"
          style={{
            background: `linear-gradient(to right, ${themeColors.secondary}, ${themeColors.accent})`,
            right: window.innerWidth - mousePosition.x * 0.08,
            top: mousePosition.y * 0.08,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full filter blur-[80px] opacity-25"
          style={{
            background: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.primary})`,
            left: mousePosition.x * 0.03,
            bottom: window.innerHeight - mousePosition.y * 0.03,
          }}
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Synapse
          </motion.h1>
          <motion.p
            className={cn(
              "text-xl md:text-2xl mb-10",
              isDarkTheme ? "text-gray-300" : "text-gray-700",
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Rediscover your memories through the power of music
          </motion.p>
          <motion.div
            className="flex flex-col md:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              asChild
              size="lg"
              className="text-white bg-primary hover:bg-primary/90"
            >
              <Link to="/library">
                Explore Library
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className={
                isDarkTheme
                  ? "border-white/20 hover:bg-white/10 text-white"
                  : "border-gray-300 hover:bg-gray-100 text-gray-800"
              }
            >
              <Link to="/memories">View Memories</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
