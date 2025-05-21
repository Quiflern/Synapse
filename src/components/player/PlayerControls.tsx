import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListOrdered,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Tag,
  Volume1,
  Volume2,
  VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/context/PlayerContext";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { SleepTimer } from "./SleepTimer";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlbumArtFallback } from "@/components/music/AlbumArtFallback";

/**
 * PlayerControls - Bottom player bar component
 *
 * Implements playback controls, progress tracking, and volume control
 * for the currently playing track, and provides access to memory tagging.
 */
export const PlayerControls: React.FC = () => {
  const navigate = useNavigate();
  const { themeColors, isDarkTheme } = useTheme();
  const isMobile = useIsMobile();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seek,
    setVolume,
    isShuffleEnabled,
    repeatMode,
    toggleShuffle,
    setRepeatMode,
  } = usePlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeSliderRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleProgressChange = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handleOpenNowPlaying = () => {
    navigate("/app/now-playing");
  };

  const handleOpenQueue = () => {
    navigate("/app/queue");
  };

  const handleTagMemory = () => {
    if (!currentTrack) return;
    navigate("/app/memories", {
      state: { createNew: true, trackId: currentTrack.id },
    });
    toast.info("Create a new memory for this track", {
      description: `Tag a memory for "${currentTrack.title}" by ${currentTrack.artist}`,
    });
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={18} />;
    if (volume < 0.5) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  const handleToggleShuffleClick = () => {
    toggleShuffle();
    toast.info(isShuffleEnabled ? "Shuffle disabled" : "Shuffle enabled");
  };

  const toggleRepeat = () => {
    const modes: ("none" | "all" | "one")[] = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);

    const messages = {
      none: "Repeat disabled",
      all: "Repeating all tracks",
      one: "Repeating current track",
    };

    toast.info(messages[nextMode]);
  };

  // Effects for shuffle and repeat
  useEffect(() => {
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      audioElement.loop = repeatMode === "one";
    }
  }, [repeatMode]);

  // Get theme-specific styles for the player background
  const getPlayerBackground = () => {
    if (isDarkTheme) {
      return `bg-gradient-to-r from-black/80 via-[${themeColors.primary}]/10 to-black/80 backdrop-blur-lg border-t border-[${themeColors.primary}]/20`;
    } else {
      return `bg-gradient-to-r from-white/80 via-[${themeColors.primary}]/5 to-white/80 backdrop-blur-lg border-t border-[${themeColors.primary}]/20`;
    }
  };

  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 ${isDarkTheme ? "bg-black/70" : "bg-white/90"} backdrop-blur-lg border-t ${isDarkTheme ? "border-white/10" : "border-gray-200"} z-50`}
      style={{
        background: isDarkTheme
          ? `linear-gradient(to right, rgba(0,0,0,0.8), rgba(${parseInt(themeColors.primary.slice(1, 3), 16)}, ${parseInt(themeColors.primary.slice(3, 5), 16)}, ${parseInt(themeColors.primary.slice(5, 7), 16)}, 0.1), rgba(0,0,0,0.8))`
          : `linear-gradient(to right, rgba(255,255,255,0.9), rgba(${parseInt(themeColors.primary.slice(1, 3), 16)}, ${parseInt(themeColors.primary.slice(3, 5), 16)}, ${parseInt(themeColors.primary.slice(5, 7), 16)}, 0.05), rgba(255,255,255,0.9))`,
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto flex flex-col">
        {/* Progress bar */}
        <div className="w-full h-1 relative group">
          {/* Time labels above the progress bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 -mt-6 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>{currentTrack ? formatTime(currentTime) : "--:--"}</span>
            <span>{currentTrack ? formatTime(duration) : "--:--"}</span>
          </div>

          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="absolute top-0 left-0 right-0 -mt-3 pt-3 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={!currentTrack}
          />
          <div
            className="h-1 bg-electric theme-light:bg-primary"
            style={{
              width: `${currentTrack ? (currentTime / duration) * 100 : 0}%`,
              backgroundColor: themeColors.primary,
            }}
          />
        </div>

        <div
          className={`flex items-center justify-between ${isMobile ? "py-2 px-2" : "py-3 px-4"}`}
        >
          {/* Album Art & Track Info */}
          <AnimatePresence mode="wait">
            {currentTrack ? (
              <motion.div
                key={currentTrack.id}
                className={`flex items-center ${isMobile ? "w-1/3" : "w-1/4"}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`${isMobile ? "h-10 w-10" : "h-14 w-14"} bg-black/40 rounded overflow-hidden mr-2 relative group cursor-pointer theme-light:bg-gray-100`}
                  onClick={handleOpenNowPlaying}
                >
                  {currentTrack.albumArt ? (
                    <img
                      src={currentTrack.albumArt}
                      alt={currentTrack.album || "Album Art"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = "none";
                        const fallbackSize = isMobile ? "sm" : "md";
                        const fallback = document.createElement("div");
                        fallback.appendChild(
                          document.createRange().createContextualFragment(
                            `<div class="h-full w-full flex items-center justify-center bg-black/20">
                              <svg xmlns="http://www.w3.org/2000/svg" width="${isMobile ? 18 : 24}" height="${isMobile ? 18 : 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                                <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="12" r="6"></circle>
                              </svg>
                            </div>`,
                          ),
                        );
                        e.currentTarget.parentElement?.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <AlbumArtFallback
                      title={currentTrack.title}
                      artist={currentTrack.artist}
                      size={isMobile ? "sm" : "md"}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 size={16} className="text-white" />
                  </div>
                </div>
                <div className="truncate">
                  <div
                    className={`${isMobile ? "text-xs" : "text-sm"} font-medium truncate theme-light:text-gray-900`}
                  >
                    {currentTrack.title}
                  </div>
                  <div
                    className={`${isMobile ? "text-[10px]" : "text-xs"} text-gray-400 truncate theme-light:text-gray-600`}
                  >
                    {currentTrack.artist}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className={`flex items-center ${isMobile ? "w-1/3" : "w-1/4"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-xs text-gray-400 theme-light:text-gray-500">
                  {isMobile ? "No track" : "No track selected"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playback Controls */}
          <div
            className={`flex flex-col items-center ${isMobile ? "w-1/3" : "w-2/4"}`}
          >
            <div className="flex items-center space-x-2 md:space-x-4">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-gray-400 hover:text-white hover:bg-transparent transition-colors theme-light:hover:text-primary ${isShuffleEnabled ? "text-electric theme-light:text-primary" : ""}`}
                  disabled={!currentTrack}
                  onClick={handleToggleShuffleClick}
                  style={isShuffleEnabled ? { color: themeColors.primary } : {}}
                >
                  <Shuffle size={18} />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={skipToPrevious}
                disabled={!currentTrack}
                className="text-gray-300 hover:text-white hover:bg-transparent transition-colors theme-light:text-gray-600 theme-light:hover:text-primary"
              >
                <SkipBack size={isMobile ? 16 : 20} />
              </Button>

              <motion.button
                onClick={togglePlayPause}
                disabled={!currentTrack}
                className={`flex items-center justify-center rounded-full ${isMobile ? "h-8 w-8" : "h-10 w-10"} text-white transition-colors`}
                style={{
                  backgroundColor: currentTrack
                    ? themeColors.primary
                    : isDarkTheme
                      ? "#4a4a4a"
                      : "#a0a0a0",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? (
                  <Pause size={isMobile ? 16 : 20} />
                ) : (
                  <Play size={isMobile ? 16 : 20} className="ml-0.5" />
                )}
              </motion.button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipToNext}
                disabled={!currentTrack}
                className="text-gray-300 hover:text-white hover:bg-transparent transition-colors theme-light:text-gray-600 theme-light:hover:text-primary"
              >
                <SkipForward size={isMobile ? 16 : 20} />
              </Button>

              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`text-gray-400 hover:text-white hover:bg-transparent transition-colors theme-light:hover:text-primary ${repeatMode !== "none" ? "text-electric theme-light:text-primary" : ""}`}
                  disabled={!currentTrack}
                  onClick={toggleRepeat}
                  style={
                    repeatMode !== "none" ? { color: themeColors.primary } : {}
                  }
                >
                  <div className="relative">
                    <Repeat size={18} />
                    {repeatMode === "one" && (
                      <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/3 bg-black/70 backdrop-blur-sm rounded-full w-4 h-4 flex items-center justify-center theme-light:bg-white/90">
                        <span
                          className="text-[8px] font-semibold"
                          style={{ color: themeColors.primary }}
                        >
                          1
                        </span>
                      </div>
                    )}
                  </div>
                </Button>
              )}
            </div>

            {/* Display time under the playback controls */}
            {!isMobile && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400 min-w-10 text-right theme-light:text-gray-600">
                  {currentTrack ? formatTime(currentTime) : "--:--"}
                </span>

                <span className="text-xs text-gray-400 min-w-10 theme-light:text-gray-600">
                  {currentTrack ? formatTime(duration) : "--:--"}
                </span>
              </div>
            )}
          </div>

          {/* Volume & Additional Controls */}
          <div
            className={`flex items-center justify-end space-x-1 md:space-x-3 ${isMobile ? "w-1/3" : "w-1/4"}`}
          >
            {currentTrack && (
              <>
                {!isMobile && (
                  <div
                    className="relative"
                    ref={volumeSliderRef}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white hover:bg-transparent transition-colors theme-light:text-gray-600 theme-light:hover:text-primary"
                    >
                      {getVolumeIcon()}
                    </Button>

                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          className="absolute bottom-full left-2 -translate-x-1/2 mb-2 p-3 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 theme-light:bg-white theme-light:border-gray-200"
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-40 flex items-center">
                            <span
                              className="text-sm mr-2"
                              style={{ color: themeColors.primary }}
                            >
                              {Math.round(volume * 100)}%
                            </span>

                            <div
                              className="w-full h-12 bg-black rounded-md relative cursor-pointer overflow-hidden"
                              onMouseDown={(e) => {
                                const sliderEl = e.currentTarget;
                                const updateVolume = (moveEvent) => {
                                  const rect = sliderEl.getBoundingClientRect();
                                  const position =
                                    moveEvent.clientX - rect.left;
                                  const percentage =
                                    (position / rect.width) * 100;
                                  const clampedPercentage = Math.max(
                                    0,
                                    Math.min(100, percentage),
                                  );
                                  handleVolumeChange([clampedPercentage]);
                                };

                                updateVolume(e);

                                const onMouseMove = (moveEvent) => {
                                  updateVolume(moveEvent);
                                };

                                const onMouseUp = () => {
                                  document.removeEventListener(
                                    "mousemove",
                                    onMouseMove,
                                  );
                                  document.removeEventListener(
                                    "mouseup",
                                    onMouseUp,
                                  );
                                };

                                document.addEventListener(
                                  "mousemove",
                                  onMouseMove,
                                );
                                document.addEventListener("mouseup", onMouseUp);
                              }}
                            >
                              {/* Equalizer bars */}
                              <div className="absolute inset-0 flex items-end justify-between px-1">
                                {Array.from({ length: 15 }).map((_, index) => {
                                  // Calculate if this bar should be active based on volume
                                  const position = (index / 14) * 100;
                                  const isActive = position <= volume * 100;

                                  // Create a random height pattern for the equalizer effect
                                  const randomHeight =
                                    30 +
                                    Math.sin(index * 0.8) * 40 +
                                    Math.cos(index * 0.3) * 20;
                                  const height = isActive ? randomHeight : 10;

                                  return (
                                    <div
                                      key={index}
                                      className="w-1 rounded-t-sm transition-all duration-150"
                                      style={{
                                        height: `${height}%`,
                                        backgroundColor: isActive
                                          ? themeColors.primary
                                          : "#333",
                                        animation: isActive
                                          ? `equalizer ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`
                                          : "none",
                                        animationDelay: `${index * 0.05}s`,
                                      }}
                                    />
                                  );
                                })}
                              </div>

                              {/* Volume level indicator */}
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-white"
                                style={{
                                  left: `${volume * 100}%`,
                                  boxShadow: `0 0 4px white`,
                                  zIndex: 10,
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!isMobile && (
                  <div className="relative">
                    <SleepTimer />
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  title="Tag Memory"
                  onClick={handleTagMemory}
                  style={{ color: themeColors.primary }}
                  className="hover:bg-electric/10 transition-colors theme-light:hover:bg-primary/10"
                >
                  <Tag size={isMobile ? 16 : 18} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenQueue}
                  title="Play Queue"
                  style={{ color: themeColors.primary }}
                  className="hover:bg-electric/10 transition-colors theme-light:hover:bg-primary/10"
                >
                  <ListOrdered size={isMobile ? 16 : 18} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
