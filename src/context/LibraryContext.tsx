import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "@/hooks/use-toast";
import { Track } from "@/types/music";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

// Define the context value type
interface LibraryContextType {
  tracks: Track[];
  library: Track[]; // Aliased tracks array
  allTracks: Track[]; // Add missing property
  isLoading: boolean;
  refreshLibrary: (forceRefresh?: boolean) => Promise<void>;
  getUserPlaylists: () => Promise<any[]>;
  getTopArtists: (
    count: number,
  ) => Array<{ name: string; plays: number; image?: string }>;
  lastRefreshed: Date | null;
  updateTrack: (track: Track) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  updateLibrary: (forceRefresh?: boolean) => Promise<void>; // Add missing property
  getRecentlyPlayed: (limit?: number) => Track[]; // Add missing property
  getPublicPlaylists: () => Promise<any[]>; // New function for public playlists
}

// Create the context with default values
const LibraryContext = createContext<LibraryContextType>({
  tracks: [],
  library: [],
  allTracks: [], // Add missing property
  isLoading: false,
  refreshLibrary: async () => {},
  getUserPlaylists: async () => [],
  getTopArtists: () => [],
  lastRefreshed: null,
  updateTrack: async () => {},
  deleteTrack: async () => {},
  updateLibrary: async () => {}, // Add missing property
  getRecentlyPlayed: () => [], // Add missing property
  getPublicPlaylists: async () => [], // Add default for new function
});

// Refresh cache threshold (1 minute instead of 10 minutes)
const REFRESH_THRESHOLD = 60 * 1000;

/**
 * LibraryProvider - Provider for music library management
 *
 * Manages the music library state, including:
 * - Loading and storing tracks from Supabase
 * - Track operations
 * - Privacy controls for music visibility
 */
export const LibraryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const { user } = useAuth();

  // Load tracks from Supabase when user changes
  useEffect(() => {
    if (user) {
      refreshLibrary();
    } else {
      setTracks([]);
    }
  }, [user]);

  const refreshLibrary = async (forceRefresh = false) => {
    // Skip refresh if we've fetched data recently unless forced
    if (
      !forceRefresh &&
      lastRefreshed &&
      new Date().getTime() - lastRefreshed.getTime() < REFRESH_THRESHOLD &&
      tracks.length > 0
    ) {
      console.log("Using cached library data, last refreshed:", lastRefreshed);
      return;
    }

    try {
      setIsLoading(true);

      if (!user) {
        setTracks([]);
        setIsLoading(false);
        return;
      }

      // Fetch only user's tracks AND public tracks (security enhancement)
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .or(`uploaded_by.eq.${user.id},is_public.eq.true`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Map the data to our Track type
      const formattedTracks: Track[] = data.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        year: track.year ? track.year.toString() : null, // Convert year to string explicitly
        genre: track.genre,
        duration: track.duration,
        path: track.file_path, // Legacy path property
        file_path: track.file_path,
        albumArt: track.cover_art,
        uploaded_by: track.uploaded_by,
        uploader: null, // We'll set this later if needed
        play_count: track.play_count || 0,
        is_public: track.is_public,
        memories: [],
      }));

      // If we need the uploader usernames, we can fetch them separately
      if (formattedTracks.length > 0) {
        // Get unique uploader IDs
        const uploaderIds = [
          ...new Set(formattedTracks.map((track) => track.uploaded_by)),
        ];

        // Fetch profiles for these IDs
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", uploaderIds);

        if (!profilesError && profilesData) {
          // Create a map of id -> username
          const usernameMap = profilesData.reduce(
            (map, profile) => {
              map[profile.id] = profile.username;
              return map;
            },
            {} as Record<string, string | null>,
          );

          // Add username to each track
          formattedTracks.forEach((track) => {
            if (track.uploaded_by) {
              track.uploader = usernameMap[track.uploaded_by] || null;
            }
          });
        }
      }

      // Also load local tracks from localStorage
      const savedTracks = localStorage.getItem("synapse-local-tracks");
      let localTracks: Track[] = [];
      if (savedTracks) {
        try {
          localTracks = JSON.parse(savedTracks) as Track[];
        } catch (error) {
          console.error("Error loading local tracks:", error);
        }
      }

      // Combine local and remote tracks
      setTracks([...formattedTracks, ...localTracks]);
      setLastRefreshed(new Date());
    } catch (error: any) {
      console.error("Error loading tracks:", error);
      toast({
        title: "Error loading library",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrack = async (track: Track) => {
    try {
      if (track.id.startsWith("local-")) {
        // Update local track in localStorage
        const savedTracks = localStorage.getItem("synapse-local-tracks");
        if (savedTracks) {
          const tracks = JSON.parse(savedTracks) as Track[];
          const updatedTracks = tracks.map((t) => {
            if (t.id === track.id) {
              return track;
            }
            return t;
          });

          localStorage.setItem(
            "synapse-local-tracks",
            JSON.stringify(updatedTracks),
          );
        }
      } else {
        // Update track in Supabase
        const { error } = await supabase
          .from("tracks")
          .update({
            title: track.title,
            artist: track.artist || null,
            album: track.album || null,
            year: track.year || null,
            genre: track.genre || null,
            is_public: track.is_public,
          })
          .eq("id", track.id);

        if (error) throw error;
      }

      // Refresh library to show updated data
      await refreshLibrary(true);
    } catch (error: any) {
      console.error("Error updating track:", error);
      throw error;
    }
  };

  const deleteTrack = async (trackId: string) => {
    try {
      if (trackId.startsWith("local-")) {
        // Delete local track from localStorage
        const savedTracks = localStorage.getItem("synapse-local-tracks");
        if (savedTracks) {
          const localTracks = JSON.parse(savedTracks) as Track[];
          const filteredTracks = localTracks.filter((t) => t.id !== trackId);

          localStorage.setItem(
            "synapse-local-tracks",
            JSON.stringify(filteredTracks),
          );

          // Update state to reflect the change
          setTracks((current) => current.filter((t) => t.id !== trackId));

          toast({
            title: "Success",
            description: "Track deleted successfully",
          });
        }
      } else {
        // Delete track from Supabase
        const { error } = await supabase
          .from("tracks")
          .delete()
          .eq("id", trackId);

        if (error) throw error;

        // Update state to reflect the change
        setTracks((current) => current.filter((t) => t.id !== trackId));

        toast({
          title: "Success",
          description: "Track deleted successfully",
        });
      }
    } catch (error: any) {
      console.error("Error deleting track:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete track",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getUserPlaylists = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error("Error loading playlists:", error);
      toast({
        title: "Error loading playlists",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  // New function to get public playlists
  const getPublicPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("is_public", true)
        .not("created_by", "eq", user?.id) // Don't include user's own playlists
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error("Error loading public playlists:", error);
      toast({
        title: "Error loading public playlists",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  // Function to get top artists based on play count
  const getTopArtists = (
    count: number = 5,
  ): Array<{ name: string; plays: number; image?: string }> => {
    // Filter tracks by user ownership for privacy
    const userTracks = tracks.filter(
      (track) =>
        track.uploaded_by === user?.id || track.id.startsWith("local-"),
    );

    const artistPlayCounts: Record<string, { count: number; image?: string }> =
      {};

    // Count plays per artist
    userTracks.forEach((track) => {
      if (track.artist) {
        if (!artistPlayCounts[track.artist]) {
          artistPlayCounts[track.artist] = {
            count: track.play_count || 1,
            image: track.albumArt,
          };
        } else {
          artistPlayCounts[track.artist].count += track.play_count || 1;
        }
      }
    });

    // Convert to array and sort by play count
    const sortedArtists = Object.entries(artistPlayCounts)
      .map(([name, data]) => ({
        name,
        plays: data.count,
        image: data.image,
      }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, count);

    return sortedArtists;
  };

  // Alias for refreshLibrary to match interface
  const updateLibrary = refreshLibrary;

  // Get recently played tracks (placeholder implementation)
  const getRecentlyPlayed = (limit: number = 5): Track[] => {
    // Filter for user's tracks only (privacy enhancement)
    const userTracks = tracks.filter(
      (track) =>
        track.uploaded_by === user?.id || track.id.startsWith("local-"),
    );

    // Return sorted by play count
    return [...userTracks]
      .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
      .slice(0, limit);
  };

  return (
    <LibraryContext.Provider
      value={{
        tracks,
        library: tracks, // Aliasing tracks as library
        allTracks: tracks, // Add allTracks property
        isLoading,
        refreshLibrary,
        updateLibrary, // Add updateLibrary alias
        getUserPlaylists,
        getPublicPlaylists, // Add new function to context
        getTopArtists,
        lastRefreshed,
        updateTrack,
        deleteTrack,
        getRecentlyPlayed, // Add getRecentlyPlayed method
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

/**
 * useLibrary - Hook to access library context
 */
export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);

  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }

  return context;
};
