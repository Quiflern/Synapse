import React from "react";
import { Memory } from "@/types/memory";
import { Track } from "@/types/music";
import { TagIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryCard } from "./MemoryCard";
import { useTheme } from "@/context/ThemeContext";

interface MemoryListProps {
  memories: Memory[];
  isLoading: boolean;
  trackMap: Record<string, Track>;
  onAddMemoryClick: () => void;
  onEditMemory: (memory: Memory) => void;
  onDeleteMemory: (memory: Memory) => void;
  onPlayTrack: (track: Track) => void;
}

export const MemoryList: React.FC<MemoryListProps> = ({
  memories,
  isLoading,
  trackMap,
  onAddMemoryClick,
  onEditMemory,
  onDeleteMemory,
  onPlayTrack
}) => {
  const { themeColors } = useTheme();
  
  const getTrackInfo = (trackId: string): Track => {
    return trackMap[trackId] || {
      id: "unknown",
      title: "Unknown Track",
      artist: "Unknown Artist",
      duration: 0,
      file_path: "",
      play_count: 0
    };
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <TagIcon size={48} className="mx-auto mb-4 text-gray-400 opacity-40" />
        <h2 className="text-xl font-medium mb-2">No memories yet</h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Add your first memory to start building your musical timeline
        </p>
        <Button 
          onClick={onAddMemoryClick}
          className="shadow-md hover:shadow-lg transition-all"
          style={{
            background: `linear-gradient(45deg, ${themeColors.neon}, ${themeColors.cyber})`,
            color: themeColors.neon === '#ffcc00' ? '#000' : '#fff'
          }}
        >
          <TagIcon className="mr-2 h-4 w-4" />
          Create First Memory
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {memories.map((memory) => {
        const track = getTrackInfo(memory.trackId);
        return (
          <MemoryCard 
            key={memory.id}
            memory={memory}
            track={track}
            onEdit={onEditMemory}
            onDelete={onDeleteMemory}
            onPlayTrack={onPlayTrack}
          />
        );
      })}
    </div>
  );
};

export default MemoryList;
