import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Memory, MemoryFormInput, MemoryState } from "@/types/memory";
import { useLibrary } from "./LibraryContext";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MemoryContextType {
  addMemoryToTrack: (trackId: string, memory: MemoryFormInput) => Promise<void>;
  updateMemory: (
    memoryId: string,
    updates: Partial<MemoryFormInput>,
  ) => Promise<void>;
  removeMemoryFromTrack: (memoryId: string) => Promise<void>;
  getTrackMemories: (trackId: string) => Memory[];
  getAllMemories: () => Memory[];
  getMemoriesByFilter: (field: string, value: string) => Memory[];
  isLoading: boolean;
  error: string | null;
  memoryState: MemoryState;
}

const MemoryContext = createContext<MemoryContextType>({
  addMemoryToTrack: async () => {},
  updateMemory: async () => {},
  removeMemoryFromTrack: async () => {},
  getTrackMemories: () => [],
  getAllMemories: () => [],
  getMemoriesByFilter: () => [],
  isLoading: false,
  error: null,
  memoryState: { trackMemories: {}, isLoading: false },
});

/**
 * MemoryProvider - Provider for memory management
 *
 * Manages the memory state for tracks, including:
 * - Adding memories to tracks
 * - Removing memories from tracks
 * - Retrieving memories by track or filter
 */
export const MemoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { tracks } = useLibrary();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoriesCache, setMemoriesCache] = useState<Record<string, Memory[]>>(
    {},
  );

  // Maintain the memory state
  const memoryState: MemoryState = {
    trackMemories: memoriesCache,
    isLoading,
  };

  // Fetch memories from Supabase when user changes
  useEffect(() => {
    if (user) {
      fetchAllMemories();
    } else {
      // Clear cache when user logs out
      setMemoriesCache({});
    }
  }, [user]);

  // Fetch all memories for the current user and organize them by track ID
  const fetchAllMemories = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Transform database records to Memory objects and organize by track ID
      const memoriesByTrack: Record<string, Memory[]> = {};

      data.forEach((record) => {
        const memory: Memory = {
          id: record.id,
          title: record.title || undefined,
          date: record.date || undefined,
          location: record.location || undefined,
          people: record.people || undefined,
          mood: record.mood || undefined,
          activity: record.activity || undefined,
          note: record.note || undefined,
          photoUrl: record.photo_url || undefined,
          createdAt: record.created_at,
          trackId: record.track_id,
          userId: record.user_id,
        };

        if (!memoriesByTrack[memory.trackId]) {
          memoriesByTrack[memory.trackId] = [];
        }

        memoriesByTrack[memory.trackId].push(memory);
      });

      setMemoriesCache(memoriesByTrack);
    } catch (err: any) {
      console.error("Error fetching memories:", err);
      setError(err.message || "Failed to fetch memories");
      toast({
        title: "Error fetching memories",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMemoryToTrack = async (
    trackId: string,
    memoryInput: MemoryFormInput,
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save memories",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create new memory in Supabase
      const { data, error } = await supabase
        .from("memories")
        .insert({
          track_id: trackId,
          user_id: user.id,
          title: memoryInput.title || null,
          date: memoryInput.date || null,
          location: memoryInput.location || null,
          people: memoryInput.people || null,
          mood: memoryInput.mood || null,
          activity: memoryInput.activity || null,
          note: memoryInput.note || null,
          photo_url: memoryInput.photoUrl || null,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      // Convert the returned data to Memory object
      const newMemory: Memory = {
        id: data.id,
        title: data.title || undefined,
        date: data.date || undefined,
        location: data.location || undefined,
        people: data.people || undefined,
        mood: data.mood || undefined,
        activity: data.activity || undefined,
        note: data.note || undefined,
        photoUrl: data.photo_url || undefined,
        createdAt: data.created_at,
        trackId: data.track_id,
        userId: data.user_id,
      };

      // Update local cache
      setMemoriesCache((prev) => {
        const trackMemories = [...(prev[trackId] || []), newMemory];
        return { ...prev, [trackId]: trackMemories };
      });

      toast({
        title: "Memory added",
        description: "Your memory has been saved with this track.",
      });
    } catch (err: any) {
      console.error("Error adding memory:", err);
      setError(err.message || "Failed to add memory");
      toast({
        title: "Error adding memory",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemory = async (
    memoryId: string,
    updates: Partial<MemoryFormInput>,
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update memories",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update memory in Supabase
      const { data, error } = await supabase
        .from("memories")
        .update({
          title:
            updates.title === undefined ? undefined : updates.title || null,
          date: updates.date === undefined ? undefined : updates.date || null,
          location:
            updates.location === undefined
              ? undefined
              : updates.location || null,
          people:
            updates.people === undefined ? undefined : updates.people || null,
          mood: updates.mood === undefined ? undefined : updates.mood || null,
          activity:
            updates.activity === undefined
              ? undefined
              : updates.activity || null,
          note: updates.note === undefined ? undefined : updates.note || null,
          photo_url:
            updates.photoUrl === undefined
              ? undefined
              : updates.photoUrl || null,
        })
        .eq("id", memoryId)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      // Convert the returned data to Memory object
      const updatedMemory: Memory = {
        id: data.id,
        title: data.title || undefined,
        date: data.date || undefined,
        location: data.location || undefined,
        people: data.people || undefined,
        mood: data.mood || undefined,
        activity: data.activity || undefined,
        note: data.note || undefined,
        photoUrl: data.photo_url || undefined,
        createdAt: data.created_at,
        trackId: data.track_id,
        userId: data.user_id,
      };

      // Update local cache
      setMemoriesCache((prev) => {
        const allTrackIds = Object.keys(prev);

        // Find which track this memory belongs to
        for (const trackId of allTrackIds) {
          const trackMemories = prev[trackId];
          const memoryIndex = trackMemories.findIndex((m) => m.id === memoryId);

          if (memoryIndex !== -1) {
            // Found the memory, update it
            const newTrackMemories = [...trackMemories];
            newTrackMemories[memoryIndex] = updatedMemory;
            return { ...prev, [trackId]: newTrackMemories };
          }
        }

        // If we got here, we didn't find the memory in our cache
        // This shouldn't happen normally, but we'll refresh all memories just in case
        fetchAllMemories();
        return prev;
      });

      toast({
        title: "Memory updated",
        description: "Your memory has been updated successfully.",
      });
    } catch (err: any) {
      console.error("Error updating memory:", err);
      setError(err.message || "Failed to update memory");
      toast({
        title: "Error updating memory",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeMemoryFromTrack = async (memoryId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to remove memories",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Delete memory from Supabase
      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("id", memoryId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Update local cache
      setMemoriesCache((prev) => {
        const allTrackIds = Object.keys(prev);

        // Find which track this memory belongs to
        for (const trackId of allTrackIds) {
          const trackMemories = prev[trackId];
          const memoryIndex = trackMemories.findIndex((m) => m.id === memoryId);

          if (memoryIndex !== -1) {
            // Found the memory, remove it
            const newTrackMemories = trackMemories.filter(
              (m) => m.id !== memoryId,
            );
            return { ...prev, [trackId]: newTrackMemories };
          }
        }

        // If we got here, we didn't find the memory in our cache
        // This shouldn't happen normally, but we'll return the current state
        return prev;
      });

      toast({
        title: "Memory removed",
        description: "The memory has been removed successfully.",
      });
    } catch (err: any) {
      console.error("Error removing memory:", err);
      setError(err.message || "Failed to remove memory");
      toast({
        title: "Error removing memory",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Updated to return synchronous data instead of a Promise
  const getTrackMemories = (trackId: string): Memory[] => {
    // If we don't have memories for this track yet, trigger a fetch (but don't wait for it)
    if (user && !memoriesCache[trackId] && !isLoading) {
      fetchTrackMemories(trackId);
    }

    // Return memories from cache synchronously (empty array if not in cache yet)
    return memoriesCache[trackId] || [];
  };

  // New helper function to fetch memories for a specific track
  const fetchTrackMemories = async (trackId: string) => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("track_id", trackId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Convert DB records to Memory objects
      const memories: Memory[] = data.map((record) => ({
        id: record.id,
        title: record.title || undefined,
        date: record.date || undefined,
        location: record.location || undefined,
        people: record.people || undefined,
        mood: record.mood || undefined,
        activity: record.activity || undefined,
        note: record.note || undefined,
        photoUrl: record.photo_url || undefined,
        createdAt: record.created_at,
        trackId: record.track_id,
        userId: record.user_id,
      }));

      // Update the cache
      setMemoriesCache((prev) => ({
        ...prev,
        [trackId]: memories,
      }));
    } catch (err: any) {
      console.error("Error fetching track memories:", err);
      setError(err.message || "Failed to fetch memories");
    } finally {
      setIsLoading(false);
    }
  };

  // Updated to return synchronous data
  const getAllMemories = (): Memory[] => {
    // Flatten all memories from cache into a single array
    return Object.values(memoriesCache).flat();
  };

  // Updated to return synchronous data
  const getMemoriesByFilter = (field: string, value: string): Memory[] => {
    const allMemories = getAllMemories();

    // Filter memories based on the provided field and value
    return allMemories.filter((memory) => {
      if (field === "people" && memory.people) {
        return memory.people.some(
          (person) => person.toLowerCase() === value.toLowerCase(),
        );
      }

      const memoryFieldValue = memory[field as keyof typeof memory];
      if (typeof memoryFieldValue === "string") {
        return memoryFieldValue.toLowerCase() === value.toLowerCase();
      }
      return false;
    });
  };

  return (
    <MemoryContext.Provider
      value={{
        addMemoryToTrack,
        updateMemory,
        removeMemoryFromTrack,
        getTrackMemories,
        getAllMemories,
        getMemoriesByFilter,
        isLoading,
        error,
        memoryState,
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

/**
 * useMemory - Hook to access memory context
 */
export const useMemory = (): MemoryContextType => {
  const context = useContext(MemoryContext);

  if (context === undefined) {
    throw new Error("useMemory must be used within a MemoryProvider");
  }

  return context;
};
