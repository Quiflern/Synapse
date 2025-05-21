
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

/**
 * CustomModal - A themed modal dialog component
 * 
 * @param isOpen - Controls visibility of modal
 * @param onClose - Function to call when closing modal
 * @param title - Modal title displayed in header
 * @param children - Content to render inside modal
 * @param className - Optional additional CSS classes
 * @param showCloseButton - Controls visibility of close button
 */
export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { isDarkTheme, themeColors, getThemeGradient } = useTheme();

  const headerBorderClass = isDarkTheme ? 'border-white/10' : 'border-gray-200';

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('mousedown', handleClickOutside);

    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={`${isDarkTheme ? 'bg-black/70' : 'bg-black/30'} backdrop-blur-sm absolute inset-0 transition-opacity`} />
      <div 
        ref={modalRef} 
        className={cn(
          getThemeGradient('modal'),
          "rounded-xl shadow-xl z-50 max-h-[95vh] overflow-y-auto w-[95%] md:w-[90%] lg:max-w-6xl",
          "transform transition-all animate-in fade-in-90 slide-in-from-bottom-10 duration-300",
          className
        )}
      >
        <div className={`flex items-center justify-between p-4 border-b ${headerBorderClass}`}>
          <h2 className="text-xl font-bold">{title}</h2>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className={`rounded-full p-2 ${isDarkTheme ? 'text-gray-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
