
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext";

/**
 * Skeleton - Component for loading state placeholders
 *
 * Creates animated placeholders for content that is loading,
 * with theme-aware styling based on the current theme.
 *
 * @param className - Additional CSS classes to apply
 * @param props
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { theme, isDarkTheme } = useTheme();
  
  // Get the skeleton animation color based on theme
  const getSkeletonGradientStyle = () => {
    switch (theme) {
      case 'cyberpunk':
        return 'from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30';
      case 'midnight-ash':
        return 'from-[#0A1D24]/70 via-[#071318]/50 to-[#0A1D24]/60 border border-[#33C3F0]/25';
      case 'obsidian-veil':
        return 'from-[#221830]/70 via-[#160F20]/50 to-[#221830]/60 border border-[#7E69AB]/25';
      case 'noir-eclipse':
        return 'from-black/70 via-[#080808]/60 to-black/65 border border-[#9F9EA1]/20';
      case 'shadow-ember':
        return 'from-[#3B0E13]/70 via-[#1F070A]/50 to-[#3B0E13]/60 border border-[#ea384d]/25';
      case 'light':
        return 'from-white/90 via-gray-50/70 to-gray-100/80 border border-gray-300/70';
      case 'morning-haze':
        return 'from-white/90 via-[#F0F7FF]/70 to-[#EBF4FF]/80 border border-[#C0D7F5]/60';
      case 'ivory-bloom':
        return 'from-white/90 via-[#FFF5F7]/70 to-[#FFF0F2]/80 border border-[#FECDD2]/60';
      case 'sunlit-linen':
        return 'from-white/90 via-[#FEFCF0]/70 to-[#FFFBEF]/80 border border-[#E7B448]/70';
      case 'cloudpetal':
        return 'from-white/90 via-[#FFF5F7]/60 to-[#F0F7FF]/70 border border-[#FECDD2]/60';
      default:
        return isDarkTheme
            ? 'from-[#00112A]/70 via-black/50 to-[#00081A]/60 border border-[#0066FF]/30' // Cyberpunk default
            : 'from-white/90 via-gray-50/70 to-gray-100/80 border border-gray-300/70'; // Light default
    }
  };

  return (
    <div
      className={cn(
        " bg-gradient-to-r animate-pulse rounded-md bg-muted/25",
          getSkeletonGradientStyle(),
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
