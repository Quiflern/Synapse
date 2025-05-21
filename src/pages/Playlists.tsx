// noinspection ExceptionCaughtLocallyJS

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useLibrary } from "@/context/LibraryContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Track } from "@/types/music";
import { PlaylistFormData } from "@/types/player";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Globe, ListMusic, Lock, Music, Play, Save, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Playlist Components
import PlaylistsGrid, { PlaylistItem } from "@/components/playlist/PlaylistsGrid";
import PlaylistFormDialog from "@/components/playlist/PlaylistFormDialog";
import DeletePlaylistDialog from "@/components/playlist/DeletePlaylistDialog";
import PlaylistTracks from "@/components/playlist/PlaylistTracks";
import AddTracksDialog from "@/components/playlist/AddTracksDialog";
import AuthRequired from "@/components/auth/AuthRequired";

/**
 * Playlists - User playlist management page
 *
 * This page displays the user's playlists and public playlists
 * and allows for creation, editing, and deletion of playlists.
 * Users can also control the visibility of their playlists.
 */
const Playlists: React.FC = () => {
  const navigate = useNavigate();
  const { playlistId } = useParams();
  const { user } = useAuth();
  const { theme, themeColors, isDarkTheme } = useTheme();
  const { allTracks } = useLibrary();
  const { startPlaybackSession } = usePlayer();
  const [hovered, setHovered] = useState(false);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<PlaylistItem[]>([]);
  const [activeTab, setActiveTab] = useState("my-playlists");
  const [currentPlaylist, setCurrentPlaylist] = useState<{
    id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    is_public: boolean;
    created_by: string;
    tracks: Track[];
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addTracksDialogOpen, setAddTracksDialogOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState<
    PlaylistFormData | undefined
  >(undefined);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Fetch playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch user's playlists
        const { data: playlistsData, error: playlistsError } = await supabase
          .from("playlists")
          .select("*")
          .eq("created_by", user.id);

        if (playlistsError) throw playlistsError;

        // Fetch public playlists (not owned by current user)
        const { data: publicPlaylistsData, error: publicPlaylistsError } =
          await supabase
            .from("playlists")
            .select("*")
            .eq("is_public", true)
            .not("created_by", "eq", user.id);

        if (publicPlaylistsError) throw publicPlaylistsError;

        // For each playlist, get the track count and track images
        const processPlaylistData = async (playlists: any[]) => {
          return await Promise.all(
            playlists.map(async (playlist) => {
              // Get track count
              const { count, error: countError } = await supabase
                .from("playlist_tracks")
                .select("*", { count: "exact", head: true })
                .eq("playlist_id", playlist.id);

              if (countError) throw countError;

              // Get track IDs for this playlist
              const { data: playlistTracksData, error: tracksError } =
                await supabase
                  .from("playlist_tracks")
                  .select("track_id")
                  .eq("playlist_id", playlist.id)
                  .limit(4); // Get up to 4 tracks for the grid display

              if (tracksError) throw tracksError;

              // Get the cover images for these tracks
              const trackIds = playlistTracksData.map((item) => item.track_id);
              const trackImages = allTracks
                .filter((track) => trackIds.includes(track.id))
                .map((track) => track.albumArt || undefined)
                .filter(Boolean);

              return {
                ...playlist,
                trackCount: count || 0,
                trackImages,
              };
            }),
          );
        };

        const processedPlaylists = await processPlaylistData(
          playlistsData || [],
        );
        const processedPublicPlaylists = await processPlaylistData(
          publicPlaylistsData || [],
        );

        setPlaylists(processedPlaylists);
        setPublicPlaylists(processedPublicPlaylists);
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast.error("Failed to load playlists. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [user, allTracks]);

  // Fetch single playlist details when ID changes
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      if (!playlistId) {
        setCurrentPlaylist(null);
        return;
      }

      try {
        // Get playlist details
        const { data: playlistData, error: playlistError } = await supabase
          .from("playlists")
          .select("*")
          .eq("id", playlistId)
          .single();

        if (playlistError) throw playlistError;

        // Verify user has access - only if it's their playlist or it's public
        if (playlistData.created_by !== user?.id && !playlistData.is_public) {
          throw new Error("You don't have permission to view this playlist");
        }

        // Get playlist tracks
        const { data: playlistTracksData, error: tracksError } = await supabase
          .from("playlist_tracks")
          .select("track_id, position")
          .eq("playlist_id", playlistId)
          .order("position");

        if (tracksError) throw tracksError;

        // Match track IDs with actual track data
        const trackIds = playlistTracksData.map((item) => item.track_id);
        const playlistTracks = allTracks
          .filter((track) => trackIds.includes(track.id))
          .sort((a, b) => {
            const aPos =
              playlistTracksData.find((item) => item.track_id === a.id)
                ?.position || 0;
            const bPos =
              playlistTracksData.find((item) => item.track_id === b.id)
                ?.position || 0;
            return aPos - bPos;
          });

        setCurrentPlaylist({
          id: playlistData.id,
          name: playlistData.name,
          description: playlistData.description,
          cover_image: playlistData.cover_image,
          is_public: playlistData.is_public || false,
          created_by: playlistData.created_by,
          tracks: playlistTracks,
        });

        // Only enable edit mode if this is the user's playlist
        if (isEditMode && playlistData.created_by !== user?.id) {
          setIsEditMode(false);
        }
      } catch (error) {
        console.error("Error fetching playlist details:", error);
        toast.error(
          "Failed to load playlist. The playlist could not be found or you don't have permission to view it.",
        );
        navigate("/app/playlists");
      }
    };

    fetchPlaylistDetails();
  }, [playlistId, user, allTracks, navigate, isEditMode]);

  const getAvailableTracks = () => {
    if (!currentPlaylist) return [];

    // For privacy, only show user's own tracks and public tracks
    const availableTracks = allTracks.filter(
      (track) =>
        track.uploaded_by === user?.id ||
        track.is_public ||
        track.id.startsWith("local-"),
    );

    const currentTrackIds = currentPlaylist.tracks.map((track) => track.id);
    return availableTracks.filter(
      (track) => !currentTrackIds.includes(track.id),
    );
  };

  // Handlers
  const handleCreatePlaylist = (formData?: PlaylistFormData) => {
    setPlaylistToEdit(undefined);
    setFormDialogOpen(true);
  };

  const handleEditPlaylist = (id: string) => {
    const playlist = playlists.find((p) => p.id === id);
    if (!playlist) return;

    setPlaylistToEdit({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || "",
      is_public: playlist.is_public,
    });
    setFormDialogOpen(true);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylistToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePlaylist = async () => {
    if (!playlistToDelete) return;

    try {
      // Delete playlist_tracks first
      const { error: tracksError } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", playlistToDelete);

      if (tracksError) throw tracksError;

      // Then delete the playlist
      const { error: playlistError } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistToDelete);

      if (playlistError) throw playlistError;

      setPlaylists(playlists.filter((p) => p.id !== playlistToDelete));
      toast.success("Playlist deleted successfully.");

      // Navigate back to playlists if we're on the deleted playlist page
      if (playlistId === playlistToDelete) {
        navigate("/app/playlists");
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist. Please try again later.");
    } finally {
      setDeleteDialogOpen(false);
      setPlaylistToDelete(null);
    }
  };

  const handleSavePlaylist = async (data: PlaylistFormData) => {
    try {
      if (data.id) {
        // Update existing playlist
        const { error } = await supabase
          .from("playlists")
          .update({
            name: data.name,
            description: data.description,
            is_public: data.is_public,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id);

        if (error) throw error;

        // Update local state
        setPlaylists(
          playlists.map((p) =>
            p.id === data.id
              ? {
                  ...p,
                  name: data.name,
                  description: data.description,
                  is_public: data.is_public,
                }
              : p,
          ),
        );

        // Update current playlist if we're viewing it
        if (currentPlaylist && currentPlaylist.id === data.id) {
          setCurrentPlaylist({
            ...currentPlaylist,
            name: data.name,
            description: data.description,
            is_public: data.is_public,
          });
        }

        toast.success("Playlist updated successfully.");
      } else {
        // Create new playlist
        const { data: newPlaylist, error } = await supabase
          .from("playlists")
          .insert({
            name: data.name,
            description: data.description,
            created_by: user?.id,
            is_public: data.is_public,
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setPlaylists([
          ...playlists,
          {
            ...newPlaylist,
            trackCount: 0,
            trackImages: [],
          },
        ]);

        toast.success("Playlist created successfully.");

        // Navigate to the new playlist
        navigate(`/app/playlists/${newPlaylist.id}`);
      }
    } catch (error) {
      console.error("Error saving playlist:", error);
      toast.error("Failed to save playlist. Please try again later.");
    }
    setFormDialogOpen(false);
  };

  const handlePlayPlaylist = (id: string) => {
    const playlist = [...playlists, ...publicPlaylists].find(
      (p) => p.id === id,
    );
    if (playlist) {
      navigate(`/app/playlists/${id}`);
    }
  };

  const handlePlayTrackFromCurrentPlaylist = (clickedTrack: Track) => {
    if (!currentPlaylist || currentPlaylist.tracks.length === 0) {
      toast.error("No tracks available in this playlist to play.");
      return;
    }

    const playlistTracks = currentPlaylist.tracks;
    const startIndex = playlistTracks.findIndex(
      (track) => track.id === clickedTrack.id,
    );

    if (startIndex !== -1) {
      startPlaybackSession(playlistTracks, startIndex);
    } else {
      console.warn(
        "Clicked track not found in currentPlaylist.tracks. Playing as single track.",
      );
      startPlaybackSession([clickedTrack], 0);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!currentPlaylist || currentPlaylist.created_by !== user?.id) return;

    try {
      const { error } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", currentPlaylist.id)
        .eq("track_id", trackId);

      if (error) throw error;

      // Update local state
      setCurrentPlaylist({
        ...currentPlaylist,
        tracks: currentPlaylist.tracks.filter((t) => t.id !== trackId),
      });

      // Update track count in playlists list
      setPlaylists(
        playlists.map((p) =>
          p.id === currentPlaylist.id
            ? { ...p, trackCount: p.trackCount - 1 }
            : p,
        ),
      );

      toast.success("Track removed from playlist.");
    } catch (error) {
      console.error("Error removing track:", error);
      toast.error("Failed to remove track. Please try again later.");
    }
  };

  const handleAddTracks = async (tracks: Track[]) => {
    if (
      !currentPlaylist ||
      tracks.length === 0 ||
      currentPlaylist.created_by !== user?.id
    )
      return;

    try {
      // Get current max position
      const { data: positionData, error: positionError } = await supabase
        .from("playlist_tracks")
        .select("position")
        .eq("playlist_id", currentPlaylist.id)
        .order("position", { ascending: false })
        .limit(1);

      if (positionError) throw positionError;

      const startPosition =
        positionData.length > 0 ? positionData[0].position + 1 : 0;

      // Prepare tracks to add
      const tracksToInsert = tracks.map((track, index) => ({
        playlist_id: currentPlaylist.id,
        track_id: track.id,
        position: startPosition + index,
      }));

      // Add tracks
      const { error } = await supabase
        .from("playlist_tracks")
        .insert(tracksToInsert);

      if (error) throw error;

      // Update local state
      setCurrentPlaylist({
        ...currentPlaylist,
        tracks: [...currentPlaylist.tracks, ...tracks],
      });

      // Update track count in playlists list
      setPlaylists(
        playlists.map((p) =>
          p.id === currentPlaylist.id
            ? { ...p, trackCount: p.trackCount + tracks.length }
            : p,
        ),
      );

      toast.success(`Added ${tracks.length} tracks to your playlist.`);
    } catch (error) {
      console.error("Error adding tracks:", error);
      toast.error("Failed to add tracks. Please try again later.");
    }
  };

  const handleTogglePublicStatus = async () => {
    if (!currentPlaylist || currentPlaylist.created_by !== user?.id) return;

    try {
      const newPublicStatus = !currentPlaylist.is_public;

      const { error } = await supabase
        .from("playlists")
        .update({ is_public: newPublicStatus })
        .eq("id", currentPlaylist.id);

      if (error) throw error;

      // Update local state
      setCurrentPlaylist({
        ...currentPlaylist,
        is_public: newPublicStatus,
      });

      // Update playlists list
      setPlaylists(
        playlists.map((p) =>
          p.id === currentPlaylist.id
            ? { ...p, is_public: newPublicStatus }
            : p,
        ),
      );

      toast.success(
        `Playlist is now ${newPublicStatus ? "public" : "private"}`,
      );
    } catch (error) {
      console.error("Error updating playlist visibility:", error);
      toast.error("Failed to update playlist visibility");
    }
  };

  const isOwner = currentPlaylist && currentPlaylist.created_by === user?.id;

  // Refined renderCoverArt function for the SINGLE PLAYLIST VIEW
  const renderCurrentPlaylistCoverArt = () => {
    if (!currentPlaylist) return null; // Guard clause

    const mainCover = currentPlaylist.cover_image;
    const playlistTrackImages = currentPlaylist.tracks
      .slice(0, 4) // Take up to 4 tracks
      .map((track) => track.albumArt)
      .filter(Boolean) as string[]; // Filter out undefined and assert as string[]

    // Common class for the placeholder icon if no image
    const placeholderIconClass = "w-1/2 h-1/2 opacity-30";

    if (mainCover) {
      return (
        <div className="relative w-full h-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700"
            style={{
              backgroundImage: `url(${mainCover})`,
              transform: hovered ? "scale(1.05)" : "scale(1)", // Add hover state if needed
            }}
            onMouseEnter={() => setHovered(true)} // Optional: add hover effect
            onMouseLeave={() => setHovered(false)}
          />
          <div
            className={`absolute inset-0 ${isDarkTheme ? "bg-gradient-to-t from-black/70 via-black/30 to-transparent" : "bg-gradient-to-t from-black/50 via-black/20 to-transparent"}`}
          ></div>
        </div>
      );
    } else if (playlistTrackImages.length > 0) {
      return (
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-cover bg-center w-full h-full overflow-hidden"
                style={{
                  backgroundImage: playlistTrackImages[index]
                    ? `url(${playlistTrackImages[index]})`
                    : undefined,
                  backgroundColor: !playlistTrackImages[index]
                    ? isDarkTheme
                      ? "#222"
                      : "#f0f0f0"
                    : undefined,
                  transform: hovered ? "scale(1.05)" : "scale(1)", // Optional hover
                  transition: "transform 700ms ease",
                }}
                onMouseEnter={() => setHovered(true)} // Optional
                onMouseLeave={() => setHovered(false)} // Optional
              >
                {!playlistTrackImages[index] && (
                  <div className="flex items-center justify-center h-full">
                    <Music className={placeholderIconClass} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            className={`absolute inset-0 ${isDarkTheme ? "bg-gradient-to-t from-black/70 via-black/30 to-transparent" : "bg-gradient-to-t from-black/50 via-black/20 to-transparent"}`}
          ></div>
        </div>
      );
    } else {
      // Fallback for the single playlist view
      return (
        <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
          <div
            className={`absolute inset-0 ${isDarkTheme ? `bg-[${themeColors.primary}]/5` : `bg-[${themeColors.primary}]/5`}`}
          ></div>
          <div
            className={`w-1/2 h-1/2 rounded-full flex items-center justify-center bg-[${themeColors.primary}]/10`}
          >
            <ListMusic // Or use Play icon as you had
              className={`w-3/5 h-3/5 text-[${themeColors.primary}]`}
            />
          </div>
          <div
            className={`absolute inset-0 ${isDarkTheme ? "bg-gradient-to-t from-black/70 via-black/30 to-transparent" : "bg-gradient-to-t from-black/50 via-black/20 to-transparent"}`}
          ></div>
        </div>
      );
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

  return (
    <AuthRequired featureName="Playlists">
      <motion.div
        className="space-y-6"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        {/* Dialogs */}
        <PlaylistFormDialog
          isOpen={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          onSave={handleSavePlaylist}
          initialData={playlistToEdit}
        />

        <DeletePlaylistDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeletePlaylist}
          onCancel={() => setDeleteDialogOpen(false)}
          playlistName={
            playlistToDelete
              ? playlists.find((p) => p.id === playlistToDelete)?.name
              : undefined
          }
        />

        {currentPlaylist && (
          <AddTracksDialog
            isOpen={addTracksDialogOpen}
            onClose={() => setAddTracksDialogOpen(false)}
            onAdd={handleAddTracks}
            availableTracks={getAvailableTracks()}
          />
        )}

        {/* Playlist Grid or Single Playlist View */}
        {!playlistId ? (
          <>
            <div className="flex justify-between items-center">
              <h1 className={`text-2xl font-bold ${titleColor()}`}>
                Playlists
              </h1>
            </div>

            <div className="items-start">
              <Tabs
                defaultValue="my-playlists"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="my-playlists">My Playlists</TabsTrigger>
                  <TabsTrigger value="public-playlists">
                    Public Playlists
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="my-playlists">
                  <PlaylistsGrid
                    playlists={playlists}
                    onCreateNew={handleCreatePlaylist}
                    onEdit={handleEditPlaylist}
                    onDelete={handleDeletePlaylist}
                    onPlay={handlePlayPlaylist}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="public-playlists">
                  <div className="w-full">
                    <PlaylistsGrid
                      playlists={publicPlaylists}
                      onPlay={handlePlayPlaylist}
                      isLoading={isLoading}
                      isPublicView={true}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <>
            {currentPlaylist && (
              <>
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate("/app/playlists")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Playlists
                  </Button>

                  <div className="flex items-center gap-2">
                    {isEditMode ? (
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsEditMode(false)}
                      >
                        <Save className="h-4 w-4" />
                        Done
                      </Button>
                    ) : (
                      <>
                        {isOwner && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setIsEditMode(true)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        )}

                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            if (currentPlaylist.tracks.length > 0) {
                              startPlaybackSession(currentPlaylist.tracks, 0);
                            }
                          }}
                          disabled={currentPlaylist.tracks.length === 0}
                        >
                          <Play className="h-4 w-4" />
                          Play
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className={cn(
                      "rounded-lg border overflow-hidden flex flex-col",
                      isDarkTheme
                        ? "border-white/10 bg-black/40"
                        : "border-gray-200 bg-white/80",
                    )}
                  >
                    <div
                      className={cn(
                        "aspect-square flex items-center justify-center bg-gradient-to-br from-primary/20 to-black/20 relative",
                        isDarkTheme ? "bg-black/60" : "bg-gray-100",
                      )}
                    >
                      {/* Public/Private indicator */}
                      <div
                        className={cn(
                          "absolute top-2 right-2 p-1 rounded-full",
                          currentPlaylist.is_public
                            ? "bg-green-500/20"
                            : "bg-gray-500/20",
                        )}
                      >
                        {currentPlaylist.is_public ? (
                          <Globe className="w-5 h-5 text-green-400" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Cover Art Section */}
                      {renderCurrentPlaylistCoverArt()}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h1 className="text-2xl font-bold mb-1">
                        {currentPlaylist.name}
                      </h1>
                      <p
                        className={cn(
                          "text-sm mb-auto",
                          isDarkTheme ? "text-gray-300" : "text-gray-600",
                        )}
                      >
                        {currentPlaylist.description}
                      </p>

                      <div className="mt-4 flex flex-col gap-2">
                        <div className="text-sm">
                          {currentPlaylist.tracks.length} tracks
                        </div>

                        {isOwner && (
                          <div
                            className={cn(
                              "flex items-center gap-2 py-2",
                              isDarkTheme
                                ? "border-t border-white/10"
                                : "border-t border-gray-200",
                            )}
                          >
                            <Switch
                              id="playlist-visibility"
                              checked={currentPlaylist.is_public}
                              onCheckedChange={handleTogglePublicStatus}
                              disabled={!isOwner}
                            />
                            <Label htmlFor="playlist-visibility">
                              {currentPlaylist.is_public
                                ? "Public playlist"
                                : "Private playlist"}
                            </Label>
                          </div>
                        )}

                        {isEditMode && isOwner && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() =>
                                handleEditPlaylist(currentPlaylist.id)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() =>
                                handleDeletePlaylist(currentPlaylist.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Playlist
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <PlaylistTracks
                      tracks={currentPlaylist.tracks}
                      onPlay={handlePlayTrackFromCurrentPlaylist}
                      onRemove={handleRemoveTrack}
                      onAddTracks={() => setAddTracksDialogOpen(true)}
                      isEditing={isEditMode}
                      isOwner={isOwner}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </AuthRequired>
  );
};

export default Playlists;
