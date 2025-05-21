import React, { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePlayer } from "@/context/PlayerContext";

export interface MusicVisualizerProps {
  variant?: "bars" | "wave" | "circle" | "waveform" | "circular" | "spectrum";
  className?: string;
  isPlaying?: boolean;
  color?: string;
  audioUrl?: string;
}

export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
  variant = "bars",
  className = "",
  isPlaying: propIsPlaying,
  color: propColor,
  audioUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying: contextIsPlaying } = usePlayer(); // Get isPlaying from player context
  const { themeColors } = useTheme();

  // Determine final isPlaying state
  const isPlaying =
    propIsPlaying !== undefined ? propIsPlaying : contextIsPlaying;

  // Web Audio API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  // Ref for the internal <audio> element this component creates if audioUrl is provided
  const internalAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const animationFrameIdRef = useRef<number | null>(null);

  // Colors
  const colorPrimary = propColor || themeColors.primary || "#66c8ff";
  const colorSecondary = themeColors.secondary || "#50fa7b";

  // Audio Setup Effect (triggered by audioUrl change)
  useEffect(() => {
    console.log(
      "MusicVisualizer: Audio Setup Effect - Start. audioUrl:",
      audioUrl,
    );
    if (!canvasRef.current) {
      console.warn(
        "MusicVisualizer: Audio Setup - Canvas ref not yet available.",
      );
      return;
    }

    // 1. Cleanup previous audio instances and connections managed by this component
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
        console.log(
          "MusicVisualizer: Audio Setup - Disconnected old sourceNodeRef.",
        );
      } catch (e) {
        /* Ignore error if already disconnected */
      }
      sourceNodeRef.current = null;
    }
    if (internalAudioElementRef.current) {
      internalAudioElementRef.current.pause();
      internalAudioElementRef.current.src = ""; // Release resources
      internalAudioElementRef.current = null;
      console.log(
        "MusicVisualizer: Audio Setup - Cleaned up old internal HTMLAudioElement.",
      );
    }
    // We don't nullify audioContextRef or analyserRef here, try to reuse them.
    // If they need to be reset (e.g. context died), it'll happen in initialization.

    // 2. Determine the audio element to use
    let audioElementToProcess: HTMLAudioElement | null = null;
    if (audioUrl) {
      console.log(
        "MusicVisualizer: Audio Setup - Creating new HTMLAudioElement for url:",
        audioUrl,
      );
      audioElementToProcess = new Audio(audioUrl);
      internalAudioElementRef.current = audioElementToProcess; // Store it
      // This internal audio element is just for analysis.
      // It should not produce sound if the main player is already playing.
      audioElementToProcess.muted = true; // Mute it to prevent double audio
      // We are NOT calling audioElementToProcess.play() here.
      // We rely on the main player (via PlayerContext) to handle actual playback.
      // The AnalyserNode will process data even if the element is muted, as long as it's "playing" (i.e. has a source and time is advancing).
      // If `isPlaying` is true, the browser should be loading/playing data for this URL from the main player.
    } else {
      // Fallback to querySelector (less reliable with current PlayerContext)
      console.log(
        "MusicVisualizer: Audio Setup - audioUrl not provided. Attempting document.querySelector('audio').",
      );
      audioElementToProcess = document.querySelector("audio");
      if (audioElementToProcess) {
        console.log(
          "MusicVisualizer: Audio Setup - Found audio element via querySelector.",
        );
      }
    }

    if (!audioElementToProcess) {
      console.warn(
        "MusicVisualizer: Audio Setup - No audio element available. Visualizer will show placeholder.",
      );
      analyserRef.current = null; // Ensure analyser is marked as not ready for drawing
      return; // Exit if no audio element
    }

    // 3. Initialize Web Audio API
    const initWebAudio = async () => {
      try {
        if (
          !audioContextRef.current ||
          audioContextRef.current.state === "closed"
        ) {
          const GlobalAudioContext =
            window.AudioContext || (window as any).webkitAudioContext;
          if (!GlobalAudioContext) {
            console.error("MusicVisualizer: Web Audio API not supported.");
            return;
          }
          audioContextRef.current = new GlobalAudioContext();
          console.log("MusicVisualizer: AudioContext created/recreated.");
        }
        const audioContext = audioContextRef.current;

        if (audioContext.state === "suspended") {
          await audioContext.resume();
          console.log("MusicVisualizer: AudioContext resumed.");
        }

        // Re-create or ensure analyser is connected
        if (!analyserRef.current) {
          analyserRef.current = audioContext.createAnalyser();
          analyserRef.current.fftSize = 256; // Or your preferred size
          console.log("MusicVisualizer: AnalyserNode created.");
        }
        // Always connect analyser to destination (safe if already connected)
        analyserRef.current.connect(audioContext.destination);

        console.log(
          "MusicVisualizer: Audio Setup - Creating MediaElementAudioSourceNode.",
        );
        sourceNodeRef.current = audioContext.createMediaElementSource(
          audioElementToProcess,
        );
        sourceNodeRef.current.connect(analyserRef.current);
        console.log(
          "MusicVisualizer: Audio Setup - Web Audio pipeline complete.",
        );
      } catch (error) {
        console.error(
          "MusicVisualizer: Audio Setup - Error initializing Web Audio pipeline:",
          error,
        );
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
          } catch (e) {}
          sourceNodeRef.current = null;
        }
        analyserRef.current = null; // Mark as not ready
      }
    };

    initWebAudio();

    // Cleanup for THIS effect instance
    return () => {
      console.log(
        "MusicVisualizer: Audio Setup Effect - CLEANUP for audioUrl:",
        audioUrl,
      );
      // Disconnect the source node created in this effect run
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) {
          /* Already disconnected */
        }
        sourceNodeRef.current = null; // Ready for next track
      }
      // Pause and clear src of the internal audio element, if created
      if (internalAudioElementRef.current) {
        internalAudioElementRef.current.pause();
        internalAudioElementRef.current.srcObject = null; // For MediaStream
        internalAudioElementRef.current.src = ""; // For URL
        internalAudioElementRef.current.load(); // Abort loading
        internalAudioElementRef.current = null;
      }
      // The audioContext and analyser can persist to be reused by the next track.
      // They are only fully cleaned up if the component unmounts.
    };
  }, [audioUrl]); // Re-run when audioUrl changes (new track)

  // Full component unmount cleanup
  useEffect(() => {
    return () => {
      console.log("MusicVisualizer: Component Unmounting - Full Cleanup");
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) {}
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (e) {}
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        // Closing the context is a final step, ensures all resources are released.
        // Only do this if this component "owns" the context. If context is shared, don't close.
        // audioContextRef.current.close().then(() => console.log("AudioContext closed on unmount"));
      }
      if (internalAudioElementRef.current) {
        internalAudioElementRef.current.pause();
        internalAudioElementRef.current.src = "";
      }
    };
  }, []); // Empty array means this runs once on mount and cleanup on unmount

  // Drawing Effect
  useEffect(() => {
    console.log(
      "MusicVisualizer: Drawing Effect - Start. Variant:",
      variant,
      "IsPlaying:",
      isPlaying,
      "Analyser:",
      analyserRef.current ? "Exists" : "Null",
    );
    if (!canvasRef.current) {
      console.warn("MusicVisualizer: Drawing - Canvas ref not available.");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("MusicVisualizer: Drawing - Failed to get 2D context.");
      return;
    }

    let RENDER_WIDTH = canvas.clientWidth;
    let RENDER_HEIGHT = canvas.clientHeight;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      RENDER_WIDTH = canvas.clientWidth;
      RENDER_HEIGHT = canvas.clientHeight;
      ctx.scale(dpr, dpr);
      // console.log(`MusicVisualizer: Canvas resized to ${RENDER_WIDTH}x${RENDER_HEIGHT}, DPR: ${dpr}`);
    };

    resize();
    const parentElement = canvas.parentElement;
    let resizeObserver: ResizeObserver | null = null;
    if (parentElement) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(parentElement);
    } else {
      window.addEventListener("resize", resize); // Fallback
    }

    const currentAnalyser = analyserRef.current; // Use the ref's current value
    let dataArrayForDrawing: Uint8Array | null = null;
    let bufferLength = 0;

    if (currentAnalyser) {
      try {
        bufferLength = currentAnalyser.frequencyBinCount;
        dataArrayForDrawing = new Uint8Array(bufferLength);
      } catch (e) {
        console.error(
          "MusicVisualizer: Drawing - Error accessing analyser properties. Using placeholder.",
          e,
        );
        // analyserRef.current = null; // Don't nullify here, audio setup effect handles it
        bufferLength = 128; // Default fftSize 256 / 2
        dataArrayForDrawing = new Uint8Array(bufferLength);
      }
    } else {
      bufferLength = 128;
      dataArrayForDrawing = new Uint8Array(bufferLength);
    }

    // --- DRAWING FUNCTIONS (drawBars, drawWave, etc. from your provided code) ---
    // Make sure they use:
    // - `currentAnalyser` (instead of `analyzer`)
    // - `dataArrayForDrawing` (instead of `dataArray`)
    // - `RENDER_WIDTH`, `RENDER_HEIGHT`
    // - `colorPrimary`, `colorSecondary`
    // - `isPlaying` (the one derived from prop or context)
    // - `bufferLength`
    // (Pasting one example, assuming others are similar)

    const drawBars = () => {
      ctx.clearRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
      if (dataArrayForDrawing && currentAnalyser && isPlaying) {
        currentAnalyser.getByteFrequencyData(dataArrayForDrawing);
        const barCount = bufferLength;
        const barWidth = RENDER_WIDTH / barCount;
        let x = 0;
        for (let i = 0; i < barCount; i++) {
          const barHeight = (dataArrayForDrawing[i] / 255) * RENDER_HEIGHT;
          const gradient = ctx.createLinearGradient(
            0,
            RENDER_HEIGHT - barHeight,
            0,
            RENDER_HEIGHT,
          );
          gradient.addColorStop(0, colorPrimary);
          gradient.addColorStop(0.5, colorSecondary);
          gradient.addColorStop(1, `${colorPrimary}30`);
          ctx.fillStyle = gradient;
          ctx.fillRect(x, RENDER_HEIGHT - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        const barCount = 32;
        const barWidth = RENDER_WIDTH / barCount;
        for (let i = 0; i < barCount; i++) {
          const time = Date.now() * 0.001;
          const height =
            (Math.sin(i * 0.2 + time) * 0.1 + 0.15) * RENDER_HEIGHT;
          const x = i * barWidth;
          const gradient = ctx.createLinearGradient(
            0,
            RENDER_HEIGHT - height,
            0,
            RENDER_HEIGHT,
          );
          gradient.addColorStop(0, `${colorPrimary}70`);
          gradient.addColorStop(1, `${colorPrimary}20`);
          ctx.fillStyle = gradient;
          ctx.fillRect(x, RENDER_HEIGHT - height, barWidth - 1, height);
        }
      }
    };

    const drawWave = () => {
      ctx.clearRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
      if (dataArrayForDrawing && currentAnalyser && isPlaying) {
        currentAnalyser.getByteTimeDomainData(dataArrayForDrawing);
        ctx.beginPath();
        const sliceWidth = RENDER_WIDTH / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArrayForDrawing[i] / 128.0;
          const y = (v * RENDER_HEIGHT) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(RENDER_WIDTH, RENDER_HEIGHT / 2);
        const gradient = ctx.createLinearGradient(0, 0, RENDER_WIDTH, 0);
        gradient.addColorStop(0, colorSecondary);
        gradient.addColorStop(0.5, colorPrimary);
        gradient.addColorStop(1, colorSecondary);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, RENDER_HEIGHT / 2);
        const time = Date.now() * 0.001;
        for (let i = 0; i < RENDER_WIDTH; i += 5) {
          const y =
            Math.sin(i * 0.03 + time) * (RENDER_HEIGHT * 0.05) +
            RENDER_HEIGHT / 2;
          ctx.lineTo(i, y);
        }
        const gradient = ctx.createLinearGradient(0, 0, RENDER_WIDTH, 0);
        gradient.addColorStop(0, `${colorSecondary}70`);
        gradient.addColorStop(0.5, `${colorPrimary}70`);
        gradient.addColorStop(1, `${colorSecondary}70`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const drawCircle = () => {
      ctx.clearRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
      const centerX = RENDER_WIDTH / 2;
      const centerY = RENDER_HEIGHT / 2;
      const radius = Math.min(centerX, centerY) / 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = colorSecondary;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (dataArrayForDrawing && currentAnalyser && isPlaying) {
        currentAnalyser.getByteFrequencyData(dataArrayForDrawing);
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArrayForDrawing[i] / 255) * radius;
          // const angle = (i / bufferLength) * 2 * Math.PI - Math.PI/2; // Start from top
          const angle = (i / bufferLength) * (2 * Math.PI); // Original angle
          const x1 = centerX + radius * Math.cos(angle);
          const y1 = centerY + radius * Math.sin(angle);
          const x2 = centerX + (radius + barHeight) * Math.cos(angle);
          const y2 = centerY + (radius + barHeight) * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, colorPrimary);
          gradient.addColorStop(1, `${colorSecondary}80`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2; // Consider making this dynamic
          ctx.stroke();
        }
      } else {
        const time = Date.now() * 0.001;
        const barCount = 32;
        for (let i = 0; i < barCount; i++) {
          const angle = (i / barCount) * 2 * Math.PI;
          const barHeight = (Math.sin(i * 0.2 + time * 2) * 0.2 + 0.3) * radius;
          const x1 = centerX + radius * Math.cos(angle);
          const y1 = centerY + radius * Math.sin(angle);
          const x2 = centerX + (radius + barHeight) * Math.cos(angle);
          const y2 = centerY + (radius + barHeight) * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, `${colorPrimary}70`);
          gradient.addColorStop(1, `${colorSecondary}40`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    };

    const drawWaveform = () => {
      ctx.clearRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
      if (dataArrayForDrawing && currentAnalyser && isPlaying) {
        currentAnalyser.getByteTimeDomainData(dataArrayForDrawing);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        const gradient = ctx.createLinearGradient(0, 0, 0, RENDER_HEIGHT);
        gradient.addColorStop(0, "rgba(255, 50, 150, 0.8)");
        gradient.addColorStop(1, "rgba(50, 100, 255, 0.4)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        const sliceWidth = RENDER_WIDTH / (bufferLength - 1);
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArrayForDrawing[i] / 128.0;
          const y = (v * RENDER_HEIGHT) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevX = (i - 1) * sliceWidth;
            const prevY =
              (dataArrayForDrawing[i - 1] / 128.0) * (RENDER_HEIGHT / 2);
            const cpX = prevX + sliceWidth / 2;
            ctx.quadraticCurveTo(cpX, prevY, x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(RENDER_WIDTH, RENDER_HEIGHT / 2);
        ctx.stroke();
        ctx.lineTo(RENDER_WIDTH, RENDER_HEIGHT);
        ctx.lineTo(0, RENDER_HEIGHT);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, RENDER_HEIGHT / 2);
        const time = Date.now() * 0.001;
        const gradient = ctx.createLinearGradient(0, 0, 0, RENDER_HEIGHT);
        gradient.addColorStop(0, "rgba(255, 50, 150, 0.4)");
        gradient.addColorStop(1, "rgba(50, 100, 255, 0.2)");
        ctx.fillStyle = gradient;
        for (let i = 0; i <= RENDER_WIDTH; i += 5) {
          const y =
            Math.sin(i * 0.02 + time) * (RENDER_HEIGHT * 0.1) +
            RENDER_HEIGHT / 2;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.lineTo(RENDER_WIDTH, RENDER_HEIGHT / 2);
        ctx.lineTo(RENDER_WIDTH, RENDER_HEIGHT);
        ctx.lineTo(0, RENDER_HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const drawCircular = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
      const centerX = RENDER_WIDTH / 2;
      const centerY = RENDER_HEIGHT / 2;
      let avgFrequency = 0.3;

      if (dataArrayForDrawing && currentAnalyser && isPlaying) {
        currentAnalyser.getByteFrequencyData(dataArrayForDrawing);
        avgFrequency =
          dataArrayForDrawing.reduce((sum, value) => sum + value, 0) /
          dataArrayForDrawing.length /
          255;
      } else {
        avgFrequency = Math.sin(Date.now() * 0.001 * 1.5) * 0.1 + 0.2;
      }
      const time = Date.now() * 0.001;

      for (let ring = 1; ring <= 3; ring++) {
        const baseRadius = (Math.min(RENDER_WIDTH, RENDER_HEIGHT) / 5.5) * ring;
        const barCount = Math.floor(50 + ring * 15);
        const angleStep = (2 * Math.PI) / barCount;

        for (let i = 0; i < barCount; i++) {
          let amplitude = 0;
          if (dataArrayForDrawing && currentAnalyser && isPlaying) {
            const freqIndex = Math.min(
              bufferLength - 1,
              Math.floor((i / barCount) * bufferLength * 0.8),
            ); // Use up to 80% of spectrum
            amplitude = dataArrayForDrawing[freqIndex] / 255;
          } else {
            amplitude =
              Math.sin(i * (0.15 / ring) + time * (1.2 + ring * 0.3)) * 0.25 +
              0.3;
          }
          const barHeight = baseRadius * amplitude * 0.4 * (ring * 0.2 + 0.6);
          const angle = i * angleStep - Math.PI / 2;
          const innerR = baseRadius - barHeight / 2;
          const outerR = baseRadius + barHeight / 2;
          const x1 = centerX + innerR * Math.cos(angle);
          const y1 = centerY + innerR * Math.sin(angle);
          const x2 = centerX + outerR * Math.cos(angle);
          const y2 = centerY + outerR * Math.sin(angle);

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          const hue = (i / barCount) * 240 + time * 20 + ring * 50;
          gradient.addColorStop(
            0,
            `hsla(${hue}, 100%, 65%, ${0.4 + amplitude * 0.6})`,
          );
          gradient.addColorStop(
            1,
            `hsla(${hue + 30}, 100%, 70%, ${0.6 + amplitude * 0.4})`,
          );
          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.max(1, 1.5 + amplitude * 3.5);
          ctx.lineCap = "round"; // Smoother ends for lines

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        Math.max(8, 20 * (0.5 + avgFrequency * 0.8)),
        0,
        Math.PI * 2,
      );
      const centerGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(8, 20 * (0.5 + avgFrequency * 0.8)),
      );
      centerGradient.addColorStop(
        0,
        `rgba(255, 255, 255, ${0.3 + avgFrequency * 0.5})`,
      );
      centerGradient.addColorStop(1, "rgba(150, 200, 255, 0)");
      ctx.fillStyle = centerGradient;
      ctx.fill();
      ctx.lineCap = "butt"; // Reset
    };

    const drawSpectrum = () => {
      ctx.clearRect(0, 0, RENDER_WIDTH, RENDER_HEIGHT);
      const barCount = 64;
      const barWidth = RENDER_WIDTH / barCount;

      if (dataArrayForDrawing && currentAnalyser && isPlaying) {
        currentAnalyser.getByteFrequencyData(dataArrayForDrawing);
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (bufferLength * 0.75)); // Use 75% of spectrum for visual range
          let value = 0;
          // Simple smoothing by averaging a small window
          const smoothWindow = 2;
          let count = 0;
          for (let k = -smoothWindow; k <= smoothWindow; k++) {
            const idx = dataIndex + k;
            if (idx >= 0 && idx < bufferLength) {
              value += dataArrayForDrawing[idx];
              count++;
            }
          }
          value = count > 0 ? value / count : 0;

          const percent = value / 255;
          const barHeight = RENDER_HEIGHT * percent * 0.9;
          const hue = (i / barCount) * 300;
          const saturation = 60 + percent * 40;
          const lightness = 45 + percent * 25;
          const gradient = ctx.createLinearGradient(
            0,
            RENDER_HEIGHT - barHeight,
            0,
            RENDER_HEIGHT,
          );
          gradient.addColorStop(
            0,
            `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`,
          );
          gradient.addColorStop(
            1,
            `hsla(${hue}, ${saturation}%, ${Math.max(20, lightness - 25)}%, 0.6)`,
          );
          ctx.fillStyle = gradient;
          const x = i * barWidth;
          const y = RENDER_HEIGHT - barHeight;
          const width = barWidth * 0.9; // Bar width with spacing
          const radius = width / 2.5;

          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, RENDER_HEIGHT - radius); // Stop before bottom for rounded bottom
          ctx.quadraticCurveTo(
            x + width,
            RENDER_HEIGHT,
            x + width - radius,
            RENDER_HEIGHT,
          );
          ctx.lineTo(x + radius, RENDER_HEIGHT);
          ctx.quadraticCurveTo(x, RENDER_HEIGHT, x, RENDER_HEIGHT - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        // Placeholder
        for (let i = 0; i < barCount; i++) {
          const time = Date.now() * 0.001;
          const percent = Math.sin(i * 0.2 + time * 1.1) * 0.3 + 0.35;
          const barHeight = RENDER_HEIGHT * percent * 0.7;
          const hue = (i / barCount) * 300;
          const gradient = ctx.createLinearGradient(
            0,
            RENDER_HEIGHT - barHeight,
            0,
            RENDER_HEIGHT,
          );
          gradient.addColorStop(0, `hsla(${hue}, 60%, 50%, 0.6)`);
          gradient.addColorStop(1, `hsla(${hue}, 60%, 30%, 0.3)`);
          ctx.fillStyle = gradient;
          const x = i * barWidth;
          const y = RENDER_HEIGHT - barHeight;
          const width = barWidth * 0.9;
          const radius = width / 2.5;
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, RENDER_HEIGHT - radius);
          ctx.quadraticCurveTo(
            x + width,
            RENDER_HEIGHT,
            x + width - radius,
            RENDER_HEIGHT,
          );
          ctx.lineTo(x + radius, RENDER_HEIGHT);
          ctx.quadraticCurveTo(x, RENDER_HEIGHT, x, RENDER_HEIGHT - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
        }
      }
    };

    // --- Animation Loop ---
    const animate = () => {
      if (!canvasRef.current) {
        // Double check canvas exists
        if (animationFrameIdRef.current)
          cancelAnimationFrame(animationFrameIdRef.current);
        return;
      }
      switch (variant) {
        case "bars":
          drawBars();
          break;
        case "wave":
          drawWave();
          break;
        case "circle":
          drawCircle();
          break;
        case "waveform":
          drawWaveform();
          break;
        case "circular":
          drawCircular();
          break;
        case "spectrum":
          drawSpectrum();
          break;
        default:
          drawBars();
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    if (animationFrameIdRef.current) {
      // Clear any existing animation frame
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(animate); // Start new one
    // console.log("MusicVisualizer: Drawing - Animation loop (re)started.");

    return () => {
      // console.log("MusicVisualizer: Drawing Effect - CLEANUP for variant:", variant);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resize);
      }
    };
  }, [isPlaying, variant, colorPrimary, colorSecondary, audioUrl]); // currentTrack removed, audioUrl is the direct trigger for audio source

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      data-testid="music-visualizer"
    />
  );
};

export default MusicVisualizer;
