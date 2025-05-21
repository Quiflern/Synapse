
import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

/**
 * ThemedToaster - Toast provider that adapts to the current theme
 * 
 * Wraps the Sonner Toaster component with theme-aware styling.
 */
export function ThemedToaster() {
  const { isDarkTheme, themeColors, theme } = useTheme();

  const getToastThemeClasses = () => {
    return {
      background: isDarkTheme ? 'hsl(0 0% 15%)' : 'hsl(0 0% 100%)',
      color: isDarkTheme ? 'hsl(0 0% 97%)' : 'hsl(0 0% 9%)',
      border: `1px solid ${isDarkTheme ? 'hsl(0 0% 22%)' : 'hsl(0 0% 92%)'}`,
      borderRadius: '0.5rem',
      boxShadow: `0 4px 12px ${isDarkTheme ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'}`,
    };
  };

  const getToastAccentColor = () => {
    switch (theme) {
      case 'cyberpunk':
        return { success: '#6affff', error: '#ff6fa9', info: '#6affff' };
      case 'midnight-ash':
        return { success: '#33C3F0', error: '#FF4757', info: '#33C3F0' };
      case 'obsidian-veil':
        return { success: '#7E69AB', error: '#D946EF', info: '#7E69AB' };
      case 'shadow-ember':
        return { success: '#ea384d', error: '#FF4757', info: '#ea384d' };
      case 'noir-eclipse':
        return { success: '#9F9EA1', error: '#FF4757', info: '#9F9EA1' };
      default:
        return { 
          success: isDarkTheme ? '#25D366' : '#10b981', 
          error: isDarkTheme ? '#f43f5e' : '#ef4444',
          info: isDarkTheme ? '#3b82f6' : '#3b82f6'
        };
    }
  };

  const accentColors = getToastAccentColor();

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: getToastThemeClasses(),
        duration: 3000,
        className: "toast-rounded",
        // The Sonner library doesn't support success, error, info properties directly in toastOptions
        // We'll just apply a common style and let Sonner handle the different toast types with its default styling
      }}
    />
  );
}
