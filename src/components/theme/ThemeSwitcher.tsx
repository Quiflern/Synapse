import React from 'react';
import { useTheme, ThemeType } from '@/context/ThemeContext';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';

/**
 * Interface for the ThemeSwitcher component props
 *
 * @param showCustomizer - Whether to show the customizer section
 * @param onToggleCustomizer - Callback to toggle customizer visibility
 * @param compact - Whether to use a compact layout
 */
interface ThemeSwitcherProps {
  showCustomizer?: boolean;
  onToggleCustomizer?: () => void;
  compact?: boolean;
}

/**
 * ThemeSwitcher - A component for switching between different themes
 *
 * This component allows users to select from a variety of pre-defined themes
 * and customize their own theme.
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
                                                              showCustomizer = false,
                                                              onToggleCustomizer,
                                                              compact = false
                                                            }) => {
  const { theme, setTheme, customTheme, setCustomTheme, isDarkTheme, themeColors } = useTheme();
  const [activeColor, setActiveColor] = React.useState<'primary' | 'secondary' | 'accent'>('primary');

  // Animation variants for sequential appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05 // Slightly faster stagger for smoother sequence
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1 // Items disappear in reverse order
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.1
      }
    }
  };

  // Get customizer style based on the current theme
  const getCustomizerStyle = () => {
    if (isDarkTheme) {
      return {
        background: `linear-gradient(to bottom, ${themeColors.primary}15, rgba(0,0,0,0.85))`,
        borderColor: `${themeColors.primary}30`,
        boxShadow: `0 4px 20px ${themeColors.primary}20`
      };
    }
    return {
      background: `linear-gradient(to bottom, ${themeColors.primary}10, rgba(255,255,255,0.95))`,
      borderColor: `${themeColors.primary}30`,
      boxShadow: `0 4px 15px ${themeColors.primary}15`
    };
  };

  // Define all available themes with distinct colors
  const darkThemes: { id: ThemeType; name: string; color: string }[] = [
    { id: 'cyberpunk', name: 'Default', color: '#66c8ff' },
    { id: 'midnight-ash', name: 'Midnight', color: '#33C3F0' },
    { id: 'obsidian-veil', name: 'Obsidian', color: '#7E69AB' },
    { id: 'noir-eclipse', name: 'Noir', color: '#9F9EA1' },
    { id: 'shadow-ember', name: 'Ember', color: '#ea384d' },
  ];

  const lightThemes: { id: ThemeType; name: string; color: string }[] = [
    { id: 'light', name: 'Light', color: '#ffffff' },
    { id: 'morning-haze', name: 'Morning', color: '#D3E4FD' },
    { id: 'ivory-bloom', name: 'Ivory', color: '#FFDEE2' },
    { id: 'sunlit-linen', name: 'Sunlit', color: '#FEF7CD' },
    { id: 'cloudpetal', name: 'Cloud', color: '#FFDEE2' },
  ];

  // Only show the "Custom" theme option in settings, not in the navbar
  const themes = [...darkThemes, ...lightThemes];
  if (!compact && theme === 'custom') {
    themes.push({ id: 'custom', name: 'Custom', color: customTheme.primary });
  }

  const renderThemes = (themes: { id: ThemeType; name: string; color: string }[]) => {
    // Make sure we have a grid with 3x3 layout (9 items max per group)
    return (
        <div className="grid grid-cols-3 gap-2">
          {themes.map((themeItem) => {
            const isActive = themeItem.id === theme;

            return (
                <motion.div
                    key={themeItem.id}
                    variants={itemVariants}
                    className={cn(
                        'relative cursor-pointer rounded-lg transition-all duration-300',
                        isActive ? 'ring-2 ring-primary/70' : 'ring-1 ring-white/10',
                        'p-2 text-center',
                        isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-black/5'
                    )}
                    onClick={() => setTheme(themeItem.id)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                        className="h-6 w-6 rounded-full mx-auto"
                        style={{
                          backgroundColor: themeItem.color,
                          border: themeItem.id === 'light' ? '1px solid #ddd' : 'none'
                        }}
                    />
                    <span className="text-xs font-medium">
                  {themeItem.name}
                </span>
                    {isActive && (
                        <div className="absolute top-1 right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                          <Check size={8} className="text-primary-foreground" />
                        </div>
                    )}
                  </div>
                </motion.div>
            );
          })}
        </div>
    );
  };

  return (
      <div className="w-full">
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="space-y-3"
        >
          {!compact && (
              <motion.div variants={itemVariants}>
                <h3 className="text-lg font-medium mb-2">Appearance</h3>
              </motion.div>
          )}

          <motion.div variants={itemVariants}>
            {renderThemes(themes)}
          </motion.div>

          {!compact && showCustomizer && (
              <motion.div
                  variants={itemVariants}
                  className={cn(
                      "rounded-xl border p-4 mt-3"
                  )}
                  style={getCustomizerStyle()}
              >
                <h4 className="text-base font-medium mb-4">Custom Theme Colors</h4>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                      onClick={() => setActiveColor('primary')}
                      className={cn(
                          "p-2 rounded-lg transition-all text-sm",
                          activeColor === 'primary'
                              ? "bg-primary text-primary-foreground"
                              : isDarkTheme
                                  ? "bg-black/40 text-white hover:bg-white/10"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                  >
                    Primary
                  </button>
                  <button
                      onClick={() => setActiveColor('secondary')}
                      className={cn(
                          "p-2 rounded-lg transition-all text-sm",
                          activeColor === 'secondary'
                              ? "bg-secondary text-secondary-foreground"
                              : isDarkTheme
                                  ? "bg-black/40 text-white hover:bg-white/10"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                  >
                    Secondary
                  </button>
                  <button
                      onClick={() => setActiveColor('accent')}
                      className={cn(
                          "p-2 rounded-lg transition-all text-sm",
                          activeColor === 'accent'
                              ? "bg-accent text-accent-foreground"
                              : isDarkTheme
                                  ? "bg-black/40 text-white hover:bg-white/10"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      )}
                  >
                    Accent
                  </button>
                </div>

                <div className="mb-4 border border-white/10 rounded-lg overflow-hidden">
                  <HexColorPicker
                      color={customTheme[activeColor]}
                      onChange={(color) => {
                        setCustomTheme({
                          ...customTheme,
                          [activeColor]: color
                        });
                      }}
                  />
                </div>

                <div>
                  <label className={cn(
                      "block text-sm font-medium mb-2",
                      isDarkTheme ? "text-gray-300" : "text-gray-700"
                  )}>
                    Hex Color
                  </label>
                  <input
                      value={customTheme[activeColor]}
                      onChange={(e) => {
                        setCustomTheme({
                          ...customTheme,
                          [activeColor]: e.target.value
                        });
                      }}
                      className={cn(
                          "w-full p-2 rounded-lg outline-none transition-all duration-300",
                          isDarkTheme
                              ? "bg-black/60 border border-white/20 text-white focus:ring-2 focus:ring-primary/50"
                              : "bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-primary/50"
                      )}
                  />
                </div>
              </motion.div>
          )}

          {!compact && !showCustomizer && (
              <motion.div variants={itemVariants}>
                <button
                    className={cn(
                        "w-full flex items-center justify-center gap-2 p-2 rounded-lg transition-all duration-300 mt-3",
                        isDarkTheme
                            ? "bg-white/10 hover:bg-white/20 text-white"
                            : "bg-black/5 hover:bg-black/10 text-black"
                    )}
                    onClick={onToggleCustomizer}
                >
                  <Palette size={16} />
                  Customize Colors
                </button>
              </motion.div>
          )}
        </motion.div>
      </div>
  );
};