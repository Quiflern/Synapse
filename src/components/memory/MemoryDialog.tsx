/**
 * MemoryDialog - An AI-enhanced dialog for creating track memories
 *
 * This component extends the MemoryForm with AI capabilities to:
 * - Suggest memory details based on track information
 * - Enhance memory descriptions with contextual suggestions
 * - Provide related song recommendations
 */
import React from "react";
import { MemoryFormInput } from "@/types/memory";
import { Track } from "@/types/music";
import { MemoryForm } from "./MemoryForm";

interface MemoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: MemoryFormInput) => Promise<void>;
  track: Track | null;
  initialMemoryData?: MemoryFormInput;
}

export const MemoryDialog: React.FC<MemoryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  track,
  initialMemoryData,
}) => {
  return (
    <MemoryForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      track={track}
      initialMemoryData={initialMemoryData}
    />
  );
};
