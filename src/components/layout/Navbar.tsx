import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Menu, X, Music } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * Navbar component for landing pages
 * 
 * Provides navigation links and theme toggle
 */
const Navbar: React.FC = () => {
  const location = useLocation();
  const { isDarkTheme, themeColors, theme } = useTheme();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current route is active
  const isActive = (path: string) => location.pathname === path;

  // Listen for scroll events to add background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get logo color based on theme
  const getLogoColor = () => {
    switch (theme) {
      case 'cyberpunk':
        return '#66c8ff'; // Electric blue for Cyberpunk theme
      case 'midnight-ash':
        return '#33C3F0';
      case 'obsidian-veil':
        return '#7E69AB';
      case 'noir-eclipse':
        return '#9F9EA1';
      case 'shadow-ember':
        return '#ea384d';
      case 'light':
      case 'morning-haze':
      case 'ivory-bloom':
      case 'sunlit-linen':
      case 'cloudpetal':
        return themeColors.primary;
      default:
        return isDarkTheme ? themeColors.primary : '#333';
    }
  };

  const getButtonStyles = () => {
    return {
      background: isDarkTheme ? themeColors.primary : themeColors.primary,
      color: '#fff',
    };
  };

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDarkTheme
            ? 'bg-black/60 backdrop-blur-xl shadow-lg border-b border-white/10'
            : 'bg-white/70 backdrop-blur-xl shadow-lg'
          : ''
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div 
              className="h-8 w-8 rounded-md flex items-center justify-center mr-2"
              style={{ backgroundColor: getLogoColor() }}
            >
              <Music className="h-5 w-5" style={{ color: isDarkTheme ? 'black' : 'white' }} />
            </div>
            <span className="text-xl md:text-2xl font-bold" style={{ color: getLogoColor() }}>Synapse</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`hover:text-primary transition-colors ${isActive('/') ? 'text-primary font-medium' : isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className={`hover:text-primary transition-colors ${isActive('/pricing') ? 'text-primary font-medium' : isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Pricing
            </Link>
            <a 
              href="/#features" 
              className={`hover:text-primary transition-colors ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Features
            </a>
            <a 
              href="/#how-it-works" 
              className={`hover:text-primary transition-colors ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
            >
              How It Works
            </a>
            <div className="ml-4 flex items-center space-x-2">
              <ThemeToggle />
              <Link to={user ? "/app/dashboard" : "/auth"} className="flex items-center gap-2">
                {user && (
                  <Avatar className="h-7 w-7 border" style={{ borderColor: themeColors.primary }}>
                    <AvatarImage src={user?.avatar_url} alt={user?.user_metadata?.name || user?.email} />
                    <AvatarFallback className="bg-primary/20 text-xs">
                      {getInitials(user?.user_metadata?.name || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Button 
                  variant={isDarkTheme ? "default" : "default"} 
                  style={getButtonStyles()}
                >
                  {user ? "Go to App" : "Login"}
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md ${
                isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-black/5'
              } transition-colors`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={`${
          isDarkTheme 
            ? 'bg-black/95 backdrop-blur-xl border-b border-white/10' 
            : 'bg-white/95 backdrop-blur-xl border-b border-gray-200'
        }`}>
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              to="/"
              className={`block py-2 hover:text-primary transition-colors ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className={`block py-2 hover:text-primary transition-colors ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <a
              href="/#features"
              className={`block py-2 hover:text-primary transition-colors ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              className={`block py-2 hover:text-primary transition-colors ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <Link
              to={user ? "/app/dashboard" : "/auth"}
              className="block py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                {user && (
                  <Avatar className="h-7 w-7 border" style={{ borderColor: themeColors.primary }}>
                    <AvatarImage src={user?.avatar_url} alt={user?.user_metadata?.name || user?.email} />
                    <AvatarFallback className="bg-primary/20 text-xs">
                      {getInitials(user?.user_metadata?.name || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Button 
                  className="w-full"
                  style={getButtonStyles()}
                >
                  {user ? "Go to App" : "Login"}
                </Button>
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
