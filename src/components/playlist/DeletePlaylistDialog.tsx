import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface DeletePlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  playlistName?: string;
}

export const DeletePlaylistDialog: React.FC<DeletePlaylistDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  playlistName = "this playlist"
}) => {
  const { isDarkTheme } = useTheme();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(
        isDarkTheme ? "bg-black/80 border-white/10 text-white" : "bg-white border-gray-200"
      )}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete {playlistName}?</AlertDialogTitle>
          <AlertDialogDescription className={isDarkTheme ? "text-gray-300" : "text-gray-600"}>
            This action cannot be undone. This playlist will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onCancel}
            className={isDarkTheme ? "border-white/20 hover:bg-white/10 text-white" : ""}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePlaylistDialog;
