import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";
import { Track } from "@/types/music";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd"; // Updated import type
import { AlbumArtFallback } from "@/components/music/AlbumArtFallback";
import { Button } from "@/components/ui/button";
import { Music, Pause, Play, Repeat, Repeat1, Shuffle, Trash2, X as CloseIcon } from "lucide-react"; // Changed X to CloseIcon for clarity
import { toast } from "@/hooks/use-toast"; // Assuming this is your custom toast from hooks
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext"; // Added useTheme for styling

/**
 * @file PlayQueue.tsx
 * @description Displays and manages the current music playback queue.
 * Allows users to view upcoming tracks, reorder them via drag-and-drop,
 * clear the queue, remove individual tracks, and control shuffle/repeat modes
 * by interacting with the global PlayerContext.
 */
const PlayQueue: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    trackQueue,
    setTrackQueue,
    playTrackFromQueueItem,
    togglePlayPause,
    isShuffleEnabled,
    toggleShuffle,
    repeatMode,
    setRepeatMode,
    clearQueue,
    removeFromQueue,
  } = usePlayer();

  const { themeColors, theme, isDarkTheme } = useTheme(); // For theme-aware styling
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Handles the end of a drag-and-drop operation to reorder tracks in the queue.
  const handleDragEnd = (result: DropResult) => {
    setDraggingId(null);
    if (!result.destination) return;

    const newQueue = Array.from(trackQueue);
    const [removed] = newQueue.splice(result.source.index, 1);
    newQueue.splice(result.destination.index, 0, removed);

    setTrackQueue(newQueue); // This updates the local view and PlayerContext's trackQueue
    toast({ title: "Queue order updated" });
  };

  // Sets the ID of the track being dragged for visual feedback.
  const handleDragStart = (result: any) => {
    // Using 'any' for result from dnd library if specific type is complex
    if (result.draggableId) {
      setDraggingId(result.draggableId);
    }
  };

  // Clears all tracks from the queue using the context function.
  const handleClearQueue = () => {
    if (trackQueue.length === 0) {
      toast({ title: "Queue is already empty" });
      return;
    }
    clearQueue(); // Uses context's clearQueue
    // Toast is handled by context's clearQueue
  };

  // Removes a specific track from the queue using the context function.
  const handleRemoveTrack = (trackId: string) => {
    removeFromQueue(trackId); // Uses context's removeFromQueue
    // Toast is handled by context's removeFromQueue
  };

  // Toggles the shuffle mode using the context function.
  const handleToggleShuffle = () => {
    toggleShuffle(); // Uses context's toggleShuffle
    // Toast is handled by context's toggleShuffle
  };

  // Cycles through repeat modes (none, all, one) and updates context.
  const handleToggleRepeatMode = () => {
    const modes: ("none" | "all" | "one")[] = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    setRepeatMode(nextMode);

    const messages = {
      none: "Repeat: Off",
      all: "Repeat: All",
      one: "Repeat: Current Track",
    };
    toast({ title: messages[nextMode] });
  };

  // Plays a specific track from the queue using the context function.
  const handlePlayTrackFromQueue = (track: Track) => {
    playTrackFromQueueItem(track); // Uses context's specific function
  };

  // Component for the Repeat button, showing current mode.
  const RepeatButtonIcon = () => {
    let IconComponent = Repeat;
    let title = "Repeat: Off";
    if (repeatMode === "all") title = "Repeat: All Tracks";
    if (repeatMode === "one") {
      IconComponent = Repeat1;
      title = "Repeat: Current Track";
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 h-auto text-xs",
          repeatMode !== "none" &&
            `bg-[${themeColors.primary}]/20 text-[${themeColors.primary}] border-[${themeColors.primary}]/30`,
        )}
        onClick={handleToggleRepeatMode}
        title={title}
      >
        <IconComponent size={14} />
        <span>
          {repeatMode === "one" ? "One" : repeatMode === "all" ? "All" : "Off"}
        </span>
      </Button>
    );
  };

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

  const queueStyle = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return `bg-[#00081A]/80 hover:bg-[#00112A]/70 hover:border hover:border-electric`;
      case "midnight-ash":
        return `bg-[#071318]/60 hover:bg-[#0A1D24]/70 hover:border hover:border-[#33C3F0]`;
      case "obsidian-veil":
        return `bg-[#160F20]/60 hover:bg-[#221830]/70 hover:border hover:border-[#7E69AB]`;
      case "noir-eclipse":
        return `bg-black/50 hover:bg-black/60 hover:border hover:border-[#9F9EA1]`;
      case "shadow-ember":
        return `bg-[#1F070A]/60 hover:bg-[#3B0E13]/70 hover:border hover:border-[#ea384d]`;

      // Light Themes
      case "light":
        return `bg-gray-100/70 hover:bg-gray-200/90 hover:border hover:border-electric`;
      case "morning-haze":
        return `bg-[#EBF4FF]/80 hover:bg-[#E0ECFB]/95 hover:border hover:border-[#4A7AB5]`;
      case "ivory-bloom":
        return `bg-[#FFF0F2]/80 hover:bg-[#FFF5F7]/95 hover:border hover:border-[#C77986]`;
      case "sunlit-linen":
        return `bg-[#FFFBEF]/80 hover:bg-[#FEFCF0]/95 hover:border hover:border-[#A98127]`;
      case "cloudpetal":
        return `bg-[#FFF0F2]/80 hover:bg-[#FFF5F7]/95 hover:border hover:border-[#C77986]`;

      default:
        return isDarkTheme
          ? `bg-[#00081A]/80 hover:bg-[#00112A]/70 hover:border hover:border-[electric]`
          : `bg-gray-100/70 hover:bg-gray-200/90 hover:border hover:border-electric`;
    }
  };

  const nowPlayingStyle = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return `bg-[#00112A]/70 border border-electric`;
      case "midnight-ash":
        return `bg-[#0A1D24]/70 border border-[#33C3F0]`;
      case "obsidian-veil":
        return `bg-[#221830]/70 border border-[#7E69AB]`;
      case "noir-eclipse":
        return `bg-black/60 border border-[#9F9EA1]`;
      case "shadow-ember":
        return `bg-[#3B0E13]/70 border border-[#ea384d]`;

      // Light Themes
      case "light":
        return `bg-[#00112A]/70 border border-electric`;
      case "morning-haze":
        return `bg-[#E0ECFB]/95 border border-[#4A7AB5]`;
      case "ivory-bloom":
        return `bg-[#FFF5F7]/95 border border-[#C77986]`;
      case "sunlit-linen":
        return `bg-[#FEFCF0]/95 border border-[#A98127]`;
      case "cloudpetal":
        return `bg-[#FFF5F7]/95 border border-[#C77986]`;

      default:
        return isDarkTheme
          ? `bg-[#00081A]/80 hover:bg-[#00112A]/70 hover:border hover:border-[electric]`
          : `bg-gray-100/70 hover:bg-gray-200/90 hover:border hover:border-electric`;
    }
  };

  return (
    <motion.div
      className="space-y-6 pb-20 px-1 sm:px-0" // Added slight horizontal padding for very small screens
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className={`text-2xl font-bold ${titleColor()}`}>Play Queue</h1>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 h-auto text-xs",
              isShuffleEnabled &&
                `bg-[${themeColors.primary}]/40 hover:bg-[${themeColors.primary}]/20 text-[${themeColors.primary}] hover:text-[${themeColors.primary}]/70 border-[${themeColors.primary}]/30`,
            )}
            onClick={handleToggleShuffle}
            title={isShuffleEnabled ? "Disable shuffle" : "Enable shuffle"}
          >
            <Shuffle size={14} />
            <span>Shuffle {isShuffleEnabled ? "On" : "Off"}</span>
          </Button>
          <RepeatButtonIcon />
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1.5 px-2.5 py-1.5 h-auto text-xs"
            onClick={handleClearQueue}
            title="Clear entire queue"
            disabled={trackQueue.length === 0}
          >
            <Trash2 size={14} />
            <span>Clear Queue</span>
          </Button>
        </div>
      </div>

      {currentTrack && (
        <div className="mb-4">
          <h2
            className={`text-base sm:text-lg font-semibold mb-2 ${titleColor()} opacity-70`}
          >
            Now Playing
          </h2>
          <div
            className={cn(
              "rounded-lg p-3 flex items-center gap-3 sm:gap-4",
              nowPlayingStyle(),
            )}
          >
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 bg-neutral-700/30 rounded-md overflow-hidden flex-shrink-0">
              {currentTrack.albumArt ? (
                <img
                  src={currentTrack.albumArt}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <AlbumArtFallback
                  title={currentTrack.title}
                  artist={currentTrack.artist || "Unknown Artist"}
                  size="sm"
                />
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium truncate">
                {currentTrack.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {currentTrack.artist || "Unknown Artist"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 rounded-full",
                isDarkTheme
                  ? "text-gray-300 hover:bg-white/10"
                  : "text-gray-600 hover:bg-black/5",
              )}
            >
              {isPlaying ? (
                <Pause size={18} />
              ) : (
                <Play size={18} className="ml-0.5" />
              )}
            </Button>
          </div>
        </div>
      )}

      <div>
        <h2
          className={`text-base sm:text-lg font-semibold mb-2 ${titleColor()} opacity-70`}
        >
          Up Next ({trackQueue.filter((t) => t.id !== currentTrack?.id).length})
        </h2>
        {trackQueue.length === 0 ||
        (trackQueue.length === 1 && trackQueue[0].id === currentTrack?.id) ? (
          <div className={cn("text-center py-10 rounded-lg", queueStyle())}>
            <Music size={36} className="mx-auto mb-3 opacity-30" />
            <h3 className="text-md sm:text-lg font-medium">Queue is Empty</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Add songs to see them here.
            </p>
          </div>
        ) : (
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <Droppable droppableId="play-queue">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-1.5"
                >
                  {trackQueue.map((track, index) => {
                    // Do not render the current track in "Up Next" if it's the only one or if it's the actual current track
                    if (track.id === currentTrack?.id) return null;

                    return (
                      <Draggable
                        key={track.id}
                        draggableId={track.id}
                        index={index}
                      >
                        {(providedDraggable, snapshot) => (
                          <li
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            className={cn(
                              "flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg transition-all duration-150 ease-out",
                              queueStyle(),
                              snapshot.isDragging &&
                                `ring-2 shadow-xl opacity-95 ring-[${themeColors.primary}] bg-[${themeColors.primary}]/20`,
                              draggingId &&
                                draggingId !== track.id &&
                                "opacity-60",
                            )}
                          >
                            <div className="w-5 text-center text-xs text-muted-foreground hidden sm:block">
                              {index + 1}
                            </div>
                            <div className="relative h-9 w-9 sm:h-10 sm:w-10 bg-neutral-700/30 rounded-md overflow-hidden flex-shrink-0">
                              {track.albumArt ? (
                                <img
                                  src={track.albumArt}
                                  alt={track.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <AlbumArtFallback
                                  title={track.title}
                                  artist={track.artist || "Unknown Artist"}
                                  size="sm"
                                />
                              )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium truncate">
                                {track.title}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                {track.artist || "Unknown Artist"}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePlayTrackFromQueue(track)}
                                className={cn(
                                  "h-7 w-7 sm:h-8 sm:w-8 rounded-full",
                                  isDarkTheme
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-500 hover:text-black",
                                )}
                              >
                                <Play size={14} className="ml-0.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTrack(track.id)}
                                className={cn(
                                  "h-7 w-7 sm:h-8 sm:w-8 rounded-full text-muted-foreground hover:text-destructive",
                                  isDarkTheme
                                    ? "hover:bg-red-500/10"
                                    : "hover:bg-red-500/10",
                                )}
                              >
                                <CloseIcon size={16} />
                              </Button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </motion.div>
  );
};

export default PlayQueue;
