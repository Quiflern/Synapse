
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Play, Plus, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import { Track } from "@/types/music";

interface PlaylistTracksProps {
  tracks: Track[];
  onPlay: (track: Track) => void;
  onRemove: (trackId: string) => void;
  onAddTracks: () => void;
  isEditing: boolean;
  isOwner?: boolean;
}

export const PlaylistTracks: React.FC<PlaylistTracksProps> = ({
  tracks,
  onPlay,
  onRemove,
  onAddTracks,
  isEditing,
  isOwner = false
}) => {
  const { isDarkTheme } = useTheme();

  if (tracks.length === 0) {
    return (
      <div className={cn(
        "rounded-lg border p-8 text-center",
        isDarkTheme 
          ? "border-white/10 bg-black/40" 
          : "border-gray-200 bg-white/80"
      )}>
        <h3 className="text-lg font-medium mb-2">No tracks in this playlist</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add some tracks to get started with your playlist
        </p>
        {isOwner && (
          <Button onClick={onAddTracks}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tracks
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{tracks.length} Tracks</h3>
        {isEditing && isOwner && (
          <Button size="sm" onClick={onAddTracks}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tracks
          </Button>
        )}
      </div>

      <div className={cn(
        "rounded-md overflow-hidden",
        isDarkTheme ? "bg-black/40" : "bg-white/90"
      )}>
        <Table>
          <TableHeader>
            <TableRow className={isDarkTheme ? "border-white/10" : "border-gray-200"}>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Album</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track, index) => (
              <TableRow 
                key={track.id}
                className={cn(
                  "cursor-pointer hover:bg-primary/5",
                  isDarkTheme ? "border-white/10" : "border-gray-200"
                )}
              >
                <TableCell 
                  className="font-medium"
                  onClick={() => onPlay(track)}
                >
                  {index + 1}
                </TableCell>
                <TableCell onClick={() => onPlay(track)}>{track.title}</TableCell>
                <TableCell onClick={() => onPlay(track)}>{track.artist || "Unknown Artist"}</TableCell>
                <TableCell onClick={() => onPlay(track)}>{track.album || "Unknown Album"}</TableCell>
                <TableCell className="text-right" onClick={() => onPlay(track)}>
                  {formatDuration(track.duration)}
                </TableCell>
                <TableCell>
                  {isEditing && isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(track.id)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {(!isEditing || !isOwner) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPlay(track)}
                      className="hover:text-primary"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PlaylistTracks;
