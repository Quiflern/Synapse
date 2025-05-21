
import { Memory } from "./memory";
import { Track } from "./music";

/**
 * SleepTimer - Represents the state of the sleep timer
 */
export interface SleepTimer {
  isActive: boolean;
  duration: number; // Duration in minutes
  remainingTime: number; // Remaining time in seconds
  fadeOut: boolean; // Whether to fade out the audio before stopping
}

/**
 * PlaybackStats - Represents statistics about track playback
 */
export interface PlaybackStats {
  trackId: string;
  playCount: number;
  totalPlayTime: number; // In seconds
  lastPlayed: string; // ISO date string
  favorited: boolean;
}

/**
 * AnalyticsData - Represents analytics data for the music library
 */
export interface AnalyticsData {
  totalListeningTime: number; // In seconds
  trackStats: Record<string, PlaybackStats>;
  // Listening sessions by day: YYYY-MM-DD -> seconds
  dailyListening: Record<string, number>;
  // Recently played track IDs (most recent first)
  recentlyPlayed: string[];
  // Most played track IDs (highest play count first)
  mostPlayed: string[];
}

/**
 * MoodTag - Represents mood tags that can be applied to tracks
 * for AI-driven recommendations and playlists
 */
export interface MoodTag {
  id: string;
  name: string;
  color: string;
}

/**
 * PlayHistory - Represents a play history event
 */
export interface PlayHistory {
  trackId: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  duration: number; // In seconds
  completed: boolean; // Whether the track was played to completion
}

/**
 * QueueItem - Represents a track in the play queue
 */
export interface QueueItem {
  id: string; // Unique identifier for the queue item
  track: Track;
  addedAt: string; // ISO date string when added to queue
  playedAt?: string; // ISO date string when played, if played
}

/**
 * PlaylistFormData - Represents data for creating or editing a playlist
 */
export interface PlaylistFormData {
  id?: string;
  name: string;
  description: string;
  is_public?: boolean;
}
