import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Memory } from "@/types/memory";
import { Track } from "@/types/music";
import {
  Activity,
  Clock,
  Edit,
  Heart,
  MapPin,
  Maximize2,
  Minimize2,
  Music,
  Play,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/ThemeContext";

interface MemoryCardProps {
  memory: Memory;
  track: Track;
  onEdit: (memory: Memory) => void;
  onDelete: (memory: Memory) => void;
  onPlayTrack: (track: Track) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  track,
  onEdit,
  onDelete,
  onPlayTrack,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { themeColors, isDarkTheme, theme } = useTheme();

  const formatDateForDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  // Icon background color
  const getIconBgColor = () => {
    switch (theme) {
      case "cyberpunk":
        return "bg-[#0066FF]/15";
      case "midnight-ash":
        return "bg-[#33C3F0]/15";
      case "obsidian-veil":
        return "bg-[#7E69AB]/15";
      case "noir-eclipse":
        return "bg-[#9F9EA1]/20";
      case "shadow-ember":
        return "bg-[#ea384d]/15";
      case "light":
        return "bg-[#0066FF]/15";
      case "morning-haze":
        return "bg-[#D3E4FD]/30";
      case "ivory-bloom":
        return "bg-[#FFDEE2]/30";
      case "sunlit-linen":
        return "bg-[#FEF7CD]/30";
      case "cloudpetal":
        return "bg-[#FFDEE2]/30";
      default:
        return "bg-primary/10";
    }
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

  // Icon text color
  const getIconColor = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return "text-[#0066FF]";
      case "midnight-ash":
        return "text-[#33C3F0]";
      case "obsidian-veil":
        return "text-[#7E69AB]";
      case "noir-eclipse":
        return "text-[#9F9EA1]";
      case "shadow-ember":
        return "text-[#ea384d]";

      // Light Themes
      case "light":
        return "text-gray-700";
      case "morning-haze":
        return "text-[#4A7AB5]";
      case "ivory-bloom":
        return "text-[#C77986]";
      case "sunlit-linen":
        return "text-[#A98127]";
      case "cloudpetal":
        return "text-[#C77986]";

      default:
        if (isDarkTheme) {
          return `text-[#0066FF]`;
        } else {
          return `text-gray-700`;
        }
    }
  };

  // Generate theme-aware styles
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
    return `${getPanelGradientStyle()} relative overflow-hidden rounded-2xl transition-all duration-500 ${expanded ? "max-w-md" : "max-w-xs"}`;
  };

  return (
    <motion.div
      className={getCardStyle()}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
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

      {/* Floating orbs background effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className={`absolute -top-10 -left-10 w-20 h-20 rounded-full bg-[${themeColors.primary}]/10 blur-xl opacity-0 transition-opacity duration-700 ${hovered ? "opacity-60" : ""}`}
        ></div>
        <div
          className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-[${themeColors.secondary}]/10 blur-xl opacity-0 transition-opacity duration-700 ${hovered ? "opacity-60" : ""}`}
        ></div>
      </div>

      {/* Card content */}
      <div className="relative z-10 p-4">
        {/* Header with track info and controls */}
        <div className="flex items-center justify-between mb-3">
          <motion.div
            className={`flex items-center gap-3 ${isDarkTheme ? "text-white" : "text-gray-800"}`}
            initial={false}
            animate={{ x: hovered ? 0 : -5, opacity: hovered ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`w-10 h-10 rounded-full ${getIconBgColor()} flex items-center justify-center shadow-lg`}
            >
              <Music size={16} className={`${getIconColor()}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm truncate">{track.title}</h3>
              <p
                className={`text-xs ${isDarkTheme ? "text-gray-400" : "text-gray-500"} truncate`}
              >
                {track.artist || "Unknown"}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex gap-1"
            initial={false}
            animate={{ x: hovered ? 0 : 5, opacity: hovered ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 rounded-full ${
                isDarkTheme
                  ? `bg-black/40 text-[${themeColors.primary}] hover:bg-[${themeColors.primary}]/20`
                  : `bg-white/60 text-[${themeColors.primary}] hover:bg-[${themeColors.primary}]/10`
              }`}
              onClick={() => onPlayTrack(track)}
            >
              <Play size={14} className="ml-0.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 rounded-full ${
                isDarkTheme
                  ? "bg-black/40 text-gray-400 hover:text-white hover:bg-white/10"
                  : "bg-white/60 text-gray-500 hover:text-gray-800 hover:bg-black/5"
              }`}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>
          </motion.div>
        </div>

        {/* Memory title with animated underline */}
        <div className="mb-3">
          <div className="relative inline-block">
            <h2 className={`text-lg font-bold ${themeColors.primary}]`}>
              {memory.title || `Memory for "${track.title}"`}
            </h2>
            <motion.div
              className={`absolute bottom-0 left-0 h-[2px] ${getUnderlineColor()}`}
              initial={{ width: "0%" }}
              animate={{ width: hovered ? "100%" : "30%" }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Memory metadata with icons */}
        <div className="space-y-2 mb-4">
          {memory.date && (
            <div
              className={`flex items-center text-xs ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
            >
              <Clock
                size={12}
                className={`mr-2 text-[${themeColors.primary}]`}
              />
              <span>{formatDateForDisplay(memory.date)}</span>
            </div>
          )}
          {memory.location && (
            <div
              className={`flex items-center text-xs ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
            >
              <MapPin
                size={12}
                className={`mr-2 text-[${themeColors.secondary}]`}
              />
              <span>{memory.location}</span>
            </div>
          )}
          {memory.mood && (
            <div
              className={`flex items-center text-xs ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
            >
              <Heart
                size={12}
                className={`mr-2 text-[${themeColors.warning}]`}
              />
              <span>{memory.mood}</span>
            </div>
          )}
          {memory.activity && (
            <div
              className={`flex items-center text-xs ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}
            >
              <Activity
                size={12}
                className={`mr-2 text-[${themeColors.accent}]`}
              />
              <span>{memory.activity}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 h-8 text-xs ${
              isDarkTheme
                ? `border-[${themeColors.primary}]/20 bg-black/30 text-[${themeColors.primary}] hover:bg-[${themeColors.primary}]/20`
                : `border-[${themeColors.primary}]/20 bg-white/50 text-[${themeColors.primary}] hover:bg-[${themeColors.primary}]/10`
            }`}
            onClick={() => onEdit(memory)}
          >
            <Edit size={12} className="mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 h-8 text-xs ${
              isDarkTheme
                ? "border-red-500/20 bg-black/30 text-red-400 hover:bg-red-500/20"
                : "border-red-500/20 bg-white/50 text-red-500 hover:bg-red-500/10"
            }`}
            onClick={() => onDelete(memory)}
          >
            <Trash2 size={12} className="mr-1" />
            Delete
          </Button>
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {/* Memory photo with hover effect */}
                {memory.photoUrl && (
                  <motion.div
                    className={`overflow-hidden rounded-xl ${isDarkTheme ? "bg-black/40" : "bg-white/40"} p-1`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={memory.photoUrl}
                      alt={memory.title || "Memory photo"}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </motion.div>
                )}

                {/* People tags */}
                {memory.people && memory.people.length > 0 && (
                  <div
                    className={`rounded-xl p-3 ${isDarkTheme ? "bg-black/30" : "bg-white/40"}`}
                  >
                    <div
                      className={`flex items-center text-xs text-[${themeColors.primary}] mb-2`}
                    >
                      <User size={12} className="mr-1" />
                      <span>People</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {memory.people.map((person, index) => (
                        <Badge
                          key={index}
                          className={`text-xs px-2 py-0.5 ${
                            isDarkTheme
                              ? `bg-black/40 hover:bg-[${themeColors.primary}]/20 text-white`
                              : `bg-white/60 hover:bg-[${themeColors.primary}]/10 text-gray-800`
                          }`}
                        >
                          {person}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Memory note with decorative elements */}
                {memory.note && (
                  <div
                    className={`relative rounded-xl p-4 ${isDarkTheme ? "bg-black/30" : "bg-white/40"}`}
                  >
                    <div
                      className={`absolute top-2 right-2 opacity-20 ${isDarkTheme ? "text-white" : "text-black"}`}
                    >
                      <Sparkles size={16} />
                    </div>
                    <div
                      className={`flex items-center text-xs text-[${themeColors.primary}] mb-2`}
                    >
                      <span>Memory Note</span>
                    </div>
                    <p
                      className={`text-sm italic leading-relaxed ${isDarkTheme ? "text-gray-300" : "text-gray-700"}`}
                    >
                      "{memory.note}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
