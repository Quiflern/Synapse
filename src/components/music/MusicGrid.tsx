import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Music2, Globe, Lock, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlbumArtFallback } from "./AlbumArtFallback";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { Track } from "@/types/music";
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditTrackForm } from "@/components/music/EditTrackForm";
import { useLibrary } from "@/context/LibraryContext";
import { toast } from "@/components/ui/use-toast";

interface MusicGridProps {
    tracks: Track[];
    isLoading?: boolean;
    onTrackPlay?: (track: Track) => void;
    onTrackClick?: (track: Track) => void;
    onUpdateLocalTrack: (updatedTrack: Track) => void;
    onDeleteLocalTrack: (trackId: string) => void;
}

/**
 * @file MusicGrid.tsx
 * @description Displays tracks in a grid. Handles track interactions and opens a standalone modal for editing.
 */
export const MusicGrid: React.FC<MusicGridProps> = ({
                                                        tracks, isLoading = false, onTrackPlay, onTrackClick, onUpdateLocalTrack, onDeleteLocalTrack,
                                                    }) => {
    const navigate = useNavigate();
    const { currentTrack, isPlaying, togglePlayPause, startPlaybackSession } = usePlayer();
    const { isDarkTheme } = useTheme();
    const { user } = useAuth();
    const { updateTrack: updateRemoteTrack, deleteTrack: deleteRemoteTrack } = useLibrary();

    const [editingTrack, setEditingTrack] = useState<Track | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    if (!isLoading && tracks.length === 0) {
        return (
            <div className="text-center py-16">
                <Music2 className="mx-auto h-16 w-16 opacity-20 mb-4" />
                <h3 className="text-xl font-medium mb-1">No Tracks Found</h3>
                <p className="text-muted-foreground">
                    Try adjusting your search or filters, or upload some music.
                </p>
            </div>
        );
    }
    if (isLoading && tracks.length === 0) return null;

    // Define smoother grid animation variants
    const gridVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.3,
                ease: "easeIn"
            }
        }
    };

    // Define smoother grid item animation variants
    const gridItemVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                duration: 0.3
            }
        },
        exit: { opacity: 0 }
    };

    const userOwnsTrack = (track: Track) => track.uploaded_by === user?.id || track.id.startsWith("local-");
    const isCurrentTrackPlaying = (track: Track) => currentTrack?.id === track.id;

    const handleOpenEditModal = (track: Track) => {
        setEditingTrack(track);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        // Delay resetting editingTrack to allow for exit animation of the modal
        setTimeout(() => setEditingTrack(null), 300);
    };

    const handleSaveEditedTrack = async (updatedTrackFromForm: Track): Promise<boolean> => {
        if (!editingTrack) return false;
        try {
            if (updatedTrackFromForm.id.startsWith("local-")) {
                onUpdateLocalTrack(updatedTrackFromForm);
            } else {
                await updateRemoteTrack(updatedTrackFromForm);
            }
            toast({ title: "Track updated successfully" });
            // Closing is handled by EditTrackForm on successful save (after a delay)
            return true;
        } catch (error) {
            console.error("Error updating track in MusicGrid:", error);
            toast({ title: "Failed to update track", variant: "destructive" });
            return false;
        }
    };

    const handleDeleteAction = (trackId: string) => {
        // The confirmation dialog is part of the EditTrackForm's responsibility
        // if it wants one, or we can keep it here. For now, assuming EditTrackForm calls this after confirm.
        // For simplicity, window.confirm can be here if EditTrackForm doesn't handle it.
        if (window.confirm("Are you sure you want to delete this track? This action cannot be undone.")) {
            const trackToDeleteIsLocal = trackId.startsWith("local-");
            (async () => { // IIFE to use async/await
                try {
                    if (trackToDeleteIsLocal) {
                        onDeleteLocalTrack(trackId);
                    } else {
                        await deleteRemoteTrack(trackId);
                    }
                    toast({ title: "Track deleted successfully" });
                    handleCloseEditModal();
                } catch (error) {
                    console.error("Error deleting track:", error);
                    toast({ title: "Failed to delete track", variant: "destructive" });
                }
            })();
        }
    };

    return (
        <>
            <motion.div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-5"
                        variants={gridVariants} initial="hidden" animate="show" exit="exit" layout>
                {tracks.map((track) => {
                    const isActive = isCurrentTrackPlaying(track);
                    return (
                        <motion.div
                            key={track.id}
                            className={cn(
                                "group/card relative rounded-lg overflow-hidden flex flex-col cursor-pointer transition-all shadow-sm",
                                isDarkTheme ? "bg-neutral-800/60 hover:bg-neutral-700/70" : "bg-neutral-200/60 hover:bg-neutral-300/70",
                                isActive && (isDarkTheme
                                    ? "ring-2 ring-primary/70 bg-primary/20 shadow-lg shadow-primary/25"
                                    : "ring-2 ring-primary/70 bg-primary/10 shadow-lg shadow-primary/25"),
                            )}
                            variants={gridItemVariants}
                            onClick={() => onTrackClick?.(track)}
                            layout
                        >
                            <div
                                className="relative aspect-square bg-neutral-700/30 overflow-hidden"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const clickedIndex = tracks.findIndex(t => t.id === track.id); // 'tracks' is the prop
                                    if (clickedIndex !== -1 && startPlaybackSession) {
                                        startPlaybackSession(tracks, clickedIndex); // Default: no shuffle when clicking a specific track
                                    } else if (onTrackPlay) { // Fallback if startPlaybackSession isn't available (shouldn't happen ideally)
                                        onTrackPlay(track);
                                    } else {
                                        navigate("/app/now-playing");
                                    }
                                }}
                            >
                                {track.albumArt ? (
                                    <img src={track.albumArt} alt={track.title} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105" />
                                ) : ( <AlbumArtFallback title={track.title} artist={track.artist || "Unknown Artist"} /> )}

                                {track.uploaded_by === user?.id && !track.id.startsWith("local-") && (
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip><TooltipTrigger asChild>
                                            <div className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 backdrop-blur-sm shadow-md">
                                                {track.is_public ? <Globe className="h-3 w-3 text-green-400" /> : <Lock className="h-3 w-3 text-gray-400" />}
                                            </div>
                                        </TooltipTrigger><TooltipContent side="left"><p className="text-xs">{track.is_public ? "Public" : "Private"}</p></TooltipContent></Tooltip>
                                    </TooltipProvider>
                                )}

                                {userOwnsTrack(track) && (
                                    <div className="absolute bottom-1.5 right-1.5 z-30">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(track); }}
                                            aria-label="Edit track"
                                            className="group/edit flex items-center justify-center p-1.5 sm:p-2 rounded-full transition-all duration-300 ease-out bg-black/60 hover:bg-primary/90 text-white hover:shadow-md"
                                        >
                                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 ease-out group-hover/edit:scale-110" />
                                            <span className="ml-0 text-[10px] sm:text-xs font-medium opacity-0 w-0 group-hover/edit:ml-1 group-hover/edit:opacity-100 group-hover/edit:w-auto transition-all duration-300 ease-out overflow-hidden whitespace-nowrap">
                                                Edit
                                            </span>
                                        </button>
                                    </div>
                                )}

                                <div className={cn( "absolute inset-0 bg-black/0 group-hover/card:bg-black/50 flex items-center justify-center transition-all duration-300 ease-out z-10", isActive && "bg-black/40")}>
                                    <div className={cn( "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-all duration-300 ease-out bg-black/30 backdrop-blur-sm border border-white/20 shadow-xl", "opacity-0 group-hover/card:opacity-100 scale-75 group-hover/card:scale-100", isActive && "opacity-100 scale-100")}>
                                        {isActive && isPlaying ? (
                                            <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-white" onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} />
                                        ) : (
                                            <Play
                                                className="h-5 w-5 sm:h-6 sm:w-6 text-white ml-0.5 sm:ml-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const clickedIndex = tracks.findIndex(t => t.id === track.id); // 'tracks' is the prop
                                                    if (clickedIndex !== -1 && startPlaybackSession) {
                                                        startPlaybackSession(tracks, clickedIndex); // Default: no shuffle
                                                    } else if (onTrackPlay) { // Fallback
                                                        onTrackPlay(track);
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-left px-2 py-2 sm:px-3 sm:py-3 flex flex-col flex-1">
                                <h3 className={cn("text-xs sm:text-sm font-semibold truncate", isActive ? "text-primary" : (isDarkTheme ? "text-gray-100" : "text-gray-800"))}>
                                    {track.title}
                                </h3>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                    {track.artist || "Unknown Artist"}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <AnimatePresence>
                {showEditModal && editingTrack && (
                    <EditTrackForm
                        key="edit-form-modal"
                        isOpen={showEditModal}
                        track={editingTrack}
                        onSave={handleSaveEditedTrack}
                        onDelete={handleDeleteAction}
                        onClose={handleCloseEditModal}
                    />
                )}
            </AnimatePresence>
        </>
    );
};
