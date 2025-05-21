import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Edit2, ListMusic, Music, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";

interface PlaylistCardProps {
  id: string;
  name: string;
  description?: string;
  trackCount: number;
  coverImage?: string;
  trackImages?: string[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPlay: (id: string) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  id,
  name,
  description,
  trackCount,
  coverImage,
  trackImages = [],
  onDelete,
  onEdit,
  onPlay,
}) => {
  const { themeColors, isDarkTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  // Generate card style based on theme
  const getCardStyle = () => {
    const getPanelGradientStyle = () => {
      switch (theme) {
        case "cyberpunk":
          return "from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30";
        case "midnight-ash":
          return "from-[#0A1D24]/70 via-[#071318]/50 to-[#0A1D24]/60 border border-[#33C3F0]/25";
        case "obsidian-veil":
          return "from-[#221830]/70 via-[#160F20]/50 to-[#221830]/60 border border-[#7E69AB]/25";
        case "noir-eclipse":
          return "from-black/70 via-[#080808]/60 to-black/65 border border-[#9F9EA1]/20";
        case "shadow-ember":
          return "from-[#3B0E13]/70 via-[#1F070A]/50 to-[#3B0E13]/60 border border-[#ea384d]/25";
        case "light":
          return "from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30";
        case "morning-haze":
          return "from-white/90 via-[#F0F7FF]/70 to-[#EBF4FF]/80 border border-[#C0D7F5]/60";
        case "ivory-bloom":
          return "from-white/90 via-[#FFF5F7]/70 to-[#FFF0F2]/80 border border-[#FECDD2]/60";
        case "sunlit-linen":
          return "from-white/90 via-[#FEFCF0]/70 to-[#FFFBEF]/80 border border-[#E7B448]/70";
        case "cloudpetal":
          return "from-white/90 via-[#FFF5F7]/60 to-[#F0F7FF]/70 border border-[#FECDD2]/60";
        default:
          return isDarkTheme
            ? "from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30" // Cyberpunk default
            : "from-white/90 via-gray-50/70 to-gray-100/80 border border-gray-300/70"; // Light default
      }
    };
    return `${getPanelGradientStyle()} relative overflow-hidden rounded-2xl transition-all duration-300 backdrop-blur-xl`;
  };

  const hoverBgColor = () => {
    switch (theme) {
      case "cyberpunk":
        return "bg-[#0066FF]";
      case "midnight-ash":
        return "bg-[#33C3F0]";
      case "obsidian-veil":
        return "bg-[#7E69AB]";
      case "noir-eclipse":
        return "bg-[#9F9EA1]";
      case "shadow-ember":
        return "bg-[#ea384d]";
      case "light":
        return "bg-[#0066FF]";
      case "morning-haze":
        return "bg-[#4A7AB5]";
      case "ivory-bloom":
        return "bg-[#C77986]";
      case "sunlit-linen":
        return "bg-[#A98127]";
      case "cloudpetal":
        return "bg-[#C77986]";
      default:
        return "bg-0066FF";
    }
  };

  const getUnderlineColor = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return "bg-[#0066FF]";
      case "midnight-ash":
        return "bg-[#33C3F0]";
      case "obsidian-veil":
        return "bg-[#7E69AB]";
      case "noir-eclipse":
        return "bg-[#9F9EA1]";
      case "shadow-ember":
        return "bg-[#ea384d]";

      // Light Themes
      case "light":
        return "bg-gray-700";
      case "morning-haze":
        return "bg-[#4A7AB5]";
      case "ivory-bloom":
        return "bg-[#C77986]";
      case "sunlit-linen":
        return "bg-[#A98127]";
      case "cloudpetal":
        return "bg-[#C77986]";

      default:
        if (isDarkTheme) {
          return `bg-[#0066FF]`;
        } else {
          return `bg-[#0066FF]`;
        }
    }
  };

  // Render cover art with improved styling
  const renderCoverArt = () => {
    if (coverImage) {
      // If a main cover image is provided, use it with overlay
      return (
        <div className="relative w-full aspect-square overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700"
            style={{
              backgroundImage: `url(${coverImage})`,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
          <div
            className={`absolute inset-0 ${isDarkTheme ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent" : "bg-gradient-to-t from-black/60 via-black/30 to-transparent"}`}
          ></div>
        </div>
      );
    } else if (trackImages.length > 0) {
      // If we have track images, create a grid with hover effect
      return (
        <div className="relative w-full aspect-square overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-cover bg-center w-full h-full overflow-hidden"
                style={{
                  backgroundImage: trackImages[index]
                    ? `url(${trackImages[index]})`
                    : undefined,
                  backgroundColor: !trackImages[index]
                    ? isDarkTheme
                      ? "#1a1a1a"
                      : "#e5e5e5"
                    : undefined,
                  transform: hovered ? "scale(1.05)" : "scale(1)",
                  transition: "transform 700ms ease",
                }}
              >
                {!trackImages[index] && (
                  <div className="flex items-center justify-center h-full">
                    <Music className="h-4 w-4 opacity-40" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            className={`absolute inset-0 ${isDarkTheme ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent" : "bg-gradient-to-t from-black/60 via-black/30 to-transparent"}`}
          ></div>
        </div>
      );
    } else {
      // Fallback to a stylish placeholder
      return (
        <div className="relative w-full aspect-square overflow-hidden">
          <div
            className={`absolute inset-0 flex items-center justify-center ${isDarkTheme ? "bg-[" + themeColors.primary + "]/10" : "bg-[" + themeColors.primary + "]/5"}`}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center bg-[${themeColors.primary}]/20`}
            >
              <ListMusic
                className={`w-10 h-10 text-[${themeColors.primary}]`}
              />
            </div>
          </div>
          <div
            className={`absolute inset-0 ${isDarkTheme ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent" : "bg-gradient-to-t from-black/60 via-black/30 to-transparent"}`}
          ></div>
        </div>
      );
    }
  };

  return (
    <motion.div
      className={getCardStyle()}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(`/app/playlists/${id}`)}
    >
      {/* Solid color border on hover */}
      <div className="absolute inset-0 p-[1px] rounded-2xl overflow-hidden pointer-events-none">
        <div
          className={`absolute inset-0 ${hoverBgColor()} opacity-0 transition-opacity duration-700 ${hovered ? "opacity-10" : ""}`}
          style={{
            filter: "blur(1px)",
            maskImage:
              "linear-gradient(black, black) content-box, linear-gradient(black, black)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            maskClip: "padding-box, border-box",
          }}
        />
      </div>

      {/* Cover Art Section */}
      {renderCoverArt()}

      {/* Content Section */}
      <div className="relative z-10 p-4">
        {/* Title with animated underline */}
        <div className="mb-2">
          <div className="relative inline-block">
            <h2
              className={`text-lg font-bold ${isDarkTheme ? "text-white" : "text-gray-800"} truncate max-w-full`}
            >
              {name}
            </h2>
            <motion.div
              className={`absolute bottom-0 left-0 h-[2px] ${getUnderlineColor()}`}
              initial={{ width: "0%" }}
              animate={{ width: hovered ? "100%" : "30%" }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Track count with icon */}
        <div
          className={`flex items-center text-xs mb-4 ${isDarkTheme ? "text-gray-400" : "text-gray-500"}`}
        >
          <Clock size={12} className={`mr-1.5 text-[${themeColors.primary}]`} />
          <span>
            {trackCount} {trackCount === 1 ? "track" : "tracks"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <Button
            size="sm"
            variant="outline"
            className={`h-8 px-3 ${
              isDarkTheme
                ? `border-[${themeColors.primary}]/20 bg-black/30 text-[${themeColors.primary}] hover:bg-[${themeColors.primary}]/20`
                : `border-[${themeColors.primary}]/20 bg-white/50 text-[${themeColors.primary}] hover:bg-[${themeColors.primary}]/10`
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onPlay(id);
            }}
          >
            <Play size={14} className="mr-1.5" />
            Play
          </Button>

          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 rounded-full ${
                isDarkTheme
                  ? "bg-black/40 text-gray-400 hover:text-white hover:bg-white/10"
                  : "bg-white/60 text-gray-500 hover:text-gray-800 hover:bg-black/5"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
            >
              <Edit2 size={14} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 rounded-full ${
                isDarkTheme
                  ? "bg-black/40 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  : "bg-white/60 text-gray-500 hover:text-red-500 hover:bg-red-500/5"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaylistCard;
