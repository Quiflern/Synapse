import React from "react";
import { BarChart3, Clock, Headphones, Music, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLibrary } from "@/context/LibraryContext";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { Track } from "@/types/music";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard - Main music dashboard page
 *
 * @returns {JSX.Element} The Dashboard page component
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { tracks = [], getTopArtists } = useLibrary();
  const { themeColors, isDarkTheme, theme } = useTheme();
  const { startPlaybackSession } = usePlayer();
  const { user } = useAuth();

  // Get user's tracks only
  const userTracks = tracks.filter(
    (track) => track.uploaded_by === user?.id || track.id.startsWith("local-"),
  );

  // Get recently played tracks - only user's own tracks
  const { data: recentTracks, isLoading: tracksLoading } = useQuery({
    queryKey: ["recent-tracks", user?.id],
    queryFn: async () => {
      // Fetch the tracks sorted by play count (as a proxy for "recently played")
      return [...userTracks]
        .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
        .slice(0, 5);
    },
    enabled: userTracks.length > 0,
    staleTime: 60000, // 1 minute
  });

  // Get top artists using the context function - only user's own data
  const { data: topArtists, isLoading: artistsLoading } = useQuery({
    queryKey: ["top-artists", user?.id],
    queryFn: async () => {
      return getTopArtists(5);
    },
    enabled: userTracks.length > 0,
    staleTime: 60000, // 1 minute
  });

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Format listening time - only for user's tracks
  const formatListeningTime = () => {
    // Calculate the total duration of all tracks
    const totalSeconds = userTracks.reduce((acc, track) => {
      // Multiply by play count if available, otherwise assume played once
      const playCount = track.play_count || 1;
      return acc + (track.duration || 0) * playCount;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  // Format listening time - only for user's tracks
  const getTotalPlays = () => {
    // Sum up all play counts
    return userTracks.reduce((acc, track) => acc + (track.play_count || 1), 0);
  };
  // Function for styling larger panels, mirrors StatCard's getStatGradient
  const getPanelGradientStyle = () => {
    switch (theme) {
      case "cyberpunk":
        return "from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30";
      case "midnight-ash":
        return "from-[#0A1D24]/70 via-[#071318]/50 to-[#0A1D24]/60 border border-[#33C3F0]/25";
      case "obsidian-veil":
        return "from-[#221830]/70 via-[#160F20]/50 to-[#221830]/60 border border-[#7E69AB]/25";
      case "noir-eclipse":
        return "from-black/70 via-[#080808]/60 to-black/65 border border-[#9F9EA1]/20";
      case "shadow-ember":
        return "from-[#3B0E13]/70 via-[#1F070A]/50 to-[#3B0E13]/60 border border-[#ea384d]/25";
      case "light":
        return "from-white/90 via-gray-50/70 to-gray-100/80 border border-gray-300/70";
      case "morning-haze":
        return "from-white/90 via-[#F0F7FF]/70 to-[#EBF4FF]/80 border border-[#C0D7F5]/60";
      case "ivory-bloom":
        return "from-white/90 via-[#FFF5F7]/70 to-[#FFF0F2]/80 border border-[#FECDD2]/60";
      case "sunlit-linen":
        return "from-white/90 via-[#FEFCF0]/70 to-[#FFFBEF]/80 border border-[#E7B448]/70";
      case "cloudpetal":
        return "from-white/90 via-[#FFF5F7]/60 to-[#F0F7FF]/70 border border-[#FECDD2]/60";
      default:
        return isDarkTheme
          ? "from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30" // Cyberpunk default
          : "from-white/90 via-gray-50/70 to-gray-100/80 border border-gray-300/70"; // Light default
    }
  };

  const getInnerCardStyle = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk": // Main: #0066FF
        return "from-[#00112A]/60 via-black/40 to-[#00081A]/50 border border-[#0066FF]/20";
      case "midnight-ash": // Main: #33C3F0
        return "from-[#0A1D24]/60 via-[#071318]/40 to-[#0A1D24]/50 border border-[#33C3F0]/15";
      case "obsidian-veil": // Main: #7E69AB
        return "from-[#221830]/60 via-[#160F20]/40 to-[#221830]/50 border border-[#7E69AB]/15";
      case "noir-eclipse": // Main: #9F9EA1
        return "from-black/60 via-[#080808]/50 to-black/55 border border-[#9F9EA1]/15";
      case "shadow-ember": // Main: #ea384d
        return "from-[#3B0E13]/60 via-[#1F070A]/40 to-[#3B0E13]/50 border border-[#ea384d]/15";

      // Light Themes
      case "light": // Grays
        return "from-white/80 via-gray-50/60 to-gray-100/70 border border-gray-300/50";
      case "morning-haze": // Main: #D3E4FD (soft blue)
        return "from-white/80 via-[#F0F7FF]/60 to-[#EBF4FF]/70 border border-[#C0D7F5]/40";
      case "ivory-bloom": // Main: #FFDEE2 (soft pink)
        return "from-white/80 via-[#FFF5F7]/60 to-[#FFF0F2]/70 border border-[#FECDD2]/40";
      case "sunlit-linen": // Main: #FEF7CD (soft yellow)
        return "from-white/80 via-[#FEFCF0]/60 to-[#FFFBEF]/70 border border-[#E7B448]/50";
      case "cloudpetal": // Primary Visual: #FFDEE2 (pink), Secondary Visual: #D3E4FD (blue)
        return "from-white/80 via-[#FFF5F7]/50 to-[#F0F7FF]/60 border border-[#FECDD2]/40";

      default:
        if (isDarkTheme) {
          // Default to Cyberpunk inner style
          return "from-[#00112A]/60 via-black/40 to-[#00081A]/50 border border-[#0066FF]/20";
        } else {
          // Default to Light inner style
          return "from-white/80 via-gray-50/60 to-gray-100/70 border border-gray-300/50";
        }
    }
  };

  const handlePlayTrack = (clickedTrack: Track) => {
    // Use the currently loaded recentTracks as the playback context.
    // If recentTracks are not yet loaded or empty, default to a playlist of just the clicked track.
    const playlist =
      recentTracks && recentTracks.length > 0 ? recentTracks : [clickedTrack];

    let startIndex = playlist.findIndex((t) => t.id === clickedTrack.id);
    // If clickedTrack is not found in the determined playlist
    // (e.g., playlist defaulted to [clickedTrack] because recentTracks was empty),
    // then startIndex will be 0. If it is in a longer recentTracks list, it will be its actual index.

    if (startIndex === -1) {
      startIndex = 0;
    }

    startPlaybackSession(playlist, startIndex);
  };

  const buttonStyles = () => {
    // Base classes for all themed outline buttons
    const baseClasses =
      "w-full mt-4 h-9 rounded-md px-3 text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center";

    switch (theme) {
      // Dark Themes
      case "cyberpunk": // Main: #0066FF
        return `${baseClasses} border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/10`;
      case "midnight-ash": // Main: #33C3F0
        return `${baseClasses} border-[#33C3F0] text-[#33C3F0] hover:bg-[#33C3F0]/10`;
      case "obsidian-veil": // Main: #7E69AB
        return `${baseClasses} border-[#7E69AB] text-[#7E69AB] hover:bg-[#7E69AB]/10`;
      case "noir-eclipse": // Main: #9F9EA1
        return `${baseClasses} border-[#9F9EA1] text-[#9F9EA1] hover:bg-[#9F9EA1]/10`;
      case "shadow-ember": // Main: #ea384d
        return `${baseClasses} border-[#ea384d] text-[#ea384d] hover:bg-[#ea384d]/10`;

      // Light Themes
      case "light": // Grays
        return `${baseClasses} border-gray-400 text-gray-700 hover:bg-gray-100`; // Darker border/text
      case "morning-haze": // Text Primary: #4A7AB5, BG Accent: #D3E4FD
        return `${baseClasses} border-[#4A7AB5] text-[#4A7AB5] hover:bg-[#D3E4FD]/40`;
      case "ivory-bloom": // Text Primary: #C77986, BG Accent: #FFDEE2
        return `${baseClasses} border-[#C77986] text-[#C77986] hover:bg-[#FFDEE2]/40`;
      case "sunlit-linen": // Text Primary: #A98127, BG Accent: #FEF7CD
        return `${baseClasses} border-[#A98127] text-[#A98127] hover:bg-[#FEF7CD]/40`;
      case "cloudpetal": // Text Primary: #C77986 (Pink), BG Accent: #FFDEE2 (Pink for consistency)
        return `${baseClasses} border-[#C77986] text-[#C77986] hover:bg-[#FFDEE2]/40`;

      default:
        if (isDarkTheme) {
          // Default to Cyberpunk outline style
          return `${baseClasses} border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF]/10`;
        } else {
          // Default to Light outline style
          return `${baseClasses} border-gray-400 text-gray-700 hover:bg-gray-100`;
        }
    }
  };

  const titleColor = () => {
    // This logic is typically identical to getIconColor for these stat cards.
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return "text-[#0066FF]";
      case "midnight-ash":
        return "text-[#33C3F0]";
      case "obsidian-veil":
        return "text-[#7E69AB]";
      case "noir-eclipse":
        return "text-[#9F9EA1]";
      case "shadow-ember":
        return "text-[#ea384d]";

      // Light Themes
      case "light":
        return "text-gray-700";
      case "morning-haze":
        return "text-[#4A7AB5]";
      case "ivory-bloom":
        return "text-[#C77986]";
      case "sunlit-linen":
        return "text-[#A98127]";
      case "cloudpetal":
        return "text-[#C77986]";

      default:
        if (isDarkTheme) {
          return `text-[#0066FF]`;
        } else {
          return `text-gray-700`;
        }
    }
  };

  const getRecentItemStyle = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return `bg-[#00081A]/80 hover:bg-[#00112A]/70 hover:border hover:border-electric`;
      case "midnight-ash":
        return `bg-[#071318]/60 hover:bg-[#0A1D24]/70 hover:border hover:border-[#33C3F0]`;
      case "obsidian-veil":
        return `bg-[#160F20]/60 hover:bg-[#221830]/70 hover:border hover:border-[#7E69AB]`;
      case "noir-eclipse":
        return `bg-black/50 hover:bg-black/60 hover:border hover:border-[#9F9EA1]`;
      case "shadow-ember":
        return `bg-[#1F070A]/60 hover:bg-[#3B0E13]/70 hover:border hover:border-[#ea384d]`;

      // Light Themes
      case "light":
        return `bg-gray-100/70 hover:bg-gray-200/90 hover:border hover:border-electric`;
      case "morning-haze":
        return `bg-[#EBF4FF]/80 hover:bg-[#E0ECFB]/95 hover:border hover:border-[#4A7AB5]`;
      case "ivory-bloom":
        return `bg-[#FFF0F2]/80 hover:bg-[#FFF5F7]/95 hover:border hover:border-[#C77986]`;
      case "sunlit-linen":
        return `bg-[#FFFBEF]/80 hover:bg-[#FEFCF0]/95 hover:border hover:border-[#A98127]`;
      case "cloudpetal":
        return `bg-[#FFF0F2]/80 hover:bg-[#FFF5F7]/95 hover:border hover:border-[#C77986]`;

      default:
        return isDarkTheme
          ? `bg-[#00081A]/80 hover:bg-[#00112A]/70 hover:border hover:border-[electric]`
          : `bg-gray-100/70 hover:bg-gray-200/90 hover:border hover:border-electric`;
    }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className={`text-3xl font-bold mb-4 md:mb-0 ${titleColor()}`}>
          Music Dashboard
        </h1>

        <div className="flex gap-3">
          <Button
            variant="default"
            size="sm"
            className="hover-glow"
            onClick={() => navigate("/app/analytics")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Listening Time"
          value={
            tracksLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              formatListeningTime()
            )
          }
          subtitle="Total listening time"
          icon={Clock}
        />

        <StatCard
          title="Tracks Played"
          value={
            tracksLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              getTotalPlays().toString()
            )
          }
          subtitle="Total plays"
          icon={Music}
        />

        <StatCard
          title="Library Size"
          value={
            tracksLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              userTracks.length.toString()
            )
          }
          subtitle="Tracks in library"
          icon={Headphones}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Panel */}
        <Card
          className={`lg:col-span-2 bg-gradient-to-br ${getPanelGradientStyle()} backdrop-blur-md`}
        >
          <CardHeader>
            <CardTitle className={`${titleColor()}`}>
              Listening Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div
                className={`bg-gradient-to-br ${getInnerCardStyle()} p-4 rounded-lg`}
              >
                <h4 className="text-sm text-gray-400 mb-1">Top Genre</h4>
                <div className="text-lg font-medium">
                  {tracksLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    "Electronic"
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Based on your most played tracks
                </div>
              </div>

              <div
                className={`bg-gradient-to-br ${getInnerCardStyle()} p-4 rounded-lg`}
              >
                <h4 className="text-sm text-gray-400 mb-1">Favorite Artist</h4>
                <div className="text-lg font-medium">
                  {artistsLoading ? (
                    <Skeleton className="h-6 w-28" />
                  ) : topArtists && topArtists.length > 0 ? (
                    topArtists[0].name
                  ) : (
                    "No data yet"
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {artistsLoading ? (
                    <Skeleton className="h-3 w-20" />
                  ) : topArtists && topArtists.length > 0 ? (
                    `${topArtists[0].plays} tracks played`
                  ) : (
                    "Start listening to build stats"
                  )}
                </div>
              </div>
            </div>

            <div
              className={`bg-gradient-to-br ${getInnerCardStyle()} p-4 rounded-lg`}
            >
              <h4 className="text-sm text-gray-400 mb-2">Activity by Day</h4>

              <div className="flex items-end justify-between h-24 gap-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, i) => {
                    // Use semi-random heights but make it deterministic
                    const height = artistsLoading
                      ? 20
                      : [30, 45, 25, 60, 80, 95, 70][i];
                    const color = isDarkTheme
                      ? themeColors.primary
                      : themeColors.primary;

                    return (
                      <div
                        key={day}
                        className="flex flex-col items-center flex-1"
                      >
                        {artistsLoading ? (
                          <Skeleton
                            className="w-full rounded-t-sm"
                            style={{ height: `${height}%` }}
                          />
                        ) : (
                          <div
                            className="w-full rounded-t-sm"
                            style={{
                              height: `${height}%`,
                              backgroundColor: color,
                              transition: "all 0.3s ease",
                            }}
                          ></div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{day}</div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Played Artists Panel */}
        <Card
          className={`bg-gradient-to-br ${getPanelGradientStyle()} backdrop-blur-md`}
        >
          <CardHeader>
            <CardTitle className={`${titleColor()}`}>
              Most Played Artists
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {artistsLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className={"flex items-center gap-3"}>
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
              : (topArtists || []).map((artist, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`text-lg font-medium ${titleColor()}`}>
                      {index + 1}
                    </div>
                    <div className="h-10 w-10 bg-black/30 rounded-full flex items-center justify-center">
                      {artist.image ? (
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <Music className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-left text-sm font-medium">
                        {artist.name}
                      </h4>
                      <div className="text-left text-xs text-gray-500">
                        {artist.plays} plays
                      </div>
                    </div>
                  </div>
                ))}

            {!artistsLoading && (!topArtists || topArtists.length === 0) && (
              <div className="text-center py-4 text-sm text-gray-400">
                Start listening to see your top artists here
              </div>
            )}

            <button
              type="button" // Good practice for buttons not submitting forms
              className={buttonStyles()}
              onClick={() => navigate("/app/analytics")}
            >
              View All Statistics
            </button>
          </CardContent>
        </Card>
      </div>

      <h2 className={`text-xl font-medium my-6 ${titleColor()}`}>
        Recently Played
      </h2>

      <div className="space-y-3">
        {tracksLoading
          ? Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className={` p-4 rounded-lg ${getRecentItemStyle()}`}
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))
          : (recentTracks || []).map((track, index) => (
              <div
                key={index}
                className={`${getRecentItemStyle()} p-4 rounded-lg transition-colors cursor-pointer`}
                onClick={() => handlePlayTrack(track)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-black/30 rounded flex items-center justify-center shrink-0">
                    {track.albumArt ? (
                      <img
                        src={track.albumArt}
                        alt={track.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <Music className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-left text-sm font-medium truncate">
                      {track.title}
                    </h3>
                    <p className="text-left text-xs text-gray-500 truncate">
                      {track.artist}
                    </p>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full h-8 w-8 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

        {!tracksLoading && (!recentTracks || recentTracks.length === 0) && (
          <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
            <Music className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <h3 className="text-lg font-medium mb-1">No tracks played yet</h3>
            <p className="text-gray-500 text-sm">
              Your recent tracks will appear here once you start listening
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Stat Card component
interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: React.ElementType;
}

const StatCard = ({ title, value, subtitle, icon: Icon }: StatCardProps) => {
  const { theme, isDarkTheme } = useTheme();

  // Get the icon background color based on theme
  const getIconBgColor = () => {
    switch (theme) {
      case "cyberpunk":
        return "bg-[#0066FF]/15";
      case "midnight-ash":
        return "bg-[#33C3F0]/15";
      case "obsidian-veil":
        return "bg-[#7E69AB]/15";
      case "noir-eclipse":
        return "bg-[#9F9EA1]/20";
      case "shadow-ember":
        return "bg-[#ea384d]/15";
      case "light":
        return "bg-[#E5E7EB]/30";
      case "morning-haze":
        return "bg-[#D3E4FD]/30";
      case "ivory-bloom":
        return "bg-[#FFDEE2]/30";
      case "sunlit-linen":
        return "bg-[#FEF7CD]/30";
      case "cloudpetal":
        return "bg-[#FFDEE2]/30";
      default:
        return "bg-primary/10";
    }
  };

  // Get the icon color based on theme
  const getIconColor = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return "text-[#0066FF]";
      case "midnight-ash":
        return "text-[#33C3F0]";
      case "obsidian-veil":
        return "text-[#7E69AB]";
      case "noir-eclipse":
        return "text-[#9F9EA1]";
      case "shadow-ember":
        return "text-[#ea384d]";

      // Light Themes
      case "light":
        return "text-gray-700";
      case "morning-haze":
        return "text-[#4A7AB5]";
      case "ivory-bloom":
        return "text-[#C77986]";
      case "sunlit-linen":
        return "text-[#A98127]";
      case "cloudpetal":
        return "text-[#C77986]";

      default:
        if (isDarkTheme) {
          return `text-[#0066FF]`;
        } else {
          return `text-gray-700`;
        }
    }
  };

  // Get the Value Text color based on theme
  const getValueColor = () => {
    // This logic is typically identical to getIconColor for these stat cards.
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return "text-[#0066FF]";
      case "midnight-ash":
        return "text-[#33C3F0]";
      case "obsidian-veil":
        return "text-[#7E69AB]";
      case "noir-eclipse":
        return "text-[#9F9EA1]";
      case "shadow-ember":
        return "text-[#ea384d]";

      // Light Themes
      case "light":
        return "text-gray-700";
      case "morning-haze":
        return "text-[#4A7AB5]";
      case "ivory-bloom":
        return "text-[#C77986]";
      case "sunlit-linen":
        return "text-[#A98127]";
      case "cloudpetal":
        return "text-[#C77986]";

      default:
        if (isDarkTheme) {
          return `text-[#0066FF]`;
        } else {
          return `text-gray-700`;
        }
    }
  };

  const getStatGradient = () => {
    switch (theme) {
      // Dark Themes
      case "cyberpunk":
        return "from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30";
      case "midnight-ash":
        return "from-[#0A1D24]/70 via-[#071318]/50 to-[#0A1D24]/60 border border-[#33C3F0]/25";
      case "obsidian-veil":
        return "from-[#221830]/70 via-[#160F20]/50 to-[#221830]/60 border border-[#7E69AB]/25";
      case "noir-eclipse":
        return "from-black/70 via-[#080808]/60 to-black/65 border border-[#9F9EA1]/20";
      case "shadow-ember":
        return "from-[#3B0E13]/70 via-[#1F070A]/50 to-[#3B0E13]/60 border border-[#ea384d]/25";

      // Light Themes
      case "light": // Grays
        return "from-white/90 via-gray-50/70 to-gray-100/80 border border-gray-300/70";
      case "morning-haze":
        return "from-white/90 via-[#F0F7FF]/70 to-[#EBF4FF]/80 border border-[#C0D7F5]/60";
      case "ivory-bloom":
        return "from-white/90 via-[#FFF5F7]/70 to-[#FFF0F2]/80 border border-[#FECDD2]/60";
      case "sunlit-linen":
        return "from-white/90 via-[#FEFCF0]/70 to-[#FFFBEF]/80 border border-[#E7B448]/70";
      case "cloudpetal":
        return "from-white/90 via-[#FFF5F7]/60 to-[#F0F7FF]/70 border border-[#FECDD2]/60";

      default:
        if (isDarkTheme) {
          // Default to Cyberpunk style
          return "from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30";
        } else {
          // Default to Light style
          return "from-white/90 via-gray-50/70 to-gray-100/80 border border-gray-300/70";
        }
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getStatGradient()} p-4 rounded-xl`}>
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 ${getIconBgColor()} rounded-full flex items-center justify-center`}
        >
          <Icon className={`h-6 w-6 ${getIconColor()}`} />
        </div>
        <div className="flex-col">
          <h3 className="text-sm text-muted-foreground">{title}</h3>
          <div className={`text-2xl font-bold mt-1 ${getValueColor()}`}>
            {value}
          </div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
