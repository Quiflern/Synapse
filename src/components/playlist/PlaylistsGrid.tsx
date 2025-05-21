import React from "react";
import { Grid } from "@/components/ui/grid";
import PlaylistCard from "./PlaylistCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface PlaylistItem {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  trackCount: number;
  trackImages?: string[];
  is_public?: boolean;
}

interface PlaylistsGridProps {
  playlists: PlaylistItem[];
  onCreateNew?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPlay: (id: string) => void;
  isLoading?: boolean;
  isPublicView?: boolean;
}

// Skeleton loader component for playlists
const PlaylistSkeleton = () => {
  const { isDarkTheme } = useTheme();

  return (
    <div
      className={cn(
        "h-full overflow-hidden rounded-lg border",
        isDarkTheme
          ? "bg-black/40 border-white/10"
          : "bg-white/80 border-gray-200",
      )}
    >
      <div className="aspect-square relative">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4">
        <Skeleton className="w-3/4 h-5 mb-2" />
        <Skeleton className="w-full h-12" />
      </div>
      <div className="p-2 pt-0 flex justify-between">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex gap-1">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const PlaylistsGrid: React.FC<PlaylistsGridProps> = ({
  playlists,
  onCreateNew,
  onEdit,
  onDelete,
  onPlay,
  isLoading = false,
  isPublicView = false,
}) => {
  const { theme, isDarkTheme } = useTheme();

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

  // Display skeleton loaders when loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${titleColor()}`}>
            Your Playlists
          </h2>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <Grid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} className="gap-4">
          {[...Array(8)].map((_, i) => (
            <PlaylistSkeleton key={i} />
          ))}
        </Grid>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${titleColor()}`}>
          {isPublicView ? "Public Playlists" : "Your Playlists"}
        </h2>
        {!isPublicView && onCreateNew && (
          <Button onClick={onCreateNew} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Playlist
          </Button>
        )}
      </div>

      {playlists.length === 0 ? (
        <div
          className={cn(
            "rounded-lg border p-8 text-center",
            isDarkTheme
              ? "border-white/10 bg-black/40"
              : "border-gray-200 bg-white/80",
          )}
        >
          <h3 className="text-lg font-medium mb-2">
            {isPublicView
              ? "No public playlists available"
              : "No playlists yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isPublicView
              ? "There are no public playlists to browse yet"
              : "Create your first playlist to organize your music"}
          </p>
          {!isPublicView && onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          )}
        </div>
      ) : (
        <Grid columns={{ sm: 2, md: 3, lg: 6, xl: 6 }} className="gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              id={playlist.id}
              name={playlist.name}
              description={playlist.description || undefined}
              trackCount={playlist.trackCount}
              coverImage={playlist.cover_image || undefined}
              trackImages={playlist.trackImages}
              onEdit={!isPublicView ? onEdit : undefined}
              onDelete={!isPublicView ? onDelete : undefined}
              onPlay={onPlay}
            />
          ))}
        </Grid>
      )}
    </div>
  );
};

export default PlaylistsGrid;
