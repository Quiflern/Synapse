import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export interface PlaylistFormData {
  id?: string;
  name: string;
  description: string;
}

interface PlaylistFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PlaylistFormData) => void;
  initialData?: PlaylistFormData;
}

export const PlaylistFormDialog: React.FC<PlaylistFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { isDarkTheme } = useTheme();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic validation
    if (!name.trim()) {
      setIsSubmitting(false);
      return;
    }

    onSave({
      id: initialData?.id,
      name: name.trim(),
      description: description.trim()
    });
    
    // Reset form and close
    setName("");
    setDescription("");
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        "sm:max-w-md",
        isDarkTheme ? "bg-black/80 border-white/10 text-white" : "bg-white border-gray-200"
      )}>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Playlist" : "Create New Playlist"}</DialogTitle>
          <DialogDescription className={isDarkTheme ? "text-gray-300" : "text-gray-600"}>
            {initialData
              ? "Update your playlist details below."
              : "Create a new playlist to organize your music."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full",
                    isDarkTheme ? "bg-black/60 border-white/20" : "bg-white border-gray-200"
                  )}
                  placeholder="My Awesome Playlist"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(
                  "col-span-3 resize-none",
                  isDarkTheme ? "bg-black/60 border-white/20" : "bg-white border-gray-200"
                )}
                placeholder="Describe your playlist"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={isDarkTheme ? "border-white/20 hover:bg-white/10" : ""}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistFormDialog;
