import React from "react";
import { cn } from "@/lib/utils";

interface AlbumArtFallbackProps {
  title: string;
  artist: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * AlbumArtFallback - Displays a fallback UI when no album art is available
 *
 * @param {string} title - Track title
 * @param {string} artist - Artist name
 * @param {string} size - Size of the fallback (sm, md, lg)
 * @param {string} className - Additional CSS classes
 * @returns {JSX.Element}
 */
export const AlbumArtFallback: React.FC<AlbumArtFallbackProps> = ({
  title,
  artist,
  size = "md",
  className,
}) => {
  // Get the first letter of title and artist
  const titleChar = title.charAt(0).toUpperCase();
  const artistChar = artist.charAt(0).toUpperCase();

  // Choose a background color based on the title's first character code
  const getBgColor = () => {
    const colors = [
      "from-blue-500 to-purple-500",
      "from-green-500 to-teal-500",
      "from-purple-500 to-pink-500",
      "from-red-500 to-orange-500",
      "from-orange-500 to-yellow-500",
      "from-pink-500 to-rose-500",
      "from-violet-500 to-purple-500",
      "from-indigo-500 to-blue-500",
      "from-cyan-500 to-blue-500",
      "from-yellow-500 to-amber-500",
    ];

    const index = title.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Determine font size based on component size
  const fontSize = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col items-center justify-center",
        "bg-gradient-to-br",
        getBgColor(),
        className,
      )}
    >
      <div className={cn("font-bold text-white", fontSize[size])}>
        {titleChar}
        {artistChar}
      </div>
    </div>
  );
};
