import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLibrary } from "@/context/LibraryContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Edit2, LogOut, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Profile - User profile page
 *
 * This page displays the user's profile information and statistics.
 */
const Profile: React.FC = () => {
  const { user, signOut, profile, updateProfile } = useAuth();
  const { isDarkTheme, themeColors } = useTheme();
  const { getTopArtists, getRecentlyPlayed } = useLibrary();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    website: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: user?.user_metadata?.username || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        website: profile.website || "",
      });
    } else if (user) {
      setFormData({
        full_name: user.user_metadata?.name || "",
        username: user.user_metadata?.username || "",
        bio: "",
        avatar_url: user.user_metadata?.avatar_url || "",
        website: "",
      });
    }
  }, [profile, user]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio,
        website: formData.website,
        avatar_url: formData.avatar_url,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Get music data
  const topArtists = getTopArtists(5);
  const recentTracks = getRecentlyPlayed(5);
  const favoriteGenres = ["Electronic", "Rock", "Indie", "Hip Hop", "Jazz"];
  const totalPlaytime = "42h 30m";
  const totalTracks = recentTracks.length;

  // Get a cover image for the profile stats display
  const showcaseCoverImage = recentTracks[0]?.albumArt || "/placeholder.svg";

  return (
    <motion.div
      className="space-y-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2",
            isDarkTheme
              ? "text-gray-300 hover:bg-white/10 border-white/20"
              : "text-gray-700 hover:bg-black/5 border-black/10",
          )}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card
          className={cn(
            "col-span-1",
            isDarkTheme
              ? "bg-black/40 border-white/10"
              : "bg-white/80 border-gray-200",
          )}
        >
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Your Profile</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Edit2 className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar
              className="h-24 w-24 border-2 mb-2"
              style={{ borderColor: themeColors.primary }}
            >
              <AvatarImage src={formData.avatar_url || undefined} />
              <AvatarFallback className="text-xl bg-primary/20">
                {getInitials(formData.full_name || user?.email)}
              </AvatarFallback>
            </Avatar>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Avatar URL
                  </label>
                  <Input
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    className={cn(isDarkTheme ? "bg-black/40" : "bg-white")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Full Name
                  </label>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className={cn(isDarkTheme ? "bg-black/40" : "bg-white")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Username
                  </label>
                  <Input
                    name="username"
                    value={formData.username}
                    disabled
                    placeholder="Username"
                    className={cn(isDarkTheme ? "bg-black/40" : "bg-white")}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Username cannot be changed after registration
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Website
                  </label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className={cn(isDarkTheme ? "bg-black/40" : "bg-white")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Bio</label>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="A few words about yourself..."
                    className={cn(isDarkTheme ? "bg-black/40" : "bg-white")}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            ) : (
              <div className="text-center w-full">
                <h3 className="text-lg font-bold">
                  {formData.full_name || "User"}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  @{formData.username || user?.email?.split("@")[0] || "user"}
                </p>
                <p className="text-sm">{formData.bio || "No bio yet."}</p>
                {formData.website && (
                  <a
                    href={formData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs mt-2 text-primary hover:underline block"
                  >
                    {formData.website.replace(/(^\w+:|^)\/\//, "")}
                  </a>
                )}
                <p className="text-xs mt-2 text-gray-500">{user?.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card
          className={cn(
            "col-span-1 md:col-span-2",
            isDarkTheme
              ? "bg-black/40 border-white/10"
              : "bg-white/80 border-gray-200",
          )}
        >
          <CardHeader>
            <CardTitle>Your Music Stats</CardTitle>
            <CardDescription>
              Insights about your music preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Album Cover Display */}
              <div className="md:col-span-1">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                  <img
                    src={showcaseCoverImage}
                    alt="Music Cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>

              {/* Top Artists */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium mb-2">Top Artists</h3>
                <div className="grid grid-cols-1 gap-2">
                  {topArtists.map((artist, index) => (
                    <div
                      key={artist.name}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md",
                        isDarkTheme ? "bg-white/5" : "bg-black/5",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{artist.name}</span>
                      </div>
                      <span>{artist.plays} plays</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {favoriteGenres.map((genre) => (
                    <span
                      key={genre}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isDarkTheme
                          ? "bg-primary/20 text-primary-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Listening Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Playtime:</span>
                    <span className="font-medium">{totalPlaytime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Library Size:</span>
                    <span className="font-medium">{totalTracks} tracks</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Profile;
