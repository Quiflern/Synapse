import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar.tsx";
import { PlayerControls } from "@/components/player/PlayerControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

/**
 * AppLayout - Layout component for application pages
 *
 * Provides the two-section layout consisting of:
 * - Left Sidebar (Navigation)
 * - Main content area (via Outlet)
 * - Bottom player controls
 *
 * @returns {JSX.Element} The application layout with sidebar
 */
const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const { currentTrack } = usePlayer();
  const { theme, themeColors } = useTheme();
  const { isLoading } = useAuth();

  // Get theme-specific background styles with gradients
  const getBackgroundGradient = () => {
    switch (theme) {
      case "cyberpunk":
        return "bg-gradient-to-br from-[#0066FF]/25 via-[#001A40]/40 to-black/70";
      case "midnight-ash":
        return "bg-gradient-to-br from-black via-[#0C2229]/80 to-[#33C3F0]/25";
      case "obsidian-veil":
        return "bg-gradient-to-br from-[#7E69AB]/20 via-[#2C203E]/50 to-[#1A1F2C]/80";
      case "noir-eclipse":
        return "bg-gradient-to-br from-[#9F9EA1]/10 via-black/70 to-black/90";
      case "shadow-ember":
        return "bg-gradient-to-br from-[#ea384d]/15 via-[#4D121A]/60 to-[#1A0608]/85";
      case "light":
        return "bg-gradient-to-br from-white via-gray-100 to-gray-200/70";
      case "morning-haze":
        return "bg-gradient-to-br from-white via-[#D3E4FD]/50 to-[#D3E4FD]/30";
      case "ivory-bloom":
        return "bg-gradient-to-br from-white via-[#FFDEE2]/40 to-[#FFDEE2]/20";
      case "sunlit-linen":
        return "bg-gradient-to-br from-white via-[#FEF7CD]/40 to-[#FEF7CD]/20";
      case "cloudpetal":
        return "bg-gradient-to-br from-white via-[#FFDEE2]/40 to-[#D3E4FD]/30";
      case "custom":
        return `bg-gradient-to-br from-black via-black/90 to-${themeColors.primary}/10`;
      default:
        return "bg-gradient-to-br from-[#0066FF]/25 via-[#001A40]/40 to-black/70";
    }
  };

  // Show loading indicator when checking authentication
  if (isLoading) {
    return (
      <div
        className={`h-screen flex items-center justify-center ${getBackgroundGradient()}`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric"></div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${getBackgroundGradient()}`}
    >
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div
            className={cn("mx-auto p-4 pb-24", isMobile ? "px-2" : "container")}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Full player controls at the bottom */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <PlayerControls />
        </div>
      )}
    </div>
  );
};

export default AppLayout;
