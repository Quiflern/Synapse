import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Track } from "@/types/music";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface AddTracksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tracks: Track[]) => void;
  availableTracks: Track[];
}

const AddTracksDialog: React.FC<AddTracksDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  availableTracks
}) => {
  const { isDarkTheme } = useTheme();
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredTracks = availableTracks.filter(track => 
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleTrack = (track: Track) => {
    if (selectedTracks.some(t => t.id === track.id)) {
      setSelectedTracks(selectedTracks.filter(t => t.id !== track.id));
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const handleAdd = () => {
    onAdd(selectedTracks);
    setSelectedTracks([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        "sm:max-w-lg max-h-[90vh] flex flex-col",
        isDarkTheme ? "bg-black/80 border-white/10 text-white" : "bg-white border-gray-200"
      )}>
        <DialogHeader>
          <DialogTitle>Add Tracks to Playlist</DialogTitle>
          <DialogDescription className={isDarkTheme ? "text-gray-300" : "text-gray-600"}>
            Select tracks from your library to add to this playlist.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "pl-9", 
              isDarkTheme ? "bg-black/60 border-white/20" : "bg-white border-gray-200"
            )}
          />
        </div>

        <ScrollArea className="flex-grow">
          <div className="space-y-1">
            {filteredTracks.length > 0 ? (
              filteredTracks.map(track => (
                <div
                  key={track.id}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    isDarkTheme 
                      ? "hover:bg-white/10" 
                      : "hover:bg-gray-100"
                  )}
                >
                  <Checkbox
                    id={`track-${track.id}`}
                    checked={selectedTracks.some(t => t.id === track.id)}
                    onCheckedChange={() => handleToggleTrack(track)}
                    className="mr-3"
                  />
                  <label
                    htmlFor={`track-${track.id}`}
                    className="flex-grow cursor-pointer text-sm flex justify-between"
                  >
                    <div className="truncate mr-4">
                      <span className="font-medium">{track.title}</span>
                      <span className="opacity-70 mx-1">•</span>
                      <span className={isDarkTheme ? "text-gray-300" : "text-gray-600"}>
                        {track.artist}
                      </span>
                    </div>
                    <span className={cn(
                      "text-xs", 
                      isDarkTheme ? "text-gray-400" : "text-gray-500"
                    )}>
                      {formatDuration(track.duration || 0)}
                    </span>
                  </label>
                </div>
              ))
            ) : (
              <div className={cn(
                "text-center p-4 rounded-md", 
                isDarkTheme ? "bg-white/5" : "bg-gray-50"
              )}>
                <p>No tracks found.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm">
              {selectedTracks.length} track{selectedTracks.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className={isDarkTheme ? "border-white/20 hover:bg-white/10" : ""}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAdd}
                disabled={selectedTracks.length === 0}
              >
                Add to Playlist
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTracksDialog;
