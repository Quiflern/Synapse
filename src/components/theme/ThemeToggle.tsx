import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Palette } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ThemeToggle - A dropdown component for switching between different themes
 *
 * This component provides a compact way to switch themes from the navbar or any other
 * compact UI area.
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
    const { isDarkTheme, themeColors } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Get theme-specific background style for popover
    const getPopoverStyle = () => {
        // For dark themes, use a semi-transparent version of the primary color
        if (isDarkTheme) {
            return {
                background: `linear-gradient(to bottom, ${themeColors.primary}15, rgba(0,0,0,0.85))`,
                borderColor: `${themeColors.primary}30`,
                boxShadow: `0 4px 20px ${themeColors.primary}20`
            };
        }
        // For light themes, use a very light version of the primary color
        return {
            background: `linear-gradient(to bottom, ${themeColors.primary}10, rgba(255,255,255,0.95))`,
            borderColor: `${themeColors.primary}30`,
            boxShadow: `0 4px 15px ${themeColors.primary}15`
        };
    };

    // Sequential animation variants for the container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.05 // Controls the delay between each child animation
            }
        },
        exit: {
            opacity: 0,
            transition: {
                when: "afterChildren",
                staggerChildren: 0.03,
                staggerDirection: -1 // Animate in reverse order when exiting
            }
        }
    };

    return (
        <Popover onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "transition-colors",
                        isDarkTheme
                            ? "text-gray-300 hover:bg-white/10"
                            : "text-gray-700 hover:bg-black/5",
                        className
                    )}
                    aria-label="Change theme"
                >
                    <Palette className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <AnimatePresence>
                {isOpen && (
                    <PopoverContent
                        align="end"
                        forceMount
                        className={cn(
                            "w-56 p-3 overflow-hidden",
                            "border backdrop-blur-xl",
                            "translate-x-4" // Move slightly to the right
                        )}
                        style={getPopoverStyle()}
                        asChild
                    >
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={containerVariants}
                        >
                            <ThemeSwitcher compact />
                        </motion.div>
                    </PopoverContent>
                )}
            </AnimatePresence>
        </Popover>
    );
};