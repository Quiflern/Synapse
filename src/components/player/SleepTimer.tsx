import React, { useState } from "react";
import { Clock, Moon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSleepTimer } from "@/context/SleepTimerContext";
import { motion } from "framer-motion";

/**
 * SleepTimer - Component for setting and displaying sleep timer
 * 
 * Allows users to set a timer to automatically stop music playback
 * after a specified duration, with optional fade out.
 */
export const SleepTimer: React.FC = () => {
  // Correcting property names to match the SleepTimerContext type
  const { enabled, minutes, timeLeft, setEnabled, setMinutes, startTimer, stopTimer } = useSleepTimer();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(15); // Default 15 minutes
  const [enableFadeOut, setEnableFadeOut] = useState(true);
  
  // Format the remaining time correctly
  const formatRemainingTime = () => {
    if (timeLeft === null) return "0:00";
    const mins = Math.floor(timeLeft / 60);
    const secs = Math.floor(timeLeft % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleStartTimer = () => {
    setMinutes(selectedDuration);
    setEnabled(true);
    startTimer();
    setIsOpen(false);
  };
  
  const handleCancelTimer = () => {
    stopTimer();
    setEnabled(false);
  };
  
  // Predefined timer durations in minutes
  const timerOptions = [5, 15, 30, 45, 60];
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        title="Sleep Timer"
        className={enabled ? "text-neon hover:text-neon/90" : "text-gray-400 hover:text-white"}
        onClick={() => setIsOpen(true)}
      >
        <Clock size={18} />
      </Button>
      
      {/* Sleep timer active indicator */}
      {enabled && timeLeft !== null && (
        <motion.div 
          className="absolute -top-1 -right-1 flex items-center justify-center rounded bg-neon text-black text-xs px-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          {formatRemainingTime()}
        </motion.div>
      )}
      
      {/* Sleep Timer Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Moon className="mr-2 h-5 w-5" />
              Sleep Timer
            </DialogTitle>
          </DialogHeader>
          
          {enabled ? (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{formatRemainingTime()}</div>
                <p className="text-sm text-gray-400">
                  Music will {enableFadeOut ? "fade out and " : ""}stop playing after this time
                </p>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleCancelTimer}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <Label>Select Duration</Label>
                <div className="flex justify-between gap-2">
                  {timerOptions.map(minutes => (
                    <Button 
                      key={minutes}
                      variant={selectedDuration === minutes ? "default" : "outline"}
                      className={selectedDuration === minutes ? "bg-electric" : ""}
                      onClick={() => setSelectedDuration(minutes)}
                    >
                      {minutes} min
                    </Button>
                  ))}
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between mb-2">
                    <Label>Custom: {selectedDuration} minutes</Label>
                  </div>
                  <Slider
                    value={[selectedDuration]}
                    min={1}
                    max={120}
                    step={1}
                    onValueChange={(value) => setSelectedDuration(value[0])}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="fade-out">Fade out before stopping</Label>
                <Switch 
                  id="fade-out"
                  checked={enableFadeOut}
                  onCheckedChange={setEnableFadeOut}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={handleStartTimer}
                  className="w-full bg-electric hover:bg-electric/90"
                >
                  Start Timer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
