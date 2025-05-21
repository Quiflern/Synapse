import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Disc3,
  LayoutDashboard,
  ListMusic,
  ListOrdered,
  LogOut,
  Music,
  Music4,
  Settings as SettingsIcon,
  User
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Sidebar - A responsive sidebar navigation with collapsible functionality
 *
 * @returns {JSX.Element} The rendered sidebar component
 */
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  const { isDarkTheme, themeColors, getThemeGradient } = useTheme();
  const isMobile = useIsMobile();

  // Auto collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/"); // Redirect to the landing page on sign-out
  };

  // Get the theme-specific logo text color
  const getLogoTextColor = () => {
    return themeColors.primary;
  };

  // Get the theme-specific logo background color
  const getLogoBackgroundColor = () => {
    return themeColors.primary;
  };

  const navItems = [
    { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/app/memories", label: "Memories", icon: Archive },
    { path: "/app/library", label: "Library", icon: Music4 },
    { path: "/app/queue", label: "Play Queue", icon: ListOrdered },
    { path: "/app/playlists", label: "Playlists", icon: ListMusic },
    { path: "/app/now-playing", label: "Now Playing", icon: Disc3 },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // User profile card with theme-aware hover effects
  const UserProfileCard = () => {
    if (!user) {
      // User is NOT logged in
      if (isCollapsed) {
        // Sidebar is COLLAPSED
        return (
          <Link to="/auth" className="w-full block" aria-label="Login">
            <div // Outer container for collapsed "Login" icon
              className={cn(
                "rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer",
                "p-0.5 h-8 w-8", // 32x32px container, 2px padding for inner element
                isDarkTheme // Theme-specific background and border for this container
                  ? "bg-white/5 hover:bg-white/10 border border-white/10"
                  : "bg-black/5 hover:bg-black/10 border border-black/10",
              )}
            >
              <div // Inner circular element for the User icon
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center", // 24x24px
                )}
                style={{ borderColor: themeColors.primary }}
              >
                <User size={14} /> {/* Smaller icon for 24x24 container */}
              </div>
            </div>
          </Link>
        );
      } else {
        // Sidebar is EXPANDED
        return (
          <Link to="/auth" className="w-full" aria-label="Login">
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 transition-colors rounded-lg px-3 py-2",
                isDarkTheme
                  ? "bg-white/5 hover:bg-white/10 text-white"
                  : "bg-black/5 hover:bg-black/10 text-gray-800",
              )}
            >
              <User size={16} />
              <span>Login</span>
            </Button>
          </Link>
        );
      }
    }

    // User IS logged in (this is the "else" part of `if (!user)`)
    const displayName = profile?.username || profile?.full_name || user?.email;
    const email = user?.email;

    return (
      <div // Main container for logged-in user
        onClick={() => navigate("/app/profile")}
        className={cn(
          "rounded-lg transition-all duration-200 flex items-center cursor-pointer",
          // Conditional styling for collapsed vs. expanded
          isCollapsed
            ? "justify-center p-0.5 h-8 w-8" // Collapsed: 32x32px container, 2 px padding
            : "p-2 gap-2", // Expanded: standard padding and gap
          // Theme-specific background and border for this container
          isDarkTheme
            ? "bg-white/5 hover:bg-white/10 border border-white/10"
            : "bg-black/5 hover:bg-black/10 border border-black/10",
        )}
      >
        <Avatar
          className={cn(
            // Conditional size for Avatar
            isCollapsed ? "h-6 w-6" : "h-8 w-8", // Collapsed: 24x24px, Expanded: 32x32px
            "border-2",
          )}
          style={{ borderColor: themeColors.primary }}
        >
          <AvatarImage src={profile?.avatar_url} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-xs">
            {" "}
            {/* Smaller text for smaller avatar */}
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>

        {!isCollapsed && ( // User's name/email, only shown when expanded
          <div className="flex-1 min-w-0">
            <p className="text-left text-sm font-medium truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-left text-xs text-gray-400 truncate">
                {email}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col transition-all duration-300 ease-in-out relative",
        getThemeGradient("sidebar"),
        isCollapsed
          ? "w-16"
          : { "w-64": !isMobile, "w-full md:w-64": isMobile },
      )}
      style={{
        minWidth: isCollapsed ? "4rem" : undefined,
        position: isMobile && !isCollapsed ? "fixed" : undefined,
        zIndex: isMobile && !isCollapsed ? "50" : undefined,
      }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <Link to="/">
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center w-full" : "justify-start",
            )}
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center`}
              style={{ backgroundColor: getLogoBackgroundColor() }}
            >
              <Music className="h-5 w-5 text-black" />
            </div>
            {!isCollapsed && (
              <span
                className={`ml-2 text-lg font-bold font-orbitron`}
                style={{ color: getLogoTextColor() }}
              >
                Synapse
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Toggle button positioned lower down */}
      <div className="absolute top-12 right-0 transform translate-x-1/2">
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-1.5 rounded-full transition-all duration-300 ease-in-out",
            "text-primary hover:bg-primary/10",
            isDarkTheme
              ? "bg-black/30 border border-white/20 shadow-md"
              : "bg-white border border-gray-200 shadow-md",
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User profile and action buttons */}
      <div className="px-4 py-2 mt-2">
        <UserProfileCard />

        {!isCollapsed && user && (
          <div className="flex items-center justify-end gap-1 mt-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-colors",
                isDarkTheme
                  ? "text-gray-300 hover:bg-white/10"
                  : "text-gray-700 hover:bg-black/5",
              )}
              onClick={() => navigate("/app/settings")}
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-colors",
                isDarkTheme
                  ? "text-gray-300 hover:bg-white/10"
                  : "text-gray-700 hover:bg-black/5",
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}

        <Separator className="my-2 opacity-30" />
      </div>

      {/* Navigation Items */}
      <div className="flex-grow overflow-y-auto scrollbar-thin mt-2">
        <div className="px-4 pb-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + "/");

              // Render with tooltip when collapsed
              return (
                <li key={item.path}>
                  {isCollapsed ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center rounded-lg transition-colors",
                              "justify-center px-2 py-2",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : isDarkTheme
                                  ? "text-gray-400 hover:text-foreground hover:bg-white/5"
                                  : "text-gray-500 hover:text-foreground hover:bg-black/5",
                            )}
                            onClick={() => isMobile && setIsCollapsed(true)}
                          >
                            <item.icon className="flex-shrink-0" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="z-50">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center rounded-lg transition-colors",
                        "px-3 py-2",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : isDarkTheme
                            ? "text-gray-400 hover:text-foreground hover:bg-white/5"
                            : "text-gray-500 hover:text-foreground hover:bg-black/5",
                      )}
                      onClick={() => isMobile && setIsCollapsed(true)}
                    >
                      <item.icon className="mr-3" />
                      <span className="text-sm md:text-base">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is expanded */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Sidebar;
