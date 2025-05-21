import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { useAuth } from "@/context/AuthContext";
import { MusicGrid } from "@/components/music/MusicGrid";
import { AnimatePresence, motion } from "framer-motion";
import { Track } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { toast } from "@/components/ui/use-toast";
import {
  ListFilter,
  Play,
  RefreshCcw,
  Search as SearchIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import * as musicMetadata from "music-metadata";
import UploadForm from "@/components/music/UploadForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

type SortOption =
  | "title_asc"
  | "title_desc"
  | "artist_asc"
  | "artist_desc"
  | "date_added_asc"
  | "date_added_desc";

/**
 * @file Library.tsx
 * @description This component serves as the main view for the user's music library.
 * It displays all tracks (both uploaded and local), provides functionality for
 * playing, uploading, refreshing, and managing local tracks. It also includes
 * robust filtering (by view type, search term) and sorting capabilities.
 * Drag and drop functionality for local file playback is supported.
 */
const Library: React.FC = () => {
  const { tracks, isLoading, refreshLibrary } = useLibrary();
  const { startPlaybackSession } = usePlayer();
  const { themeColors, theme, isDarkTheme } = useTheme();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("date_added_desc");
  const [viewType, setViewType] = useState<"all" | "local" | "uploaded">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  /**
   * Effect to load local tracks from localStorage on component mount.
   */
  useEffect(() => {
    const savedTracks = localStorage.getItem("synapse-local-tracks");
    if (savedTracks) {
      try {
        setLocalTracks(JSON.parse(savedTracks));
      } catch (error) {
        console.error("Error loading local tracks:", error);
        localStorage.removeItem("synapse-local-tracks"); // Clear corrupted data
      }
    }
  }, []);

  /**
   * Effect to save local tracks to localStorage whenever they change.
   * Clears localStorage if localTracks becomes empty.
   */
  useEffect(() => {
    if (localTracks.length > 0) {
      localStorage.setItem("synapse-local-tracks", JSON.stringify(localTracks));
    } else {
      if (localStorage.getItem("synapse-local-tracks")) {
        localStorage.removeItem("synapse-local-tracks");
      }
    }
  }, [localTracks]);

  /**
   * Framer Motion variants for page transitions.
   */
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } },
  };

  /**
   * Handles refreshing the music library from the source.
   * Shows a loading state and toasts for success or failure.
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshLibrary(true) // Force refresh
      .then(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          toast({ title: "Library refreshed" });
        }, 800); // Delay to show skeleton
      })
      .catch((error) => {
        console.error("Refresh error:", error);
        setIsRefreshing(false);
        toast({ title: "Failed to refresh library", variant: "destructive" });
      });
  };

  /**
   * Opens the music upload modal.
   */
  const handleUpload = () => setShowUploadModal(true);

  /**
   * Clears all local tracks from state and localStorage after confirmation.
   */
  const handleClearLocalTracks = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all local music tracks? This cannot be undone.",
      )
    ) {
      setLocalTracks([]);
      toast({ title: "Local music library cleared" });
    }
  };

  /**
   * Triggers a click on the hidden file input for local file selection.
   */
  const handleLocalFileClick = () => fileInputRef.current?.click();

  /**
   * Handles file selection from the file input.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processLocalFile(files[0]);
      e.target.value = ""; // Reset file input
    }
  };

  /**
   * Handles files dropped onto the component for local playback.
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event.
   */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processLocalFile(e.dataTransfer.files[0]);
    }
  };

  /** Drag event handler for drag over. Sets dragActive state. */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };
  /** Drag event handler for drag enter. Sets dragActive state. */
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };
  /** Drag event handler for drag leave. Clears dragActive state carefully. */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragActive(false);
  };

  /**
   * Processes a local audio file: extracts metadata, creates a track object,
   * adds it to localTracks, and starts playback.
   * @param {File} file - The audio file to process.
   */
  const processLocalFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file.",
        variant: "destructive",
      });
      return;
    }
    try {
      const objectUrl = URL.createObjectURL(file);
      let albumArt: string | undefined = undefined,
        artist = "Unknown Artist",
        album = "Unknown Album";
      let title = file.name.replace(/\.[^/.]+$/, ""),
        duration: number;

      try {
        const metadata = await musicMetadata.parseBlob(file);
        if (metadata.common.title) title = metadata.common.title;
        if (metadata.common.artist) artist = metadata.common.artist;
        if (metadata.common.album) album = metadata.common.album;
        duration = metadata.format.duration || 0;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const picture = metadata.common.picture[0];
          albumArt = URL.createObjectURL(
            new Blob([picture.data], { type: picture.format }),
          );
        }
      } catch (metadataError) {
        console.warn(
          "Metadata extraction failed, falling back for duration:",
          metadataError,
        );
        const audio = new Audio(objectUrl);
        duration = await new Promise<number>((resolve) => {
          audio.onloadedmetadata = () => resolve(audio.duration || 0);
          audio.onerror = () => resolve(0);
          setTimeout(() => resolve(audio.duration || 0), 3000);
        });
      }

      const localTrack: Track = {
        id: `local-${Date.now()}-${encodeURIComponent(file.name)}`,
        title,
        artist,
        album,
        file_path: objectUrl,
        albumArt,
        is_public: false,
        play_count: 0,
        duration,
        memories: [],
        year: undefined,
        genre: undefined,
        uploaded_by: user?.id || "local_user",
      };

      setLocalTracks((prev) => {
        if (
          !prev.some(
            (t) =>
              t.title === localTrack.title &&
              t.artist === localTrack.artist &&
              t.album === localTrack.album,
          )
        )
          return [...prev, localTrack];
        toast({ title: "Track already exists locally" });
        return prev;
      });
      startPlaybackSession([localTrack], 0);
      toast({ title: `Playing ${localTrack.title}` });
    } catch (error) {
      console.error("Error processing audio file:", error);
      toast({ title: "Failed to process audio file", variant: "destructive" });
    }
  };

  /**
   * Updates a local track in the localTracks state.
   * Called by MusicGrid when a local track's metadata is edited.
   * @param {Track} updatedTrack - The track with updated information.
   */
  const handleUpdateLocalTrack = (updatedTrack: Track) => {
    setLocalTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === updatedTrack.id ? updatedTrack : track,
      ),
    );
  };

  /**
   * Deletes a local track from the localTracks state and revokes its ObjectURL.
   * Called by MusicGrid when a local track is deleted.
   * @param {string} trackId - The ID of the track to delete.
   */
  const handleDeleteLocalTrack = (trackId: string) => {
    const trackToDelete = localTracks.find((t) => t.id === trackId);
    setLocalTracks((prevTracks) =>
      prevTracks.filter((track) => track.id !== trackId),
    );
    if (trackToDelete?.file_path.startsWith("blob:")) {
      URL.revokeObjectURL(trackToDelete.file_path);
      if (trackToDelete.albumArt?.startsWith("blob:"))
        URL.revokeObjectURL(trackToDelete.albumArt);
    }
  };

  /**
   * Generates theme-aware CSS classes for buttons.
   * @param {boolean} [isElectric=false] - True if the button should have the 'electric' theme style.
   * @param {boolean} [isDestructive=false] - True if the button is for a destructive action.
   * @returns {string} Tailwind CSS classes.
   */
  const getButtonClass = (isElectric = false, isDestructive = false) => {
    if (isDestructive)
      return "bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-colors text-sm";
    if (isElectric)
      return "bg-electric hover:bg-electric/80 text-black transition-colors text-sm";
    const themeSpecificClass =
      {
        cyberpunk: "bg-electric/20 hover:bg-electric/30 text-electric",
        "midnight-ash": "bg-[#33C3F0]/20 hover:bg-[#33C3F0]/30 text-[#33C3F0]",
        "obsidian-veil": "bg-[#7E69AB]/20 hover:bg-[#7E69AB]/30 text-[#7E69AB]",
        "shadow-ember": "bg-[#ea384d]/20 hover:bg-[#ea384d]/30 text-[#ea384d]",
        "morning-haze": "bg-[#4A7AB5]/20 hover:bg-[#4A7AB5]/30 text-[#4A7AB5]",
        "ivory-bloom": "bg-[#C77986]/20 hover:bg-[#C77986]/30 text-[#C77986]",
        "sunlit-linen": "bg-[#F0E6B8] hover:bg-[#F0E6B8] text-[#A98127]",
        cloudpetal: "bg-[#FFDEE2] hover:bg-[#FFDEE2]/70 text-[#C77986]",
      }[theme] ||
      (isDarkTheme
        ? "bg-primary/20 hover:bg-primary/30 text-primary"
        : "bg-primary/20 hover:bg-primary/30 text-primary");
    return `${themeSpecificClass} transition-colors text-sm`;
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

  const uploadButtonStyles = () => {
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

  /**
   * Generates theme-aware CSS classes for filter toggle group items.
   * @returns {string} Tailwind CSS classes.
   */
  const getFilterAccentClass = () => {
    return (
      {
        cyberpunk:
          "data-[state=on]:bg-electric/80 data-[state=on]:text-black hover:bg-electric/30 text-electric/80",
        "midnight-ash":
          "data-[state=on]:bg-[#33C3F0]/80 data-[state=on]:text-white hover:bg-[#33C3F0]/30 text-[#33C3F0]/80",
        "obsidian-veil":
          "data-[state=on]:bg-[#7E69AB]/80 data-[state=on]:text-white hover:bg-[#7E69AB]/30 text-[#7E69AB]/80",
      }[theme] ||
      (isDarkTheme
        ? "data-[state=on]:bg-primary/70 data-[state=on]:text-primary-foreground hover:bg-primary/30 text-primary/80"
        : "data-[state=on]:bg-primary/80 data-[state=on]:text-primary-foreground hover:bg-primary/20 text-primary/90")
    );
  };

  /**
   * Memoized array of tracks filtered by view type (all, local, uploaded)
   * and then by the search term (title, artist, album).
   */
  const filteredAndSearchedTracks = useMemo(() => {
    let currentTracks: Track[];
    if (viewType === "all") {
      currentTracks = [
        ...tracks.filter(
          (track) => track.is_public || track.uploaded_by === user?.id,
        ),
        ...localTracks,
      ];
    } else if (viewType === "local") {
      currentTracks = localTracks;
    } else {
      // uploaded
      currentTracks = tracks.filter(
        (track) => track.is_public || track.uploaded_by === user?.id,
      );
    }

    if (!searchTerm) return currentTracks;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return currentTracks.filter(
      (track) =>
        track.title.toLowerCase().includes(lowerSearchTerm) ||
        (track.artist &&
          track.artist.toLowerCase().includes(lowerSearchTerm)) ||
        (track.album && track.album.toLowerCase().includes(lowerSearchTerm)),
    );
  }, [tracks, localTracks, viewType, user?.id, searchTerm]);

  /**
   * Retrieves a sortable date string from a track.
   * For local tracks, it parses the timestamp from the ID.
   * For other tracks, or if parsing fails, it returns a default old date.
   * @param {Track} track - The track to get the date from.
   * @returns {string} An ISO date string.
   */
  const getSortableDate = (track: Track): string => {
    if (track.id.startsWith("local-")) {
      const timestamp = parseInt(track.id.split("-")[1]);
      if (!isNaN(timestamp) && timestamp > 0)
        return new Date(timestamp).toISOString();
    }
    return new Date(0).toISOString(); // Default for non-local or unparseable
  };

  /**
   * Memoized array of tracks, sorted based on the current sortOption.
   */
  const sortedTracksToDisplay = useMemo(() => {
    return [...filteredAndSearchedTracks].sort((a, b) => {
      const aDate = getSortableDate(a);
      const bDate = getSortableDate(b);
      switch (sortOption) {
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "artist_asc":
          return (a.artist || "ZZZ").localeCompare(b.artist || "ZZZ");
        case "artist_desc":
          return (b.artist || "ZZZ").localeCompare(a.artist || "ZZZ");
        case "date_added_asc":
          return new Date(aDate).getTime() - new Date(bDate).getTime();
        case "date_added_desc":
        default:
          return new Date(bDate).getTime() - new Date(aDate).getTime();
      }
    });
  }, [filteredAndSearchedTracks, sortOption]);

  /**
   * Renders skeleton loaders for the music grid during loading states.
   * @returns {JSX.Element}
   */
  const renderSkeletonLoaders = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-5">
      {Array(14)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            className="flex flex-col gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <Skeleton className="aspect-square w-full rounded-lg animate-pulse" />
            <Skeleton className="h-4 w-3/4 rounded-md animate-pulse mt-1" />
            <Skeleton className="h-3 w-1/2 rounded-md animate-pulse" />
          </motion.div>
        ))}
    </div>
  );

  return (
    <motion.div
      className="space-y-6 pb-10"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {/* Header and Action Buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <h1 className={`${titleColor()} text-3xl font-bold tracking-tight`}>
          My Library
        </h1>
        <div className="flex gap-2 flex-wrap">
          {/* Action buttons: Refresh, Play Local, Upload, Clear Local */}
          <button
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg ${getButtonClass()}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg ${getButtonClass()}`}
            onClick={handleLocalFileClick}
          >
            <Play className="h-4 w-4" /> <span>Play Local</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg ${uploadButtonStyles()}`}
            onClick={handleUpload}
          >
            <Upload className="h-4 w-4" /> <span>Upload Music</span>
          </button>
          {localTracks.length > 0 && (
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500"
              onClick={handleClearLocalTracks}
            >
              <Trash2 className="h-4 w-4" /> <span>Clear Local</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter, Sort, and Search Controls Bar */}
      <div
        className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-between sm:items-center p-3 rounded-lg"
        style={{
          backgroundColor: isDarkTheme
            ? themeColors.backgroundOffset
            : themeColors.backgroundOffset,
        }}
      >
        {/* View Type Toggle */}
        <ToggleGroup
          type="single"
          value={viewType}
          onValueChange={(value) =>
            value && setViewType(value as "all" | "local" | "uploaded")
          }
          className="border rounded-lg p-0.5"
          style={{ borderColor: themeColors.primary + "80" }}
        >
          {["all", "uploaded", "local"].map((item) => (
            <ToggleGroupItem
              key={item}
              value={item}
              className={`px-4 py-1.5 text-sm capitalize ${getFilterAccentClass()}`}
            >
              {item}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* Search Input */}
        <div className="relative flex-grow sm:flex-grow-0 sm:max-w-xs md:max-w-sm w-full">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by title, artist, album..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-background/50 border-border/50 focus:border-primary"
            style={{
              borderColor: isDarkTheme
                ? themeColors.primary + "20"
                : themeColors.primary + "40",
            }}
          />
        </div>

        {/* Sort Select */}
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-full">
              <ListFilter className="h-4 w-4 mr-2 opacity-70" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_added_desc">Recently Added</SelectItem>
              <SelectItem value="date_added_asc">Oldest First</SelectItem>
              <SelectItem value="title_asc">Title (A-Z)</SelectItem>
              <SelectItem value="title_desc">Title (Z-A)</SelectItem>
              <SelectItem value="artist_asc">Artist (A-Z)</SelectItem>
              <SelectItem value="artist_desc">Artist (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Drag and Drop Overlay */}
      {dragActive && (
        <div className="fixed inset-0 bg-electric/20 backdrop-blur-md z-50 flex items-center justify-center border-4 border-electric border-dashed rounded-lg m-4">
          <div className="text-center p-10 bg-black/70 rounded-xl shadow-2xl">
            <Upload className="w-20 h-20 mx-auto mb-6 text-electric animate-bounce" />
            <h3 className="text-2xl font-bold text-white">
              Drop Audio File to Play
            </h3>
            <p className="text-gray-300 mt-1">
              MP3, WAV, FLAC, OGG, M4A supported
            </p>
          </div>
        </div>
      )}

      {/* Music Grid Display or Skeletons */}
      {(isLoading && tracks.length === 0 && !localTracks.length) ||
      isRefreshing ? (
        renderSkeletonLoaders()
      ) : (
        <MusicGrid
          tracks={sortedTracksToDisplay} // Pass the fully filtered and sorted tracks
          isLoading={false} // Loading state is handled by Library's skeletons
          onUpdateLocalTrack={handleUpdateLocalTrack}
          onDeleteLocalTrack={handleDeleteLocalTrack}
          // Search and View Mode UI will be added to MusicGrid itself later
        />
      )}

      {/* UploadForm Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadForm
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
              // refreshLibrary(); // refreshLibrary is already called inside UploadForm on successful upload
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Library;
