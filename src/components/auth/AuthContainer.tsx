import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

/**
 * Container for authentication content with glass morphism styling
 * 
 * @param children Content to be displayed inside the container
 */
interface AuthContainerProps {
  children: ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  const { isDarkTheme } = useTheme();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`relative z-10 w-full max-w-md p-8 rounded-2xl shadow-xl ${
        isDarkTheme 
          ? 'bg-black/30 backdrop-blur-xl border border-white/10' 
          : 'bg-white/80 backdrop-blur-xl border border-gray-200'
      }`}
    >
      {children}
    </motion.div>
  );
};

export default AuthContainer;
