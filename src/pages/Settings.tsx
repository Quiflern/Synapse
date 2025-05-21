import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useSleepTimer } from "@/context/SleepTimerContext";
import { usePlayer } from "@/context/PlayerContext";
import { CustomModal } from "@/components/ui/custom-modal";
import { Settings as SettingsIcon, User, Volume2 } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useNavigate } from "react-router-dom";

/**
 * Settings - Application settings page with theme-aligned design
 *
 * Allows users to configure:
 * - Theme settings
 * - Audio settings
 * - Sleep timer settings
 */
const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkTheme, theme } = useTheme();
  const {
    enabled: sleepTimerEnabled,
    minutes: sleepTimerMinutes,
    setEnabled: setSleepTimerEnabled,
    setMinutes: setSleepTimerMinutes,
  } = useSleepTimer();
  const { volume, setVolume } = usePlayer();

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "appearance" | "profile" | "audio"
  >("appearance");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Generate theme-specific styles
  const getModalBackground = () => {
    switch (theme) {
      case "cyberpunk":
        return "bg-gradient-to-br from-black/90 to-[#0f0f1a]/90 backdrop-blur-xl";
      case "midnight-ash":
        return "bg-gradient-to-br from-black/90 to-[#1a1a2e]/90 backdrop-blur-xl";
      case "obsidian-veil":
        return "bg-gradient-to-br from-black/90 to-[#1A1F2C]/90 backdrop-blur-xl";
      case "noir-eclipse":
        return "bg-gradient-to-br from-black/90 to-[#111]/90 backdrop-blur-xl";
      case "shadow-ember":
        return "bg-gradient-to-br from-black/90 to-[#1a0e0e]/90 backdrop-blur-xl";
      case "custom":
        return "bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-xl";
      // Light themes
      case "light":
        return "bg-gradient-to-br from-white/90 to-gray-100/90 backdrop-blur-xl";
      case "morning-haze":
        return "bg-gradient-to-br from-white/90 to-[#f5f8ff]/90 backdrop-blur-xl";
      case "ivory-bloom":
        return "bg-gradient-to-br from-white/90 to-[#fff9f9]/90 backdrop-blur-xl";
      case "sunlit-linen":
        return "bg-gradient-to-br from-white/90 to-[#fffaf0]/90 backdrop-blur-xl";
      case "cloudpetal":
        return "bg-gradient-to-br from-white/90 to-[#fafafa]/90 backdrop-blur-xl";
      default:
        return isDarkTheme
          ? "bg-gradient-to-br from-black/90 to-[#0f0f1a]/90 backdrop-blur-xl"
          : "bg-gradient-to-br from-white/90 to-gray-100/90 backdrop-blur-xl";
    }
  };

  // Theme-specific styles
  const getActiveNavClass = (section: string) => {
    if (activeSection === section) {
      return `bg-primary text-primary-foreground shadow-lg`;
    }
    return isDarkTheme
      ? "hover:bg-white/10 bg-black/30 text-gray-300"
      : "hover:bg-gray-100 bg-white/80 text-gray-700";
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <CustomModal
      isOpen={true}
      onClose={handleClose}
      title="Settings"
      className={`w-[95%] md:w-[85%] lg:w-[80%] xl:w-[70%] max-w-7xl ${getModalBackground()} border-${isDarkTheme ? "white/10" : "gray-200"}`}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation - Updated with consistent styling */}
        <div
          className="md:w-56 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r
             border-white/10 pb-6 md:pb-0 md:pr-6"
        >
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${getActiveNavClass("appearance")}`}
            onClick={() => setActiveSection("appearance")}
          >
            <SettingsIcon className="h-5 w-5" />
            Appearance
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${getActiveNavClass("profile")}`}
            onClick={() => setActiveSection("profile")}
          >
            <User className="h-5 w-5" />
            Profile
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${getActiveNavClass("audio")}`}
            onClick={() => setActiveSection("audio")}
          >
            <Volume2 className="h-5 w-5" />
            Audio
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Appearance Settings */}
          {activeSection === "appearance" && (
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <ThemeSwitcher
                showCustomizer={showCustomizer}
                onToggleCustomizer={() => setShowCustomizer(!showCustomizer)}
              />
            </div>
          )}

          {/* Profile Settings */}
          {activeSection === "profile" && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-6"
            >
              <motion.h3
                variants={itemVariants}
                className="text-xl font-medium mb-5"
              >
                Profile Settings
              </motion.h3>
              <motion.div variants={itemVariants} className="space-y-5">
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Username
                  </label>
                  <input
                    placeholder="Your username"
                    className={`w-full p-3 rounded-lg transition-all duration-300 ${
                      isDarkTheme
                        ? "bg-black/60 border border-white/20 text-white focus:ring-2 focus:ring-primary/50"
                        : "bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary/50"
                    } 
                      outline-none`}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Your email"
                    className={`w-full p-3 rounded-lg transition-all duration-300 ${
                      isDarkTheme
                        ? "bg-black/60 border border-white/20 text-white focus:ring-2 focus:ring-primary/50"
                        : "bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary/50"
                    } 
                      outline-none`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label
                    className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Email Notifications
                  </label>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div
                      className={`w-11 h-6 ${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} 
                      peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full 
                      rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
                      after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 
                      after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                    ></div>
                  </div>
                </div>
              </motion.div>
              <motion.button
                variants={itemVariants}
                className={`px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg 
                  hover:opacity-90 transition-colors shadow-lg`}
              >
                Save Changes
              </motion.button>
            </motion.div>
          )}

          {/* Audio Settings */}
          {activeSection === "audio" && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-medium mb-5">Audio Settings</h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label
                        className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Default Volume ({Math.round(volume * 100)}%)
                      </label>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer 
                        ${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-primary`}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label
                      className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Auto-play on start
                    </label>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div
                        className={`w-11 h-6 ${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} 
                        peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full 
                        rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
                        after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 
                        after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                      ></div>
                    </div>
                  </div>

                  {/* Clear Music Library Option */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-lg font-medium mb-3">Music Library</h4>
                    <p
                      className={`text-sm ${isDarkTheme ? "text-gray-400" : "text-gray-600"} mb-4`}
                    >
                      Clear your local music library to reset all stored tracks
                      and start fresh.
                    </p>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to clear your music library? This action cannot be undone.",
                          )
                        ) {
                          // Clear library from local storage
                          localStorage.removeItem("musicLibrary");
                          localStorage.removeItem("tracks");
                          // Reload the page to reset the library
                          window.location.reload();
                        }
                      }}
                      className={`px-4 py-2 bg-destructive text-destructive-foreground font-medium rounded-lg hover:opacity-90 transition-colors`}
                    >
                      Clear Music Library
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-medium mb-5">Sleep Timer</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Enable Sleep Timer
                    </label>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={sleepTimerEnabled}
                        onChange={(e) => setSleepTimerEnabled(e.target.checked)}
                      />
                      <div
                        className={`w-11 h-6 ${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} 
                        peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full 
                        rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
                        after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 
                        after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label
                        className={`text-sm font-medium ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Default Duration ({sleepTimerMinutes} minutes)
                      </label>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="120"
                      step="1"
                      value={sleepTimerMinutes}
                      onChange={(e) =>
                        setSleepTimerMinutes(parseInt(e.target.value))
                      }
                      disabled={!sleepTimerEnabled}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer 
                        ${isDarkTheme ? "bg-gray-700" : "bg-gray-300"} 
                        disabled:opacity-50 disabled:cursor-not-allowed 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-primary`}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default Settings;
