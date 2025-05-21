import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track } from '@/types/music';
import { usePlayer } from '@/context/PlayerContext';

interface AnalyticsContextType {
  trackPlays: { [trackId: string]: number };
  incrementTrackPlay: (track: Track) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackPlays: {},
  incrementTrackPlay: () => {},
});

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trackPlays, setTrackPlays] = useState<{ [trackId: string]: number }>({});
  const { currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    if (currentTrack && isPlaying) {
      incrementTrackPlay(currentTrack);
    }
  }, [currentTrack, isPlaying]);

  const incrementTrackPlay = (track: Track) => {
    setTrackPlays(prevTrackPlays => {
      const newTrackPlays = { ...prevTrackPlays };
      newTrackPlays[track.id] = (newTrackPlays[track.id] || 0) + 1;
      return newTrackPlays;
    });
  };

  return (
    <AnalyticsContext.Provider
      value={{
        trackPlays,
        incrementTrackPlay,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);

  if (context === undefined) {
    throw new Error('useAnalytics must be used within a AnalyticsProvider');
  }

  return context;
};
