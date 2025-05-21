import React, { useState } from "react";
import {
  Activity,
  Calendar,
  Disc3,
  Info,
  LogIn,
  MapPin,
  Mic2,
  Music2,
  Tag as TagIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/PlayerContext";
import { useMemory } from "@/context/MemoryContext";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
// Use your updated MusicVisualizer
import {
  MusicVisualizer,
  MusicVisualizerProps,
} from "@/components/player/MusicVisualizer"; // Assuming path
import { useNavigate } from "react-router-dom";
import { AlbumArtFallback } from "@/components/music/AlbumArtFallback";
import { MemoryDialog } from "@/components/memory/MemoryDialog";
import { MemoryFormInput } from "@/types/memory";

// Define the visualizer style type based on your MusicVisualizerProps
type VisualizerVariant = NonNullable<MusicVisualizerProps["variant"]>;

const NowPlaying: React.FC = () => {
  const { currentTrack, isPlaying } = usePlayer();
  const { addMemoryToTrack, getTrackMemories } = useMemory();
  const { isDarkTheme, theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAddingMemory, setIsAddingMemory] = useState(false);
  // Initialize with one of your valid variant types
  const [visualizerStyle, setVisualizerStyle] =
    useState<VisualizerVariant>("bars");

  const trackMemories = currentTrack ? getTrackMemories(currentTrack.id) : [];

  // Updated visualizer styles to include your new ones
  const visualizerStyles: { id: VisualizerVariant; label: string }[] = [
    { id: "bars", label: "Bars" },
    { id: "wave", label: "Wave" },
    { id: "circle", label: "Circle" },
    { id: "waveform", label: "Waveform" },
    { id: "circular", label: "Circular" },
    { id: "spectrum", label: "Spectrum" },
  ];

  const handleAddMemory = async (memoryData: MemoryFormInput) => {
    if (!currentTrack || !user) return;
    try {
      await addMemoryToTrack(currentTrack.id, memoryData);
      setIsAddingMemory(false);
    } catch (err) {
      console.error("Error adding memory:", err);
    }
  };

  const handleAddMemoryClick = () => {
    if (!user) {
      navigate("/auth");
    } else {
      setIsAddingMemory(true);
    }
  };

  if (!currentTrack) {
    return (
      <motion.div
        className="h-[calc(100vh-240px)] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">♪</div>
          <h2 className="text-xl font-medium mb-2">
            No track is currently playing
          </h2>
          <p className="text-gray-400 mb-4">
            Select a song from your library to start listening
          </p>
        </div>
      </motion.div>
    );
  }

  const titleColor = () => {
    // This logic is typically identical to getIconColor for these stat cards.
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

  const buttonStyles = () => {
    // Base classes for all themed outline buttons
    const baseClasses =
      "w-auto mt-4 h-10 p-2 rounded-md text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center";

    switch (theme) {
      // Dark Themes
      case "cyberpunk": // Main: #0066FF
        return `${baseClasses} border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/10`;
      case "midnight-ash": // Main: #33C3F0
        return `${baseClasses} border-[#33C3F0] text-[#33C3F0] hover:bg-[#33C3F0]/10`;
      case "obsidian-veil": // Main: #7E69AB
        return `${baseClasses} border-[#7E69AB] text-[#7E69AB] hover:bg-[#7E69AB]/10`;
      case "noir-eclipse": // Main: #9F9EA1
        return `${baseClasses} border-[#9F9EA1] text-[#9F9EA1] hover:bg-[#9F9EA1]/10`;
      case "shadow-ember": // Main: #ea384d
        return `${baseClasses} border-[#ea384d] text-[#ea384d] hover:bg-[#ea384d]/10`;

      // Light Themes
      case "light": // Grays
        return `${baseClasses} border-gray-400 text-gray-700 hover:bg-gray-100`; // Darker border/text
      case "morning-haze": // Text Primary: #4A7AB5, BG Accent: #D3E4FD
        return `${baseClasses} border-[#4A7AB5] text-[#4A7AB5] hover:bg-[#D3E4FD]/40`;
      case "ivory-bloom": // Text Primary: #C77986, BG Accent: #FFDEE2
        return `${baseClasses} border-[#C77986] text-[#C77986] hover:bg-[#FFDEE2]/40`;
      case "sunlit-linen": // Text Primary: #A98127, BG Accent: #FEF7CD
        return `${baseClasses} border-[#A98127] text-[#A98127] hover:bg-[#FEF7CD]/40`;
      case "cloudpetal": // Text Primary: #C77986 (Pink), BG Accent: #FFDEE2 (Pink for consistency)
        return `${baseClasses} border-[#C77986] text-[#C77986] hover:bg-[#FFDEE2]/40`;

      default:
        if (isDarkTheme) {
          // Default to Cyberpunk outline style
          return `${baseClasses} border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/10`;
        } else {
          // Default to Light outline style
          return `${baseClasses} border-gray-400 text-gray-700 hover:bg-gray-100`;
        }
    }
  };

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
        return "from-white/90 via-gray-50/70 to-gray-100/80 border border-gray-300/70";
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

  return (
    <motion.div
      className="flex flex-col lg:flex-row gap-8 p-4 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left Panel: Album Art, Visualizer, Track Title/Artist */}
      <div className="lg:w-1/2 flex flex-col">
        <div className="text-center lg:text-left">
          <p
            className={`text-2xl font-bold truncate ${titleColor()}`}
            title={currentTrack.title}
          >
            {currentTrack.title} {currentTrack.artist}
          </p>
          <p
            className={`text-md truncate mb-1 ${titleColor()}`}
            title={currentTrack.artist}
          >
            {currentTrack.artist}
          </p>
        </div>
        <div className="bg-black/30 rounded-lg overflow-hidden border border-white/10 aspect-square mb-6 shadow-lg hover:shadow-xl transition-shadow relative">
          <motion.div
            className="absolute inset-0 z-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {currentTrack.albumArt ? (
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.album || "Album Art"}
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  // A more React-friendly way to handle image error:
                  const target = e.currentTarget;
                  target.style.display = "none"; // Hide broken image
                  const fallbackContainer = document.createElement("div");
                  fallbackContainer.className = "w-full h-full"; // Ensure it fills the space
                  target.parentNode?.appendChild(fallbackContainer);
                  // Ideally, you'd render a React component here.
                  // For simplicity with direct DOM manipulation:
                  AlbumArtFallback({
                    size: "lg",
                    title: currentTrack.title,
                    artist: currentTrack.artist,
                  });
                  const fallbackElement = document.createElement("div");
                  fallbackElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-black/20 text-gray-400">Fallback</div>`; // Simplified fallback
                  target.parentElement?.appendChild(fallbackElement);
                }}
              />
            ) : (
              <AlbumArtFallback
                size="lg"
                title={currentTrack.title}
                artist={currentTrack.artist}
              />
            )}
          </motion.div>

          <div className="absolute inset-0 z-10 bg-black/40">
            <MusicVisualizer
              variant={visualizerStyle}
              className="h-full opacity-70"
              isPlaying={isPlaying} // Pass isPlaying directly from PlayerContext
              // audioUrl={audioUrlForVisualizer} // Optional: if your visualizer primarily uses this
              // color={themeColors.primary} // Optional: if you want to force a color
            />
          </div>
        </div>
      </div>

      {/* Right Panel: Memories & About Section */}
      <div className="lg:w-1/2 flex flex-col gap-6">
        {/* Memories Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-2xl font-bold ${titleColor()}`}>Memories</h2>
            <button
              onClick={handleAddMemoryClick}
              className={`${buttonStyles()}`}
            >
              <TagIcon className="mr-2 h-4 w-4" />
              Add Memory
            </button>
          </div>

          {user ? (
            trackMemories.length === 0 ? (
              <div
                className={`p-6 text-center ${getPanelGradientStyle()} bg-gradient-to-r rounded-lg`}
              >
                <TagIcon
                  size={32}
                  className="mx-auto mb-2 text-gray-400 opacity-40"
                />
                <h3 className="text-lg font-medium mb-1">No memories yet</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Connect this song to a moment.
                </p>
                <button
                  onClick={() => setIsAddingMemory(true)}
                  className={`${buttonStyles()}`}
                >
                  Tag a Memory
                </button>
              </div>
            ) : (
              <motion.div
                className="space-y-4 max-h-[calc(50vh-120px)] overflow-y-auto pr-2 custom-scrollbar"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
                }}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence>
                  {trackMemories.map((memory) => (
                    <motion.div
                      key={memory.id}
                      className="bg-black/30 border border-white/10 rounded-lg p-4 hover:bg-black/40 transition-colors shadow-md"
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        show: { opacity: 1, y: 0 },
                      }}
                      exit={{ opacity: 0, y: -15 }}
                      whileHover={{ scale: 1.015 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {memory.title && (
                        <h3 className="text-lg font-semibold mb-2 text-electric">
                          {memory.title}
                        </h3>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3 text-sm">
                        {memory.date && (
                          <div className="flex items-center">
                            <Calendar
                              size={14}
                              className="mr-2 text-gray-400"
                            />
                            {memory.date}
                          </div>
                        )}
                        {memory.location && (
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-2 text-gray-400" />
                            {memory.location}
                          </div>
                        )}
                        {memory.activity && (
                          <div className="flex items-center">
                            <Activity
                              size={14}
                              className="mr-2 text-gray-400"
                            />
                            {memory.activity}
                          </div>
                        )}
                        {memory.mood && (
                          <div className="flex items-center">
                            <TagIcon size={14} className="mr-2 text-gray-400" />
                            {memory.mood}
                          </div>
                        )}
                      </div>
                      {memory.people && memory.people.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <Users size={15} className="mr-1 text-gray-400" />
                          {memory.people.map((person, index) => (
                            <span
                              key={index}
                              className="text-xs bg-white/10 px-2 py-1 rounded-full"
                            >
                              {person}
                            </span>
                          ))}
                        </div>
                      )}
                      {memory.note && (
                        <p className="text-sm italic text-gray-300 bg-black/20 p-3 rounded-md">
                          "{memory.note}"
                        </p>
                      )}
                      {memory.photoUrl && (
                        <img
                          src={memory.photoUrl}
                          alt="Memory"
                          className="mt-3 w-full max-h-40 object-cover rounded-md shadow-sm"
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )
          ) : (
            <div
              className={`p-6 text-center ${getPanelGradientStyle()} rounded-lg flex flex-col items-center justify-center`}
            >
              <LogIn size={32} className="mb-4 text-gray-400 opacity-40" />
              <h3 className="text-lg font-medium mb-2">Log In for Memories</h3>
              <p className="text-gray-400 text-sm mb-4">
                Access your song memories by logging in.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className={`${buttonStyles()}`}
              >
                Log In or Sign Up
              </button>
            </div>
          )}
        </div>

        {/* About This Track Section */}
        <div
          className={`${getPanelGradientStyle()} bg-gradient-to-r rounded-lg p-5 shadow-md`}
        >
          <h2
            className={`text-2xl font-bold mb-4 flex items-center ${titleColor()}`}
          >
            <Info size={24} className="mr-3" />
            About This Track
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <Music2 size={18} className="mr-3 text-gray-400" />
              <div>
                <span className="font-semibold text-gray-200">Title:</span>{" "}
                {currentTrack.title}
              </div>
            </div>
            <div className="flex items-center">
              <Mic2 size={18} className="mr-3 text-gray-400" />
              <div>
                <span className="font-semibold text-gray-200">Artist:</span>{" "}
                {currentTrack.artist}
              </div>
            </div>
            {currentTrack.album && (
              <div className="flex items-center">
                <Disc3 size={18} className="mr-3 text-gray-400" />
                <div>
                  <span className="font-semibold text-gray-200">Album:</span>{" "}
                  {currentTrack.album}
                </div>
              </div>
            )}
            {currentTrack.year && (
              <div className="flex items-center">
                <Calendar size={18} className="mr-3 text-gray-400" />
                <div>
                  <span className="font-semibold text-gray-200">Year:</span>{" "}
                  {currentTrack.year}
                </div>
              </div>
            )}
            {currentTrack.genre && (
              <div className="flex items-center">
                <TagIcon size={18} className="mr-3 text-gray-400" />
                <div>
                  <span className="font-semibold text-gray-200">Genre:</span>{" "}
                  {currentTrack.genre}
                </div>
              </div>
            )}
            {/* You can add more details from currentTrack if available */}
          </div>
        </div>

        <p className={`text-left text-2xl font-bold ${titleColor()}`}>
          Visualizations
        </p>
        <div className="flex justify-start mb-4 gap-2 flex-wrap">
          {" "}
          {/* Added flex-wrap */}
          {visualizerStyles.map((style) => (
            <Button
              key={style.id}
              variant={visualizerStyle === style.id ? "default" : "outline"}
              className={`${
                visualizerStyle === style.id
                  ? "bg-electric text-white"
                  : "border-white/20 text-gray-300 hover:bg-white/10"
              } transition-all duration-200`}
              size="sm"
              onClick={() => setVisualizerStyle(style.id)} // Type is already VisualizerVariant
            >
              {style.label}
            </Button>
          ))}
        </div>
      </div>

      {currentTrack && (
        <MemoryDialog
          isOpen={isAddingMemory}
          onClose={() => setIsAddingMemory(false)}
          onSave={handleAddMemory}
          track={currentTrack}
        />
      )}
    </motion.div>
  );
};

export default NowPlaying;
