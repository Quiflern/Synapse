import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Track } from "@/types/music";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  pauseTrack: () => void;
  resumeTrack: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  currentTime: number;
  duration: number;
  isShuffleEnabled: boolean; // This will reflect isShuffleEnabledState
  repeatMode: "none" | "all" | "one";
  toggleShuffle: () => void;
  setRepeatMode: (mode: "none" | "all" | "one") => void;
  trackQueue: Track[]; // The currently displayed/playable queue (can be shuffled)
  setTrackQueue: (queue: Track[]) => void; // Primarily for DND reordering in PlayQueue.tsx
  togglePlayPause: () => void;
  skipToNext: () => void;
  skipToPrevious: () => void;

  // New/Modified functions for robust queue handling
  startPlaybackSession: (tracks: Track[], startIndex?: number, options?: { shuffle?: boolean }) => void;
  playTrackFromQueueItem: (track: Track) => void; // Renamed for clarity

  addToQueueEnd: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  // shuffleCurrentQueue is now effectively part of toggleShuffle when enabling it
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

/**
 * @file PlayerContext.tsx
 * @description Provides global state and functions for music playback,
 * including robust queue management, shuffle, and repeat functionalities.
 */
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                          children,
                                                                        }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isShuffleEnabledState, setIsShuffleEnabledState] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none");

  const [trackQueue, setTrackQueue] = useState<Track[]>([]);
  const [originalQueueSource, setOriginalQueueSource] = useState<Track[]>([]);
  const [currentQueuePlaybackIndex, setCurrentQueuePlaybackIndex] = useState<number>(-1); // Index within trackQueue

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedVolume = localStorage.getItem("synapse-player-volume");
    if (savedVolume) setVolume(parseFloat(savedVolume));
  }, []);

  useEffect(() => {
    localStorage.setItem("synapse-player-volume", volume.toString());
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Increments play count for a track.
  const incrementPlayCount = useCallback(async (trackId: string) => {
    if (trackId.startsWith('local-')) return;
    try {
      const { error } = await supabase.rpc("increment_play_count", { track_id: trackId });
      if (error) throw error;
    } catch (error: any) {
      console.error("Failed to increment play count:", error.message);
    }
  }, []);

  // Core internal function to play a specific track object.
  const internalPlayTrack = useCallback((trackToPlay: Track | null) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.removeAttribute('src'); // Force removal
      audioRef.current.load();
    }

    if (!trackToPlay) {
      setCurrentTrack(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      // if(audioRef.current) audioRef.current = null;
      audioRef.current = null;
      return;
    }

    setCurrentTrack(trackToPlay);
    setIsPlaying(true); // Assume playback starts immediately
    incrementPlayCount(trackToPlay.id);

    // Create new audio element
    const audio = new Audio(trackToPlay.file_path);
    audioRef.current = audio;
    audio.volume = volume;
    audio.addEventListener("loadedmetadata", () => {
      if (audioRef.current === audio) setDuration(audio.duration); // Check if it's still the current audio element
    });
    audio.addEventListener("timeupdate", () => {
      if (audioRef.current === audio) setCurrentTime(audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      if (audioRef.current === audio) handleTrackEnded(); // Check before calling
    });
    audio.play().catch(error => {
      console.error("Error playing audio:", trackToPlay.title, error);
      toast({ title: "Playback Error", description: `Could not play: ${trackToPlay.title}. File may be corrupt or inaccessible.`, variant: "destructive"});
      setIsPlaying(false);
    });
  }, [volume, incrementPlayCount]); // handleTrackEnded is memoized separately

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const resumeTrack = useCallback(() => {
    if (currentTrack && audioRef.current && !isPlaying) { // Only resume if there's a track and it's paused
      setIsPlaying(true);
      audioRef.current.play().catch(error => {
        console.error("Error resuming audio:", error);
        setIsPlaying(false);
      });
    }
  }, [currentTrack, isPlaying]);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack && trackQueue.length > 0) { // If no current track but queue exists, play first
      startPlaybackSession(trackQueue, 0, { shuffle: isShuffleEnabledState });
    } else if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack, currentTrack, trackQueue, isShuffleEnabledState]); // Added deps

  // Starts a new playback session with a list of tracks.
  const startPlaybackSession = useCallback((
      tracksToPlay: Track[],
      startIndex: number = 0,
      options?: { shuffle?: boolean }
  ) => {
    if (!tracksToPlay || tracksToPlay.length === 0) {
      toast({ title: "Playback Error", description: "No tracks to play.", variant: "destructive"});
      internalPlayTrack(null); // Stop any current playback
      setTrackQueue([]);
      setOriginalQueueSource([]);
      setCurrentQueuePlaybackIndex(-1);
      return;
    }

    const sessionShuffleEnabled = options?.shuffle !== undefined ? options.shuffle : isShuffleEnabledState;
    setOriginalQueueSource([...tracksToPlay]); // Store original, unshuffled list

    let newQueueForPlayback = [...tracksToPlay];
    let playbackStartIndex = Math.max(0, Math.min(startIndex, newQueueForPlayback.length - 1));

    if (sessionShuffleEnabled) {
      const currentTrackToPreserve = newQueueForPlayback[playbackStartIndex]; // Track user intended to start with
      // Fisher-Yates shuffle
      for (let i = newQueueForPlayback.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newQueueForPlayback[i], newQueueForPlayback[j]] = [newQueueForPlayback[j], newQueueForPlayback[i]];
      }
      // Find the new index of the originally intended starting track, or default to 0
      const newIndexOfOriginalStart = newQueueForPlayback.findIndex(t => t.id === currentTrackToPreserve.id);
      playbackStartIndex = newIndexOfOriginalStart !== -1 ? newIndexOfOriginalStart : 0;

      // If shuffle was explicitly requested by options, update the global shuffle state
      if(options?.shuffle === true && !isShuffleEnabledState) setIsShuffleEnabledState(true);
    } else {
      // If shuffle is explicitly false for this session, ensure global shuffle is off
      if (options?.shuffle === false && isShuffleEnabledState) setIsShuffleEnabledState(false);
    }

    setTrackQueue(newQueueForPlayback);
    setCurrentQueuePlaybackIndex(playbackStartIndex);
    internalPlayTrack(newQueueForPlayback[playbackStartIndex]);

  }, [internalPlayTrack, isShuffleEnabledState]);


  // Plays a specific track when clicked from the displayed queue UI.
  const playTrackFromQueueItem = useCallback((track: Track) => {
    const indexInCurrentQueue = trackQueue.findIndex(t => t.id === track.id);
    if (indexInCurrentQueue !== -1) {
      setCurrentQueuePlaybackIndex(indexInCurrentQueue);
      internalPlayTrack(track);
    } else {
      // If track isn't in the current (possibly shuffled) queue, treat as a new one-track session
      startPlaybackSession([track], 0);
    }
  }, [trackQueue, internalPlayTrack, startPlaybackSession]);

  const playNextInternal = useCallback(() => {
    if (trackQueue.length === 0) { internalPlayTrack(null); return; }

    let nextPlayIndex = -1;

    if (repeatMode === "one" && currentTrack) {
      internalPlayTrack(currentTrack); return;
    }

    if (isShuffleEnabledState) {
      if (trackQueue.length === 1 && repeatMode === "all") nextPlayIndex = 0;
      else if (trackQueue.length > 1) {
        let randomIndex;
        do { randomIndex = Math.floor(Math.random() * trackQueue.length); }
        while (trackQueue.length > 1 && trackQueue[randomIndex].id === currentTrack?.id); // Avoid same track if possible
        nextPlayIndex = randomIndex;
      } else if (trackQueue.length === 1) nextPlayIndex = 0; // Shuffle on but only one track
    } else { nextPlayIndex = currentQueuePlaybackIndex + 1; }

    if (nextPlayIndex >= 0 && nextPlayIndex < trackQueue.length) {
      setCurrentQueuePlaybackIndex(nextPlayIndex);
      internalPlayTrack(trackQueue[nextPlayIndex]);
    } else if (repeatMode === "all" && trackQueue.length > 0) {
      setCurrentQueuePlaybackIndex(0);
      internalPlayTrack(trackQueue[0]);
    } else {
      internalPlayTrack(null);
    }
  }, [currentTrack, trackQueue, currentQueuePlaybackIndex, repeatMode, isShuffleEnabledState, internalPlayTrack]);

  const handleTrackEnded = useCallback(() => { playNextInternal(); }, [playNextInternal]);

  const playPreviousInternal = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      if(!isPlaying && currentTrack) resumeTrack();
      return;
    }
    if (trackQueue.length === 0) return;

    let prevPlayIndex = -1;

    if (isShuffleEnabledState) {
      if (trackQueue.length === 1) prevPlayIndex = 0;
      else if (trackQueue.length > 1) {
        let randomIndex;
        do { randomIndex = Math.floor(Math.random() * trackQueue.length); }
        while (trackQueue.length > 1 && trackQueue[randomIndex].id === currentTrack?.id);
        prevPlayIndex = randomIndex;
      }
    } else { prevPlayIndex = currentQueuePlaybackIndex - 1; }

    if (prevPlayIndex >= 0 && prevPlayIndex < trackQueue.length) {
      setCurrentQueuePlaybackIndex(prevPlayIndex);
      internalPlayTrack(trackQueue[prevPlayIndex]);
    } else if (repeatMode === "all" && trackQueue.length > 0) {
      const lastIndex = trackQueue.length - 1;
      setCurrentQueuePlaybackIndex(lastIndex);
      internalPlayTrack(trackQueue[lastIndex]);
    } else {
      if(audioRef.current) audioRef.current.currentTime = 0;
      if(!isPlaying && currentTrack) resumeTrack();
    }
  }, [currentTrack, trackQueue, currentQueuePlaybackIndex, repeatMode, isShuffleEnabledState, internalPlayTrack, isPlaying, resumeTrack]);

  const skipToNext = useCallback(() => playNextInternal(), [playNextInternal]);
  const skipToPrevious = useCallback(() => playPreviousInternal(), [playPreviousInternal]);

  const seek = useCallback((time: number) => { if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }}, []);

  const toggleShuffle = useCallback(() => {
    const newShuffleState = !isShuffleEnabledState;
    setIsShuffleEnabledState(newShuffleState);

    if (newShuffleState) {
      if (originalQueueSource.length > 1) {
        let shuffledQueue = [...originalQueueSource]; // Shuffle from original source
        const currentPlayingTrackId = currentTrack?.id;
        let currentPlayingTrackInOriginal: Track | undefined;

        // Fisher-Yates shuffle
        for (let i = shuffledQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
        }

        setTrackQueue(shuffledQueue);
        // Update currentQueuePlaybackIndex to the new position of currentTrack in the shuffled queue
        if (currentPlayingTrackId) {
          const newIdx = shuffledQueue.findIndex(t => t.id === currentPlayingTrackId);
          setCurrentQueuePlaybackIndex(newIdx !== -1 ? newIdx : 0); // Default to 0 if not found (shouldn't happen if queue has it)
        } else if (shuffledQueue.length > 0) {
          setCurrentQueuePlaybackIndex(0); // If no current track, set to start of shuffled queue
        }
      } else {
        // If original source is small, trackQueue is already effectively it or shuffled version of it
        setTrackQueue([...originalQueueSource]); // Ensure it's a copy
      }
    } else { // Turning shuffle OFF
      if (originalQueueSource.length > 0) {
        setTrackQueue([...originalQueueSource]); // Revert to original order
        if (currentTrack) {
          const originalIndex = originalQueueSource.findIndex(t => t.id === currentTrack.id);
          setCurrentQueuePlaybackIndex(originalIndex !== -1 ? originalIndex : 0);
        } else {
          setCurrentQueuePlaybackIndex(0);
        }
      }
    }
    toast({ title: newShuffleState ? "Shuffle enabled" : "Shuffle disabled" });
  }, [isShuffleEnabledState, originalQueueSource, currentTrack]); // Removed trackQueue as direct dependency

  const addToQueueEnd = useCallback((track: Track) => {
    const trackExistsInOriginal = originalQueueSource.some(t => t.id === track.id);
    if (!trackExistsInOriginal) {
      setOriginalQueueSource(prev => [...prev, track]);
    }
    const trackExistsInQueue = trackQueue.some(t => t.id === track.id);
    if (!trackExistsInQueue) {
      setTrackQueue(prev => [...prev, track]);
      toast({ title: `${track.title} added to queue`});
    } else {
      toast({ title: `${track.title} is already in queue`, variant: "default"});
    }
  }, [originalQueueSource, trackQueue]);

  const removeFromQueue = useCallback((trackId: string) => {
    const trackToRemove = trackQueue.find(t => t.id === trackId);
    if (!trackToRemove) return;

    const newQueue = trackQueue.filter(t => t.id !== trackId);
    const newOriginalQueue = originalQueueSource.filter(t => t.id !== trackId);

    setTrackQueue(newQueue);
    setOriginalQueueSource(newOriginalQueue);

    if (currentTrack?.id === trackId) {
      if (newQueue.length > 0) {
        // If current playing track was removed, play the next logical one (respecting current index if possible)
        const nextPlayIndex = Math.min(currentQueuePlaybackIndex, newQueue.length - 1);
        setCurrentQueuePlaybackIndex(nextPlayIndex);
        internalPlayTrack(newQueue[nextPlayIndex]);
      } else {
        internalPlayTrack(null); // Queue is empty
        setCurrentQueuePlaybackIndex(-1);
      }
    } else if (currentTrack) {
      // Update currentQueuePlaybackIndex if current track is still in the new queue
      const newCurrentIndex = newQueue.findIndex(t => t.id === currentTrack.id);
      setCurrentQueuePlaybackIndex(newCurrentIndex); // Will be -1 if not found, which is fine
    }
    toast({ title: `${trackToRemove.title} removed`});
  }, [trackQueue, originalQueueSource, currentTrack, currentQueuePlaybackIndex, internalPlayTrack]);

  const clearQueue = useCallback(() => {
    internalPlayTrack(null);
    setTrackQueue([]);
    setOriginalQueueSource([]);
    setCurrentQueuePlaybackIndex(-1);
    toast({ title: "Queue cleared"});
  }, [internalPlayTrack]);

  const contextValue: PlayerContextType = {
    currentTrack, isPlaying, volume, pauseTrack, resumeTrack, setVolume, seek,
    currentTime, duration, isShuffleEnabled: isShuffleEnabledState,
    toggleShuffle, repeatMode, setRepeatMode,
    trackQueue, setTrackQueue, // setTrackQueue exposed for DND
    togglePlayPause, skipToNext, skipToPrevious,
    startPlaybackSession, playTrackFromQueueItem,
    addToQueueEnd, removeFromQueue, clearQueue,
  };

  return (
      <PlayerContext.Provider value={contextValue}>
        {children}
      </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
};