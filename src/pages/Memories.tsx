import React, { useEffect, useState } from "react";
import { useMemory } from "@/context/MemoryContext";
import { usePlayer } from "@/context/PlayerContext";
import { useLibrary } from "@/context/LibraryContext";
import { TagIcon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Track } from "@/types/music";
import { Memory, MemoryFormInput } from "@/types/memory";
import { MemoryDialog } from "@/components/memory/MemoryDialog";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MemoryList } from "@/components/memory/MemoryList";
import { DeleteMemoryDialog } from "@/components/memory/DeleteMemoryDialog";

/**
 * Memories Page
 *
 * Displays a timeline of memories associated with tracks in the library,
 * allowing users to browse and relive their music memories with AI enhancements.
 */
const Memories: React.FC = () => {
  const {
    getAllMemories,
    addMemoryToTrack,
    updateMemory,
    removeMemoryFromTrack,
  } = useMemory();
  const { startPlaybackSession, currentTrack } = usePlayer();
  const { tracks } = useLibrary();
  const { theme, isDarkTheme } = useTheme();
  const { user } = useAuth();

  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [memoryToEdit, setMemoryToEdit] = useState<Memory | null>(null);
  const [memoryToDelete, setMemoryToDelete] = useState<Memory | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load memories when the component mounts or user changes
  useEffect(() => {
    const loadMemories = async () => {
      setIsLoadingMemories(true);

      if (user) {
        try {
          const allMemories = await getAllMemories();

          // Sort memories by date (newest first)
          const sortedMemories = allMemories.sort((a, b) => {
            // Compare dates first
            if (a.date && b.date) {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            }

            // If dates are missing, compare creation dates
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          setMemories(sortedMemories);
        } catch (err) {
          console.error("Error loading memories:", err);
        }
      } else {
        setMemories([]);
      }

      setIsLoadingMemories(false);
    };

    loadMemories();
  }, [user, getAllMemories]);

  // Create a mapping of track IDs to track information for quick lookup
  const trackMap = tracks.reduce(
    (map, track) => {
      map[track.id] = track;
      return map;
    },
    {} as Record<string, Track>,
  );

  // Handle adding new memory
  const handleAddMemory = async (newMemory: MemoryFormInput) => {
    if (!selectedTrack) return;

    try {
      await addMemoryToTrack(selectedTrack.id, newMemory);
      setShowMemoryForm(false);

      // Refresh memories
      const updatedMemories = await getAllMemories();
      setMemories(
        updatedMemories.sort((a, b) => {
          if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }),
      );
    } catch (err) {
      console.error("Error adding memory:", err);
    }
  };

  // Play this track as a new session
  const handlePlayTrackFromMemory = (trackToPlay: Track) => {
    if (trackToPlay) {
      startPlaybackSession([trackToPlay], 0);
    }
  };

  // Handle updating existing memory
  const handleUpdateMemory = async (updatedMemory: MemoryFormInput) => {
    if (!memoryToEdit) return;

    try {
      await updateMemory(memoryToEdit.id, updatedMemory);
      setMemoryToEdit(null);
      setShowMemoryForm(false);

      // Refresh memories
      const updatedMemories = await getAllMemories();
      setMemories(
        updatedMemories.sort((a, b) => {
          if (a.date && b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }),
      );
    } catch (err) {
      console.error("Error updating memory:", err);
    }
  };

  // Handle deleting memory with confirmation
  const handleDeleteMemory = async () => {
    if (!memoryToDelete) return;

    try {
      await removeMemoryFromTrack(memoryToDelete.id);

      // Update local state after deletion
      setMemories((prev) =>
        prev.filter((memory) => memory.id !== memoryToDelete.id),
      );
      setShowDeleteDialog(false);
      setMemoryToDelete(null);
    } catch (err) {
      console.error("Error deleting memory:", err);
    }
  };

  // Handle selecting a track for adding a memory
  const handleAddMemoryClick = () => {
    // If there's a currently playing track, use that
    if (currentTrack) {
      setSelectedTrack(currentTrack);
    }
    // Otherwise use the first track in the library
    else if (tracks.length > 0) {
      setSelectedTrack(tracks[0]);
    }

    setMemoryToEdit(null);
    setShowMemoryForm(true);
  };

  // Handle Edit Memory click
  const handleEditMemoryClick = (memory: Memory) => {
    const track = trackMap[memory.trackId] || {
      id: "unknown",
      title: "Unknown Track",
      artist: "Unknown Artist",
      duration: 0,
      file_path: "",
      play_count: 0,
    };

    setSelectedTrack(track);
    setMemoryToEdit(memory);
    setShowMemoryForm(true);
  };

  // Handle Delete Memory click
  const handleDeleteMemoryClick = (memory: Memory) => {
    setMemoryToDelete(memory);
    setShowDeleteDialog(true);
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

  const addMemoryButtonStyles = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk": // Main: #0066FF
        return `border border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/30`;
      case "midnight-ash": // Main: #33C3F0
        return `border border-[#33C3F0] text-[#33C3F0] hover:bg-[#33C3F0]/30`;
      case "obsidian-veil": // Main: #7E69AB
        return `border border-[#7E69AB] text-[#7E69AB] hover:bg-[#7E69AB]/30`;
      case "noir-eclipse": // Main: #9F9EA1
        return `border border-[#9F9EA1] text-[#9F9EA1] hover:bg-[#9F9EA1]/30`;
      case "shadow-ember": // Main: #ea384d
        return `border border-[#ea384d] text-[#ea384d] hover:bg-[#ea384d]/30`;

      // Light Themes
      case "light": // Grays
        return `border border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/30`; // Darker border/text
      case "morning-haze": // Text Primary: #4A7AB5, BG Accent: #D3E4FD
        return `border border-[#4A7AB5] text-[#4A7AB5] hover:bg-[#D3E4FD]/40`;
      case "ivory-bloom": // Text Primary: #C77986, BG Accent: #FFDEE2
        return `border border-[#C77986] text-[#C77986] hover:bg-[#FFDEE2]/40`;
      case "sunlit-linen": // Text Primary: #A98127, BG Accent: #FEF7CD
        return `border border-[#A98127] text-[#A98127] hover:bg-[#FEF7CD]/40`;
      case "cloudpetal": // Text Primary: #C77986 (Pink), BG Accent: #FFDEE2 (Pink for consistency)
        return `border border-[#C77986] text-[#C77986] hover:bg-[#FFDEE2]/40`;

      default:
        if (isDarkTheme) {
          // Default to Cyberpunk outline style
          return `border border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/30`;
        } else {
          // Default to Light outline style
          return `border-gray-400 text-gray-700 hover:bg-gray-100`;
        }
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-8 ${titleColor()}`}>Memories</h1>
        <Alert>
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            Please sign in to view and manage your memories.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${titleColor()}`}>
          Your Memory Timeline
        </h1>
        <button
          onClick={handleAddMemoryClick}
          className={`${addMemoryButtonStyles()} flex items-center gap-1.5 px-3.5 py-2 rounded-lg`}
        >
          <TagIcon className="mr-2 h-4 w-4" />
          Add Memory
        </button>
      </div>

      <MemoryList
        memories={memories}
        isLoading={isLoadingMemories}
        trackMap={trackMap}
        onAddMemoryClick={handleAddMemoryClick}
        onEditMemory={handleEditMemoryClick}
        onDeleteMemory={handleDeleteMemoryClick}
        onPlayTrack={handlePlayTrackFromMemory}
      />

      {/* Memory form dialog */}
      {selectedTrack && (
        <MemoryDialog
          isOpen={showMemoryForm}
          onClose={() => {
            setShowMemoryForm(false);
            setMemoryToEdit(null);
          }}
          onSave={memoryToEdit ? handleUpdateMemory : handleAddMemory}
          track={selectedTrack}
          initialMemoryData={
            memoryToEdit
              ? {
                  title: memoryToEdit.title,
                  date: memoryToEdit.date,
                  location: memoryToEdit.location,
                  people: memoryToEdit.people,
                  mood: memoryToEdit.mood,
                  activity: memoryToEdit.activity,
                  note: memoryToEdit.note,
                  photoUrl: memoryToEdit.photoUrl,
                }
              : undefined
          }
        />
      )}

      {/* Confirmation Dialog for Deletion */}
      <DeleteMemoryDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteMemory}
        onCancel={() => setMemoryToDelete(null)}
      />
    </div>
  );
};

export default Memories;
