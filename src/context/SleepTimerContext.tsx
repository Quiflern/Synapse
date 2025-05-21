import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePlayer } from "./PlayerContext";
import { toast } from "@/hooks/use-toast";

export interface SleepTimerContextType {
  enabled: boolean;
  minutes: number;
  timeLeft: number | null;
  setEnabled: (enabled: boolean) => void;
  setMinutes: (minutes: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

const SleepTimerContext = createContext<SleepTimerContextType>({
  enabled: false,
  minutes: 30,
  timeLeft: null,
  setEnabled: () => {},
  setMinutes: () => {},
  startTimer: () => {},
  stopTimer: () => {},
  resetTimer: () => {},
});

/**
 * SleepTimerProvider - Manages sleep timer functionality
 *
 * The sleep timer will automatically stop playback after
 * a specified duration.
 */
export const SleepTimerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { togglePlayPause } = usePlayer(); // Now using togglePlayPause
  const [enabled, setEnabled] = useState(false);
  const [minutes, setMinutes] = useState(30);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  // Get saved timer settings
  useEffect(() => {
    const savedEnabled = localStorage.getItem("sleepTimerEnabled") === "true";
    const savedMinutes = parseInt(
      localStorage.getItem("sleepTimerMinutes") || "30",
      10,
    );

    setEnabled(savedEnabled);
    setMinutes(savedMinutes);
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("sleepTimerEnabled", String(enabled));
    localStorage.setItem("sleepTimerMinutes", String(minutes));
  }, [enabled, minutes]);

  // Start the sleep timer
  const startTimer = () => {
    // First clear any existing timer
    if (timerId) {
      clearInterval(timerId);
    }

    // Convert minutes to milliseconds and set end time
    const durationMs = minutes * 60 * 1000;
    const endTime = Date.now() + durationMs;

    // Set initial time left
    setTimeLeft(durationMs / 1000);

    // Create interval to update time left
    const id = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);

      // Update time left in seconds
      setTimeLeft(Math.round(remaining / 1000));

      // When timer reaches zero
      if (remaining <= 0) {
        // Stop the music - using togglePlayPause if isPlaying is true
        togglePlayPause();

        // Clear the interval
        clearInterval(id);
        setTimerId(null);
        setTimeLeft(null);

        // Notify the user
        toast({
          title: "Sleep timer ended",
          description: "Playback has been paused.",
        });
      }
    }, 1000);

    setTimerId(id);

    // Show notification
    toast({
      title: "Sleep timer started",
      description: `Music will stop playing in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`,
    });
  };

  // Stop the sleep timer
  const stopTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
      setTimeLeft(null);

      toast({
        title: "Sleep timer canceled",
        description: "The sleep timer has been turned off.",
      });
    }
  };

  // Reset the timer (stop and clear)
  const resetTimer = () => {
    stopTimer();
    setTimeLeft(null);
  };

  return (
    <SleepTimerContext.Provider
      value={{
        enabled,
        minutes,
        timeLeft,
        setEnabled,
        setMinutes,
        startTimer,
        stopTimer,
        resetTimer,
      }}
    >
      {children}
    </SleepTimerContext.Provider>
  );
};

/**
 * useSleepTimer - Hook to access the sleep timer context
 */
export const useSleepTimer = (): SleepTimerContextType => {
  const context = useContext(SleepTimerContext);

  if (context === undefined) {
    throw new Error("useSleepTimer must be used within a SleepTimerProvider");
  }

  return context;
};
