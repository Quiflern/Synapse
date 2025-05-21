// noinspection XmlDeprecatedElement

import React from "react";
import { Link } from "react-router-dom";
import { Github, Globe, Music, Twitter } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

/**
 * Footer - A responsive footer component for the landing page
 *
 * @returns {JSX.Element} The rendered footer component
 */
const Footer = () => {
  const { theme, isDarkTheme } = useTheme();

  const getLinkColor = () => {
    switch (theme) {
      case "cyberpunk":
        return "text-electric hover:text-electric/80";
      case "midnight-ash":
        return "text-[#33C3F0] hover:text-[#33C3F0]/80";
      case "obsidian-veil":
        return "text-[#7E69AB] hover:text-[#7E69AB]/80";
      case "noir-eclipse":
        return "text-[#9F9EA1] hover:text-[#9F9EA1]/80";
      case "shadow-ember":
        return "text-warning hover:text-warning/80";
      case "light":
        return "text-primary hover:text-primary/80";
      case "morning-haze":
        return "text-primary hover:text-primary/80";
      case "ivory-bloom":
        return "text-primary hover:text-primary/80";
      case "sunlit-linen":
        return "text-warning hover:text-warning/80";
      case "cloudpetal":
        return "text-primary hover:text-primary/80";
      case "custom":
        return "text-primary hover:text-primary/80";
      default:
        return "text-electric hover:text-electric/80";
    }
  };

  const linkColor = getLinkColor();

  return (
    <footer
      className={cn(
        "w-full py-6 px-4 border-t",
        isDarkTheme
          ? "bg-black/30 border-white/5"
          : "bg-gray-50/70 backdrop-blur-sm border-gray-200",
      )}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center mr-2",
                isDarkTheme ? "bg-electric" : "bg-primary",
              )}
            >
              <Music
                className={cn(
                  "h-5 w-5",
                  isDarkTheme ? "text-black" : "text-white",
                )}
              />
            </div>
            <span
              className={cn(
                "font-orbitron text-lg font-bold",
                isDarkTheme ? "text-electric" : "text-primary",
              )}
            >
              Synapse
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="#" className={cn("hover:opacity-80", linkColor)}>
              <Github size={20} />
            </Link>
            <Link to="#" className={cn("hover:opacity-80", linkColor)}>
              <Twitter size={20} />
            </Link>
            <Link to="#" className={cn("hover:opacity-80", linkColor)}>
              <Globe size={20} />
            </Link>
          </div>
          
          <div
            className={cn(
              "text-sm",
              isDarkTheme ? "text-gray-400" : "text-gray-600",
            )}
          >
            &copy; {new Date().getFullYear()} Synapse Music. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
