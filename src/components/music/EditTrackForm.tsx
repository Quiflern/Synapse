import React, { useEffect, useMemo, useRef, useState } from "react";
import { Track } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Globe,
  Loader2,
  Lock,
  Music,
  Save,
  Trash2,
  X as CloseIcon,
  XCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface EditTrackFormProps {
  isOpen: boolean;
  track: Track | null;
  onSave: (updatedTrack: Track) => Promise<boolean>;
  onDelete: (trackId: string) => void;
  onClose: () => void;
}

/**
 * @file EditTrackForm.tsx
 * @description A standalone, neomorphic, glass-effect modal form for editing track metadata.
 * Fully theme-aware, adapting its appearance to the currently selected application theme.
 */
export const EditTrackForm: React.FC<EditTrackFormProps> = ({
  isOpen,
  track,
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(track?.title || "");
  const [artist, setArtist] = useState(track?.artist || "");
  const [album, setAlbum] = useState(track?.album || "");
  const [genre, setGenre] = useState(track?.genre || "");
  const [year, setYear] = useState(track?.year?.toString() || "");
  const [isPublic, setIsPublic] = useState(track?.is_public || false);
  const [albumArtPreview, setAlbumArtPreview] = useState<string | null>(
    track?.albumArt || null,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const { isDarkTheme, themeColors, theme } = useTheme(); // Added theme
  const [activeField, setActiveField] = useState<string | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (track) {
      setTitle(track.title);
      setArtist(track.artist || "");
      setAlbum(track.album || "");
      setGenre(track.genre || "");
      setYear(track.year?.toString() || "");
      setIsPublic(track.is_public || false);
      setAlbumArtPreview(track.albumArt || null);
    }
    setSaveStatus("idle");
    setIsSaving(false);
  }, [track, isOpen]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(e.target as Node) &&
        isOpen
      )
        onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("mousedown", handleClickOutside);
      if (!document.querySelector(".fixed.inset-0.z-\\[100\\]")) {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!track) return;
    if (!title || !artist) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
      return;
    }
    setIsSaving(true);
    setSaveStatus("idle");
    const updatedTrack: Track = {
      ...track,
      title,
      artist,
      album: album || undefined,
      genre: genre || undefined,
      year: year ? parseInt(year) : undefined,
      is_public: isPublic,
    };
    try {
      const success = await onSave(updatedTrack);
      setSaveStatus(success ? "success" : "error");
      if (success) {
        setTimeout(() => onClose(), 1200);
      }
    } catch (error) {
      console.error("Save failed in form:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      if (saveStatus !== "success" && saveStatus !== "idle" && !isSaving) {
        setTimeout(() => {
          if (saveStatus !== "success") setSaveStatus("idle");
        }, 2500);
      }
    }
  };

  const handleDeleteWithConfirmation = () => {
    if (track) onDelete(track.id);
  };

  // Memoized theme-specific styles for the modal and its elements.
  const modalStyles = useMemo(() => {
    const shadows = isDarkTheme
      ? {
          light: "rgba(255, 255, 255, 0.05)",
          dark: "rgba(0, 0, 0, 0.6)",
        }
      : { light: "rgba(255, 255, 255, 0.9)", dark: "rgba(0, 0, 0, 0.15)" };
    let glassBg = isDarkTheme
      ? "rgba(25, 25, 30, 0.65)"
      : "rgba(255, 255, 255, 0.65)";
    let borderColor = isDarkTheme
      ? "rgba(255, 255, 255, 0.07)"
      : "rgba(0, 0, 0, 0.07)";
    let inputClasses = isDarkTheme
      ? "bg-black/20 border-white/10 text-gray-100 placeholder:text-neutral-400/60"
      : "bg-white/50 border-black/10 text-gray-800 placeholder:text-neutral-500/90";
    let innerCardBg = isDarkTheme
      ? "rgba(35, 35, 40, 0.4)"
      : "rgba(248, 249, 250, 0.6)";
    let labelColor = isDarkTheme ? "text-gray-400" : "text-gray-600";
    let subTextColor = isDarkTheme
      ? "text-neutral-400/80"
      : "text-neutral-500/90";
    let buttonOutlineBorder = isDarkTheme
      ? "border-white/10 hover:bg-white/5"
      : "border-black/10 hover:bg-black/5";
    let activeInputRing = `ring-[${themeColors.primary}] border-[${themeColors.primary}]`;
    let activeInputBoxShadow = `0 0 0 1.5px ${themeColors.primary}${isDarkTheme ? "50" : "30"}`;

    switch (theme) {
      case "cyberpunk":
        glassBg = "rgba(10, 20, 35, 0.75)"; // Deep blue, slightly purple tint
        borderColor = themeColors.electric + "30";
        inputClasses = `bg-black/40 border-[${themeColors.electric}]/30 text-${themeColors.electricText} placeholder:text-${themeColors.electricText}/50`;
        innerCardBg = "rgba(15, 25, 45, 0.65)";
        labelColor = `text-${themeColors.electricText}/80`;
        subTextColor = `text-${themeColors.electricText}/70`;
        buttonOutlineBorder = `border-[${themeColors.electric}]/40 hover:bg-[${themeColors.electric}]/10 text-${themeColors.electricText}/90`;
        activeInputRing = `ring-[${themeColors.electric}] border-[${themeColors.electric}]`;
        activeInputBoxShadow = `0 0 0 1.5px ${themeColors.electric}50`;
        break;
      case "midnight-ash":
        glassBg = "rgba(20, 28, 38, 0.75)"; // Deep desaturated blue/grey
        borderColor = "#33C3F0" + "30";
        inputClasses =
          "bg-slate-800/50 border-[#33C3F0]/20 text-slate-100 placeholder:text-slate-400/60";
        innerCardBg = "rgba(28, 38, 50, 0.6)";
        labelColor = "text-slate-300";
        subTextColor = "text-slate-400/90";
        buttonOutlineBorder =
          "border-[#33C3F0]/30 hover:bg-[#33C3F0]/10 text-[#33C3F0]/90";
        activeInputRing = `ring-[#33C3F0] border-[#33C3F0]`;
        activeInputBoxShadow = `0 0 0 1.5px #33C3F050`;
        break;
      case "obsidian-veil":
        glassBg = "rgba(30, 25, 45, 0.75)"; // Deep purple
        borderColor = "#7E69AB" + "30";
        inputClasses =
          "bg-indigo-900/40 border-[#7E69AB]/30 text-indigo-100 placeholder:text-indigo-300/60";
        innerCardBg = "rgba(40, 35, 55, 0.6)";
        labelColor = "text-indigo-200";
        subTextColor = "text-indigo-300/90";
        buttonOutlineBorder =
          "border-[#7E69AB]/30 hover:bg-[#7E69AB]/10 text-[#7E69AB]/90";
        activeInputRing = `ring-[#7E69AB] border-[#7E69AB]`;
        activeInputBoxShadow = `0 0 0 1.5px #7E69AB50`;
        break;
      case "shadow-ember":
        glassBg = "rgba(40, 20, 20, 0.75)"; // Deep red/brown
        borderColor = "#ea384d" + "30";
        inputClasses =
          "bg-red-950/40 border-[#ea384d]/30 text-red-100 placeholder:text-red-300/60";
        innerCardBg = "rgba(50, 30, 30, 0.6)";
        labelColor = "text-red-200";
        subTextColor = "text-red-300/90";
        buttonOutlineBorder =
          "border-[#ea384d]/30 hover:bg-[#ea384d]/10 text-[#ea384d]/90";
        activeInputRing = `ring-[#ea384d] border-[#ea384d]`;
        activeInputBoxShadow = `0 0 0 1.5px #ea384d50`;
        break;
    }
    return {
      shadows,
      glassBg,
      borderColor,
      inputClasses,
      innerCardBg,
      labelColor,
      subTextColor,
      buttonOutlineBorder,
      activeInputRing,
      activeInputBoxShadow,
    };
  }, [isDarkTheme, theme, themeColors]);

  const getInputClassWithTheme = (id: string) => {
    const baseInputStyle =
      "text-sm rounded-xl transition-all duration-200 ease-out border py-2.5 px-3.5 h-11 backdrop-blur-sm w-full";
    const activeClass =
      activeField === id
        ? `ring-1 ring-opacity-60 !border-opacity-80 ${modalStyles.activeInputRing}`
        : "";
    return cn(baseInputStyle, modalStyles.inputClasses, activeClass);
  };

  if (!isOpen || !track) return null;

  return (
    <motion.div
      key="edit-track-modal-wrapper"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        ref={modalContentRef}
        className="relative rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col sm:max-w-md md:max-w-lg lg:max-w-xl"
        style={{
          background: modalStyles.glassBg,
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          border: `1px solid ${modalStyles.borderColor}`,
          boxShadow: `0px 15px 35px ${modalStyles.shadows.dark}`,
        }}
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 35,
          duration: 0.3,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-between p-3.5 sm:p-4 border-b",
            modalStyles.borderColor,
          )}
        >
          <h2
            className={cn(
              "text-md sm:text-lg font-semibold",
              isDarkTheme ? "text-gray-100" : "text-gray-800",
            )}
          >
            Edit Track Details
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "h-7 w-7 sm:h-8 sm:w-8 rounded-full",
              isDarkTheme
                ? "text-gray-400 hover:bg-white/10"
                : "text-gray-500 hover:bg-black/5",
            )}
          >
            <CloseIcon size={16} />
          </Button>
        </div>

        <div className="overflow-y-auto p-3.5 sm:p-5 flex-grow">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row gap-4 md:gap-5">
              <div className="md:w-[160px] lg:w-[170px] flex-shrink-0 flex flex-col items-center md:items-start gap-3.5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative w-full aspect-square max-w-[150px] sm:max-w-[160px] mx-auto md:mx-0 rounded-xl overflow-hidden"
                  style={{
                    boxShadow: `5px 5px 15px ${modalStyles.shadows.dark}, -5px -5px 15px ${modalStyles.shadows.light}`,
                    border: `1px solid ${modalStyles.borderColor}`,
                  }}
                >
                  {albumArtPreview ? (
                    <img
                      src={albumArtPreview}
                      alt={`${title} Album Art`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full flex items-center justify-center",
                        modalStyles.inputClasses
                          .split(" ")
                          .find((c) => c.startsWith("bg-")) ||
                          "bg-neutral-700/20",
                      )}
                    >
                      {" "}
                      {/* Use input's bg for consistency */}
                      <div className="text-center text-neutral-400 dark:text-neutral-500">
                        <Music
                          size={36}
                          strokeWidth={1.5}
                          className="mx-auto mb-1.5 opacity-50"
                        />
                        <p className="text-xs opacity-70">No Album Art</p>
                      </div>
                    </div>
                  )}
                </motion.div>
                {!track.id.startsWith("local-") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="w-full rounded-xl p-3 space-y-2"
                    style={{
                      background: modalStyles.innerCardBg,
                      boxShadow: `inset 2px 2px 5px ${modalStyles.shadows.dark}, inset -2px -2px 5px ${modalStyles.shadows.light}`,
                      border: `1px solid ${modalStyles.borderColor}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="isPublic"
                        className={cn(
                          "cursor-pointer text-xs font-medium",
                          modalStyles.labelColor,
                        )}
                      >
                        Visibility
                      </Label>
                      <div
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                          isPublic
                            ? `bg-[${themeColors.primary}]/20 text-[${themeColors.primary}]`
                            : "bg-gray-400/20 text-gray-500 dark:text-gray-400",
                        )}
                      >
                        {isPublic ? "Public" : "Private"}
                      </div>
                    </div>
                    <div
                      onClick={() => setIsPublic(!isPublic)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                        isPublic
                          ? `bg-[${themeColors.primary}]/10 hover:bg-[${themeColors.primary}]/15`
                          : "bg-gray-500/10 hover:bg-gray-500/15",
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-full",
                          isPublic
                            ? `bg-[${themeColors.primary}]/20 text-[${themeColors.primary}]`
                            : "bg-gray-500/20 text-gray-500 dark:text-gray-400",
                        )}
                      >
                        {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-[11px] font-medium",
                            isDarkTheme ? "text-gray-200" : "text-gray-800",
                          )}
                        >
                          {isPublic ? "Public Track" : "Private Track"}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] opacity-70",
                            modalStyles.subTextColor,
                          )}
                        >
                          {isPublic
                            ? "Visible to everyone"
                            : "Only visible to you"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-3.5">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label
                    htmlFor="title"
                    className={cn(
                      "block text-xs font-medium mb-1 opacity-70",
                      modalStyles.labelColor,
                    )}
                  >
                    Title <span className="text-red-500/80">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setActiveField("title")}
                    onBlur={() => setActiveField(null)}
                    required
                    className={getInputClassWithTheme("title")}
                    style={{
                      boxShadow:
                        activeField === "title"
                          ? modalStyles.activeInputBoxShadow
                          : `inset 2px 2px 5px ${modalStyles.shadows.dark}, inset -2px -2px 5px ${modalStyles.shadows.light}`,
                    }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Label
                    htmlFor="artist"
                    className={cn(
                      "block text-xs font-medium mb-1 opacity-70",
                      modalStyles.labelColor,
                    )}
                  >
                    Artist <span className="text-red-500/80">*</span>
                  </Label>
                  <Input
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    onFocus={() => setActiveField("artist")}
                    onBlur={() => setActiveField(null)}
                    required
                    className={getInputClassWithTheme("artist")}
                    style={{
                      boxShadow:
                        activeField === "artist"
                          ? modalStyles.activeInputBoxShadow
                          : `inset 2px 2px 5px ${modalStyles.shadows.dark}, inset -2px -2px 5px ${modalStyles.shadows.light}`,
                    }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl p-3 space-y-3 mt-1"
                  style={{
                    background: modalStyles.innerCardBg,
                    boxShadow: `inset 2px 2px 5px ${modalStyles.shadows.dark}, inset -2px -2px 5px ${modalStyles.shadows.light}`,
                    border: `1px solid ${modalStyles.borderColor}`,
                  }}
                >
                  <div>
                    <Label
                      htmlFor="album"
                      className={cn(
                        "block text-xs font-medium mb-1 opacity-70",
                        modalStyles.labelColor,
                      )}
                    >
                      Album
                    </Label>
                    <Input
                      id="album"
                      value={album}
                      onChange={(e) => setAlbum(e.target.value)}
                      onFocus={() => setActiveField("album")}
                      onBlur={() => setActiveField(null)}
                      className={getInputClassWithTheme("album")}
                      style={{
                        boxShadow:
                          activeField === "album"
                            ? modalStyles.activeInputBoxShadow
                            : `inset 2px 2px 4px ${modalStyles.shadows.dark}, inset -2px -2px 4px ${modalStyles.shadows.light}`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="genre"
                        className={cn(
                          "block text-xs font-medium mb-1 opacity-70",
                          modalStyles.labelColor,
                        )}
                      >
                        Genre
                      </Label>
                      <Input
                        id="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        onFocus={() => setActiveField("genre")}
                        onBlur={() => setActiveField(null)}
                        className={getInputClassWithTheme("genre")}
                        style={{
                          boxShadow:
                            activeField === "genre"
                              ? modalStyles.activeInputBoxShadow
                              : `inset 2px 2px 4px ${modalStyles.shadows.dark}, inset -2px -2px 4px ${modalStyles.shadows.light}`,
                        }}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="year"
                        className={cn(
                          "block text-xs font-medium mb-1 opacity-70",
                          modalStyles.labelColor,
                        )}
                      >
                        Year
                      </Label>
                      <Input
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        onFocus={() => setActiveField("year")}
                        onBlur={() => setActiveField(null)}
                        type="text"
                        pattern="[0-9]{0,4}"
                        maxLength={4}
                        className={getInputClassWithTheme("year")}
                        style={{
                          boxShadow:
                            activeField === "year"
                              ? modalStyles.activeInputBoxShadow
                              : `inset 2px 2px 4px ${modalStyles.shadows.dark}, inset -2px -2px 4px ${modalStyles.shadows.light}`,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            <div
              className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2.5 pt-3.5 mt-3.5 border-t"
              style={{
                borderColor:
                  modalStyles.borderColor +
                  "80" /* slightly more opaque border */,
              }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={handleDeleteWithConfirmation}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 hover:text-red-600 dark:hover:text-red-300 px-3 h-8 rounded-lg"
                style={{
                  boxShadow: `2px 2px 5px ${modalStyles.shadows.dark}, -2px -2px 5px ${modalStyles.shadows.light}`,
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Track
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving}
                  className={cn(
                    "flex-1 sm:flex-none text-xs px-3.5 h-8 rounded-lg",
                    modalStyles.buttonOutlineBorder,
                  )}
                  style={{
                    boxShadow: `2px 2px 5px ${modalStyles.shadows.dark}, -2px -2px 5px ${modalStyles.shadows.light}`,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !title || !artist}
                  style={{
                    backgroundColor: themeColors.primary,
                    color: themeColors.primaryForeground,
                    boxShadow: `2px 2px 5px ${modalStyles.shadows.dark}, -2px -2px 5px ${modalStyles.shadows.light}`,
                  }}
                  className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs px-3.5 h-8 min-w-[110px] rounded-lg transition-colors duration-200",
                    saveStatus === "success" &&
                      "!bg-green-500 dark:!bg-green-500",
                    saveStatus === "error" && "!bg-red-500 dark:!bg-red-500",
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isSaving ? (
                      <motion.div
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      </motion.div>
                    ) : saveStatus === "success" ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </motion.div>
                    ) : saveStatus === "error" ? (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="save"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Save className="h-3 w-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="ml-1">
                    {isSaving
                      ? "Saving"
                      : saveStatus === "success"
                        ? "Saved"
                        : saveStatus === "error"
                          ? "Retry"
                          : "Save"}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
