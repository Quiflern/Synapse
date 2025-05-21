
import { Memory } from "./memory";

/**
 * Track - Represents a music track in the library
 * 
 * @property {string} id - Unique identifier for the track
 * @property {string} title - Track title
 * @property {string} artist - Artist name
 * @property {string} [album] - Album name (optional)
 * @property {string} [year] - Release year (optional)
 * @property {string} [genre] - Music genre (optional)
 * @property {number} duration - Track duration in seconds
 * @property {string} [path] - Legacy path property
 * @property {string} file_path - Supabase storage path
 * @property {string} [albumArt] - URL to album art image
 * @property {string} [uploaded_by] - User ID who uploaded the track
 * @property {string} [uploader] - Username of uploader
 * @property {number} play_count - Number of times the track has been played
 * @property {boolean} [is_public] - Whether the track is publicly accessible
 * @property {Memory[]} [memories] - Associated memories
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: string;
  genre?: string;
  duration: number;
  path?: string; // Legacy path property
  file_path: string; // Supabase storage path
  albumArt?: string;
  uploaded_by?: string;
  uploader?: string;
  play_count: number;
  is_public?: boolean;
  memories?: Memory[];
}

/**
 * Playlist - Represents a collection of tracks
 * 
 * @property {string} id - Unique identifier for the playlist
 * @property {string} name - Playlist name
 * @property {string} [description] - Playlist description
 * @property {string[]} trackIds - IDs of tracks in the playlist
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last updated timestamp
 * @property {boolean} [is_public] - Whether the playlist is publicly accessible
 * @property {string} [created_by] - User ID who created the playlist
 */
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
  is_public?: boolean;
  created_by?: string;
}
