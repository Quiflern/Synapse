import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Define all available theme types
export type ThemeType =
  // Dark themes
  | "cyberpunk"
  | "midnight-ash"
  | "obsidian-veil"
  | "noir-eclipse"
  | "shadow-ember"
  // Light themes
  | "light"
  | "morning-haze"
  | "ivory-bloom"
  | "sunlit-linen"
  | "cloudpetal"
  | "custom";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    warning: string;
    [key: string]: string; // Allow additional keys for extensibility
  };
  customTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  setCustomTheme: (theme: {
    primary: string;
    secondary: string;
    accent: string;
  }) => void;
  isDarkTheme: boolean;
  getThemeGradient: (
    element: "sidebar" | "modal" | "card" | "background",
  ) => string;
}

// Default theme colors
const defaultThemeColors = {
  primary: "#66c8ff", // Blue for cyberpunk
  secondary: "#50fa7b", // Green
  accent: "#bd93f9", // Purple
  warning: "#ffb86c", // Orange
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "cyberpunk", // Default to cyberpunk
  setTheme: () => {},
  themeColors: defaultThemeColors,
  customTheme: {
    primary: "#bd93f9",
    secondary: "#ff79c6",
    accent: "#66c8ff",
  },
  setCustomTheme: () => {},
  isDarkTheme: true,
  getThemeGradient: () => "",
});

/**
 * ThemeProvider - Manages application theme settings
 *
 * Provides methods for:
 * - Setting the theme
 * - Accessing theme colors
 * - Setting custom theme colors
 * - Getting theme-based gradients
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Default to cyberpunk
  const [theme, setThemeState] = useState<ThemeType>("cyberpunk");
  const [customTheme, setCustomThemeState] = useState({
    primary: "#bd93f9",
    secondary: "#ff79c6",
    accent: "#66c8ff",
  });

  // Determine if the current theme is dark
  const isDarkTheme =
    theme !== "light" &&
    theme !== "morning-haze" &&
    theme !== "ivory-bloom" &&
    theme !== "sunlit-linen" &&
    theme !== "cloudpetal";

  // Get theme colors based on the current theme
  const getThemeColors = () => {
    switch (theme) {
      case "cyberpunk":
        return {
          primary: "#66c8ff", // Electric blue
          secondary: "#50fa7b", // Neon green
          accent: "#bd93f9", // Purple
          warning: "#ff5555", // Red
        };
      case "midnight-ash":
        return {
          primary: "#33C3F0", // Sky blue
          secondary: "#403E43", // Charcoal
          accent: "#221F26", // Dark charcoal
          warning: "#ff5555", // Red
        };
      case "obsidian-veil":
        return {
          primary: "#7E69AB", // Secondary purple
          secondary: "#6E59A5", // Tertiary purple
          accent: "#1A1F2C", // Dark purple
          warning: "#ff5555", // Red
        };
      case "noir-eclipse":
        return {
          primary: "#9F9EA1", // Silver gray
          secondary: "#555555", // Dark gray
          accent: "#221F26", // Dark charcoal
          warning: "#ff5555", // Red
        };
      case "shadow-ember":
        return {
          primary: "#ea384d", // Red
          secondary: "#F97316", // Bright orange
          accent: "#333333", // Dark gray
          warning: "#ff5555", // Red
        };
      case "light":
        return {
          primary: "#3b82f6", // Blue
          secondary: "#6366f1", // Indigo
          accent: "#8b5cf6", // Purple
          warning: "#f59e0b", // Amber
        };
      case "morning-haze": // Original Primary: #D3E4FD (Soft blue), Secondary: #E5DEFF (Soft purple)
        return {
          primary: "#4A7AB5", // Darker, more saturated blue
          secondary: "#6C5FAC", // Darker, more saturated purple
          accent: "#334155", // Dark slate gray for contrast
          warning: "#f59e0b", // Amber
        };
      case "ivory-bloom": // Original Primary: #FFDEE2 (Soft pink), Secondary: #FDE1D3 (Soft peach)
        return {
          primary: "#C77986", // Darker rosy pink
          secondary: "#CC8B77", // Darker terracotta/peach
          accent: "#4B403E", // Dark warm gray
          warning: "#f59e0b", // Amber
        };
      case "sunlit-linen": // Original Primary: #FEF7CD (Soft yellow), Secondary: #FEC6A1 (Soft orange)
        return {
          primary: "#A98127", // Dark gold/mustard
          secondary: "#C46F42", // Dark terracotta/burnt orange
          accent: "#5D4037", // Dark brown
          warning: "#f59e0b", // Amber
        };
      case "cloudpetal": // Original Primary: #FFDEE2 (Soft pink), Secondary: #D3E4FD (Soft blue)
        return {
          primary: "#C77986", // Darker rosy pink (consistent with ivory-bloom's primary)
          secondary: "#4A7AB5", // Darker blue (consistent with morning-haze's primary)
          accent: "#3D4852", // Neutral dark gray
          warning: "#f59e0b", // Amber
        };
      case "custom":
        return {
          primary: customTheme.primary,
          secondary: customTheme.secondary,
          accent: customTheme.accent,
          warning: "#f59e0b", // Default warning color for custom theme
        };
      default:
        return defaultThemeColors;
    }
  };

  const themeColors = getThemeColors();

  const getThemeGradient = (
    element: "sidebar" | "modal" | "card" | "background",
  ) => {
    // Helper: isDarkTheme and customTheme would be available in your component's scope
    // const { theme, isDarkTheme, customTheme } = useTheme(); // Example of how you might get these

    if (element === "sidebar") {
      switch (theme) {
        // Dark Themes
        case "cyberpunk": // Main Color: #0066FF
          return "bg-gradient-to-b from-[#0066FF]/20 via-[#00112A]/85 to-[#00081A] border-r border-[#0066FF]/35";
        case "midnight-ash": // Main Color: #33C3F0
          return "bg-gradient-to-b from-[#33C3F0]/20 via-[#0A1D24]/90 to-[#071318] border-r border-[#33C3F0]/25";
        case "obsidian-veil": // Main Color: #7E69AB
          return "bg-gradient-to-b from-[#7E69AB]/25 via-[#221830]/90 to-[#160F20] border-r border-[#7E69AB]/30";
        case "noir-eclipse": // Main Color: #9F9EA1 (black emphasis)
          return "bg-gradient-to-b from-[#9F9EA1]/15 via-black/80 to-black/95 border-r border-[#9F9EA1]/20";
        case "shadow-ember": // Main Color: #ea384d (darker red emphasis)
          return "bg-gradient-to-b from-[#ea384d]/25 via-[#3B0E13]/90 to-[#1F070A] border-r border-[#ea384d]/30";

        // Light Themes
        case "light": // Main Color: #ffffff (using grays)
          return "bg-gradient-to-b from-gray-50 to-gray-200 border-r border-gray-300";
        case "morning-haze": // Main Color: #D3E4FD (light blue)
          return "bg-gradient-to-b from-white via-[#F0F7FF]/80 to-[#D3E4FD]/50 border-r border-[#C0D7F5]/80";
        case "ivory-bloom": // Main Color: #FFDEE2 (light pink)
          return "bg-gradient-to-b from-white via-[#FFF5F7]/80 to-[#FFDEE2]/50 border-r border-[#FECDD2]/80";
        case "sunlit-linen": // Main Color: #FEF7CD (light yellow)
          return "bg-gradient-to-b from-white via-[#FEFCF0]/80 to-[#FEF7CD]/50 border-r border-[#FDF2B8]/80";
        case "cloudpetal": // Mix: #FFDEE2 (pink) & #D3E4FD (blue)
          return "bg-gradient-to-b from-white via-[#FFF5F7]/60 to-[#E0ECFB]/40 border-r border-[#E8CEDA]/80";

        case "custom":
          return isDarkTheme
            ? `bg-gradient-to-b from-[${customTheme.primary}]/30 via-black/80 to-black/90 border-r border-[${customTheme.primary}]/20`
            : `bg-gradient-to-b from-white to-[${customTheme.primary}]/10 border-r border-gray-200`;
        default:
          return isDarkTheme
            ? "bg-gradient-to-b from-[#0066FF]/20 via-[#00112A]/85 to-[#00081A] border-r border-[#0066FF]/35"
            : "bg-gradient-to-b from-gray-50 to-gray-200 border-r border-gray-300";
      }
    } else if (element === "modal") {
      switch (theme) {
        // Dark Themes
        case "cyberpunk":
          return `bg-gradient-to-br from-black/70 via-[#001A40]/50 to-black/70 backdrop-blur-lg border border-[#0066FF]/25`;
        case "midnight-ash":
          return `bg-gradient-to-br from-[#071318]/80 via-[#0A1D24]/60 to-[#071318]/70 backdrop-blur-lg border border-[#33C3F0]/25`;
        case "obsidian-veil":
          return `bg-gradient-to-br from-[#160F20]/80 via-[#221830]/60 to-[#160F20]/70 backdrop-blur-lg border border-[#7E69AB]/25`;
        case "noir-eclipse":
          return `bg-gradient-to-br from-black/85 via-[#080808]/70 to-black/75 backdrop-blur-lg border border-[#9F9EA1]/20`;
        case "shadow-ember":
          return `bg-gradient-to-br from-[#1F070A]/80 via-[#3B0E13]/60 to-[#1F070A]/70 backdrop-blur-lg border border-[#ea384d]/25`;

        // Light Themes
        case "light":
          return `bg-gradient-to-br from-white/90 via-gray-50/70 to-white/80 backdrop-blur-lg border border-gray-300/80`;
        case "morning-haze":
          return `bg-gradient-to-br from-white/85 via-[#EBF4FF]/70 to-[#D3E4FD]/30 backdrop-blur-lg border border-[#C0D7F5]/50`;
        case "ivory-bloom":
          return `bg-gradient-to-br from-white/85 via-[#FFF0F2]/70 to-[#FFDEE2]/30 backdrop-blur-lg border border-[#FECDD2]/50`;
        case "sunlit-linen":
          return `bg-gradient-to-br from-white/85 via-[#FFFBEF]/70 to-[#FEF7CD]/30 backdrop-blur-lg border border-[#FDF2B8]/50`;
        case "cloudpetal":
          return `bg-gradient-to-br from-white/85 via-[#FFF0F2]/60 to-[#EBF4FF]/40 backdrop-blur-lg border border-[#E8CEDA]/50`;

        case "custom":
          return isDarkTheme
            ? `bg-gradient-to-br from-black/80 via-[${customTheme.accent}]/5 to-black/70 backdrop-blur-lg border border-[${customTheme.primary}]/20`
            : `bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-lg border border-[${customTheme.primary}]/20`;
        default:
          return isDarkTheme
            ? `bg-gradient-to-br from-black/70 via-[#001A40]/50 to-black/70 backdrop-blur-lg border border-[#0066FF]/25`
            : `bg-gradient-to-br from-white/90 via-gray-50/70 to-white/80 backdrop-blur-lg border border-gray-300/80`;
      }
    } else if (element === "card") {
      switch (theme) {
        // Dark Themes
        case "cyberpunk":
          return "bg-gradient-to-br from-black/60 via-[#00112A]/20 to-black/50 backdrop-blur-md border border-[#0066FF]/15";
        case "midnight-ash":
          return "bg-gradient-to-br from-[#0A1D24]/50 via-[#071318]/30 to-[#0A1D24]/40 backdrop-blur-md border border-[#33C3F0]/15";
        case "obsidian-veil":
          return "bg-gradient-to-br from-[#221830]/50 via-[#160F20]/30 to-[#221830]/40 backdrop-blur-md border border-[#7E69AB]/15";
        case "noir-eclipse":
          return "bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-md border border-[#9F9EA1]/10";
        case "shadow-ember":
          return "bg-gradient-to-br from-[#3B0E13]/50 via-[#1F070A]/30 to-[#3B0E13]/40 backdrop-blur-md border border-[#ea384d]/15";

        // Light Themes
        case "light":
          return `bg-gradient-to-br from-white/90 via-gray-50/60 to-white/70 backdrop-blur-md border border-gray-200/70`;
        case "morning-haze":
          return `bg-gradient-to-br from-white/90 via-[#F0F7FF]/70 to-[#EBF4FF]/50 backdrop-blur-md border border-[#C0D7F5]/40`;
        case "ivory-bloom":
          return `bg-gradient-to-br from-white/90 via-[#FFF5F7]/70 to-[#FFF0F2]/50 backdrop-blur-md border border-[#FECDD2]/40`;
        case "sunlit-linen":
          return `bg-gradient-to-br from-white/90 via-[#FEFCF0]/70 to-[#FFFBEF]/50 backdrop-blur-md border border-[#FDF2B8]/40`;
        case "cloudpetal":
          return `bg-gradient-to-br from-white/90 via-[#FFF5F7]/60 to-[#F0F7FF]/40 backdrop-blur-md border border-[#E8CEDA]/40`;

        case "custom":
          return isDarkTheme
            ? `bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md border border-[${customTheme.primary}]/10`
            : `bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md border border-[${customTheme.primary}]/10`;
        default:
          return isDarkTheme
            ? "bg-gradient-to-br from-black/60 via-[#00112A]/20 to-black/50 backdrop-blur-md border border-[#0066FF]/15"
            : "bg-gradient-to-br from-white/90 via-gray-50/60 to-white/70 backdrop-blur-md border border-gray-200/70";
      }
    } else {
      // Background gradients
      switch (theme) {
        // Dark Themes
        case "cyberpunk":
          return "bg-gradient-to-br from-[#0066FF]/25 via-[#001A40]/40 to-black/70";
        case "midnight-ash":
          return "bg-gradient-to-br from-black via-[#0C2229]/80 to-[#33C3F0]/25";
        case "obsidian-veil":
          return "bg-gradient-to-br from-[#7E69AB]/20 via-[#2C203E]/50 to-[#1A1F2C]/80";
        case "noir-eclipse":
          return "bg-gradient-to-br from-[#9F9EA1]/10 via-black/70 to-black/90";
        case "shadow-ember":
          return "bg-gradient-to-br from-[#ea384d]/15 via-[#4D121A]/60 to-[#1A0608]/85";

        // Light Themes
        case "light":
          return "bg-gradient-to-br from-white via-gray-100 to-gray-200/70";
        case "morning-haze":
          return "bg-gradient-to-br from-white via-[#EBF4FF]/70 to-[#D3E4FD]/40";
        case "ivory-bloom":
          return "bg-gradient-to-br from-white via-[#FFF0F2]/70 to-[#FFDEE2]/40";
        case "sunlit-linen":
          return "bg-gradient-to-br from-white via-[#FFFBEF]/70 to-[#FEF7CD]/40";
        case "cloudpetal": // Using the mixed theme for a background
          return "bg-gradient-to-b from-white via-[#FFF5F7]/60 to-[#E0ECFB]/40 border-r border-[#E8CEDA]/80";

        case "custom":
          return isDarkTheme
            ? `bg-gradient-to-br from-[${customTheme.primary}]/20 via-black/90 to-black` // Matched custom dark bg to others
            : "bg-gradient-to-br from-white to-gray-50";
        default:
          return isDarkTheme
            ? "bg-gradient-to-br from-[#0066FF]/25 via-[#001A40]/40 to-black/70" // Adjusted default dark
            : "bg-gradient-to-br from-white via-gray-100 to-gray-200/70";
      }
    }
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    // Remove all theme classes
    document.documentElement.classList.remove(
      "theme-cyberpunk",
      "theme-midnight-ash",
      "theme-obsidian-veil",
      "theme-noir-eclipse",
      "theme-shadow-ember",
      "theme-light",
      "theme-morning-haze",
      "theme-ivory-bloom",
      "theme-sunlit-linen",
      "theme-cloudpetal",
      "theme-custom",
    );

    // Add the new theme class
    document.documentElement.classList.add(`theme-${newTheme}`);

    if (newTheme === "custom") {
      applyCustomThemeColors();
    }
  };

  const applyCustomThemeColors = () => {
    // Apply custom theme CSS variables
    document.documentElement.style.setProperty(
      "--custom-primary",
      customTheme.primary,
    );
    document.documentElement.style.setProperty(
      "--custom-secondary",
      customTheme.secondary,
    );
    document.documentElement.style.setProperty(
      "--custom-accent",
      customTheme.accent,
    );

    // Set custom theme properties in :root
    document.documentElement.style.setProperty(
      "--primary",
      customTheme.primary,
    );
    document.documentElement.style.setProperty(
      "--secondary",
      customTheme.secondary,
    );
    document.documentElement.style.setProperty("--accent", customTheme.accent);
  };

  const setCustomTheme = (theme: {
    primary: string;
    secondary: string;
    accent: string;
  }) => {
    setCustomThemeState(theme);
    localStorage.setItem("customTheme", JSON.stringify(theme));

    // Fixed: Here was the issue - comparing object with string
    applyCustomThemeColors();
  };

  useEffect(() => {
    const storedTheme =
      (localStorage.getItem("theme") as ThemeType) || "cyberpunk";
    setTheme(storedTheme);

    const storedCustomTheme = localStorage.getItem("customTheme");
    if (storedCustomTheme) {
      const parsedTheme = JSON.parse(storedCustomTheme);
      setCustomThemeState(parsedTheme);

      if (storedTheme === "custom") {
        applyCustomThemeColors();
      }
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeColors,
        customTheme,
        setCustomTheme,
        isDarkTheme,
        getThemeGradient,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme - Hook to access theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
