
/**
 * Memory - Represents a memory associated with a track
 */
export interface Memory {
  id: string;
  title?: string;
  date?: string;
  location?: string;
  people?: string[];
  mood?: string;
  activity?: string;
  note?: string;
  photoUrl?: string;
  createdAt: string;
  trackId: string;
  userId?: string; // Added to track ownership in Supabase
}

export interface MemoryFormInput {
  title?: string;
  date?: string;
  location?: string;
  people?: string[];
  mood?: string;
  activity?: string;
  note?: string;
  photoUrl?: string;
}

// New interface for tracking memory state
export interface MemoryState {
  trackMemories: Record<string, Memory[]>;
  isLoading: boolean;
}
