import React, { useState, ChangeEvent, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Upload as UploadIcon, Music, Image, AlertCircle, X as CloseIcon, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useLibrary } from '@/context/LibraryContext';
import * as musicMetadata from 'music-metadata';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadFormData {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
  is_public: boolean;
}

interface UploadFormProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * @file UploadForm.tsx
 * @description A standalone, theme-aware modal form for uploading music tracks.
 * Features a neomorphic glass design, metadata extraction, and upload progress.
 */
const UploadForm: React.FC<UploadFormProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { refreshLibrary } = useLibrary();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [extractedCoverArtUrl, setExtractedCoverArtUrl] = useState<string | null>(null);
  const [hasCoverArtInMetadata, setHasCoverArtInMetadata] = useState<boolean>(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const { register, handleSubmit: RHFhandleSubmit, setValue, formState: { errors }, reset: resetForm, watch } = useForm<UploadFormData>({
    defaultValues: { is_public: false }
  });
  const isPublicValue = watch('is_public'); // To style the switch/toggle area if needed

  const { isDarkTheme, themeColors, theme } = useTheme();
  const [activeField, setActiveField] = useState<string | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null); // Ref for audio file input
  const coverInputRef = useRef<HTMLInputElement>(null); // Ref for cover art file input


  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        resetForm({ title: '', artist: '', album: '', genre: '', year: '', is_public: false });
        setAudioFile(null);
        setCoverArtFile(null);
        setExtractedCoverArtUrl(null);
        setHasCoverArtInMetadata(false);
        setUploading(false);
        setUploadProgress(0);
        setUploadStatus('idle');
        setIsLoadingMetadata(false);
        if(audioInputRef.current) audioInputRef.current.value = ""; // Clear file input
        if(coverInputRef.current) coverInputRef.current.value = "";   // Clear file input
      }, 300);
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (audioFile) {
      extractMetadataFromAudio(audioFile);
    } else {
      setValue('title', ''); setValue('artist', ''); setValue('album', '');
      setValue('genre', ''); setValue('year', '');
      setExtractedCoverArtUrl(null); setHasCoverArtInMetadata(false);
    }
  }, [audioFile, setValue]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    const handleClickOutside = (e: MouseEvent) => { if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node) && isOpen) onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
      if (!document.querySelector('.fixed.inset-0.z-\\[100\\]')) { document.body.style.overflow = 'unset'; }
    };
  }, [isOpen, onClose]);

  const extractMetadataFromAudio = async (file: File) => {
    setIsLoadingMetadata(true);
    setExtractedCoverArtUrl(null); setHasCoverArtInMetadata(false);
    try {
      const metadata = await musicMetadata.parseBlob(file); // Using music-metadata-browser
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const blob = new Blob([picture.data], { type: picture.format });
        const coverUrl = URL.createObjectURL(blob);
        setExtractedCoverArtUrl(coverUrl);
        setHasCoverArtInMetadata(true);
      }
      if (metadata.common.title) setValue('title', metadata.common.title); else setValue('title', file.name.replace(/\.[^/.]+$/, "")); // Fallback to filename for title
      if (metadata.common.artist) setValue('artist', metadata.common.artist);
      if (metadata.common.album) setValue('album', metadata.common.album);
      if (metadata.common.genre && metadata.common.genre.length > 0) setValue('genre', metadata.common.genre.join(', '));
      if (metadata.common.year) setValue('year', metadata.common.year.toString());
    } catch (error) {
      console.error("Failed to extract metadata:", error);
      setValue('title', file.name.replace(/\.[^/.]+$/, "")); // Fallback to filename for title if metadata fails
      toast({ title: "Metadata extraction issues", description: "Could not fully read metadata. Please review and fill fields manually.", variant: "default" });
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleAudioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setCoverArtFile(null);
      if (coverInputRef.current) coverInputRef.current.value = ""; // Clear cover art file input visually
    } else if (file) {
      toast({ title: "Invalid file type", description: "Please select a valid audio file.", variant: "destructive" });
      if (audioInputRef.current) audioInputRef.current.value = ""; // Clear invalid file
    }
  };

  const handleCoverArtChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverArtFile(file);
      setExtractedCoverArtUrl(URL.createObjectURL(file));
      setHasCoverArtInMetadata(false);
    } else if (file) {
      toast({ title: "Invalid file type", description: "Please select a valid image file.", variant: "destructive" });
      if (coverInputRef.current) coverInputRef.current.value = ""; // Clear invalid file
    }
  };

  const onSubmit = async (formData: UploadFormData) => {
    if (!audioFile || !user) {
      toast({ title: "Missing information", description: "Please select an audio file and ensure you are signed in.", variant: "destructive" });
      setUploadStatus('error'); setTimeout(() => setUploadStatus('idle'), 2500);
      return;
    }
    if (!formData.title || !formData.artist) {
      toast({ title: "Missing information", description: "Title and Artist are required fields.", variant: "destructive" });
      setUploadStatus('error'); setTimeout(() => setUploadStatus('idle'), 2500);
      return;
    }

    setUploading(true); setUploadProgress(0); setUploadStatus('idle');
    try {
      let coverArtSupabasePath: string | null = null;
      const finalCoverArtFile = coverArtFile || (extractedCoverArtUrl && hasCoverArtInMetadata ? await (async () => {
        const response = await fetch(extractedCoverArtUrl); const blob = await response.blob();
        return new File([blob], "extracted-cover.jpg", { type: blob.type });
      })() : null);

      if (finalCoverArtFile) {
        const coverArtFilename = `${user.id}/${Date.now()}-${finalCoverArtFile.name.replace(/\s+/g, '-')}`;
        const { error: coverError } = await supabase.storage.from('images').upload(coverArtFilename, finalCoverArtFile);
        if (coverError) throw new Error(`Cover art upload failed: ${coverError.message}`);
        const { data: coverUrlData } = supabase.storage.from('images').getPublicUrl(coverArtFilename);
        coverArtSupabasePath = coverUrlData.publicUrl;
        setUploadProgress(20);
      }

      const audioFilename = `${user.id}/${Date.now()}-${audioFile.name.replace(/\s+/g, '-')}`;
      setUploadProgress(prev => Math.max(prev, 30));

      const { error: audioError } = await supabase.storage.from('audio').upload(audioFilename, audioFile, {
        // Removed onUploadProgress for Supabase V2 Storage, progress is harder to get chunk by chunk without custom logic or specific SDK features.
        // We'll use determinate steps for progress.
      });
      if (audioError) throw new Error(`Audio file upload failed: ${audioError.message}`);
      setUploadProgress(80); // After audio upload attempt

      const { data: audioUrlData } = supabase.storage.from('audio').getPublicUrl(audioFilename);
      const audioFilePath = audioUrlData.publicUrl;
      const audioDuration = await new Promise<number>((resolve) => {
        const audio = new Audio(); audio.onloadedmetadata = () => resolve(Math.round(audio.duration)); audio.src = URL.createObjectURL(audioFile);
      });

      setUploadProgress(85);
      const { error: trackError } = await supabase.from('tracks').insert({
        title: formData.title, artist: formData.artist, album: formData.album || null, genre: formData.genre || null, year: formData.year ? parseInt(formData.year) : null,
        duration: audioDuration, file_path: audioFilePath, cover_art: coverArtSupabasePath, uploaded_by: user.id, is_public: formData.is_public
      });
      if (trackError) throw new Error(`Database record creation failed: ${trackError.message}`);

      setUploadProgress(100); setUploadStatus('success');
      toast({ title: "Upload successful!", description: `${formData.title} has been added.` });
      refreshLibrary();
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({ title: "Upload failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setUploading(false);
      if(uploadStatus !== 'success') setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const modalStyles = useMemo(() => {
    const shadows = isDarkTheme ? { light: 'rgba(255, 255, 255, 0.05)', dark: 'rgba(0, 0, 0, 0.6)' } : { light: 'rgba(255, 255, 255, 0.9)', dark: 'rgba(0, 0, 0, 0.15)' };
    let glassBg = isDarkTheme ? 'rgba(25, 25, 30, 0.65)' : 'rgba(255, 255, 255, 0.65)';
    let borderColor = isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.07)';
    let inputClasses = isDarkTheme ? "bg-black/20 border-white/10 text-gray-100 placeholder:text-neutral-400/60" : "bg-white/50 border-black/10 text-gray-800 placeholder:text-neutral-500/90";
    let labelColor = isDarkTheme ? "text-gray-400" : "text-gray-600";
    let buttonOutlineBorder = isDarkTheme ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5";
    let activeInputBoxShadow = `0 0 0 1.5px ${themeColors.primary}${isDarkTheme ? '50' : '30'}`;

    switch (theme) {
      case "cyberpunk":
        glassBg = 'rgba(10, 20, 35, 0.75)'; borderColor = themeColors.electric + '30';
        inputClasses = `bg-black/40 border-[${themeColors.electric}]/30 text-${themeColors.electricText} placeholder:text-${themeColors.electricText}/50`;
        labelColor = `text-${themeColors.electricText}/80`;
        buttonOutlineBorder = `border-[${themeColors.electric}]/40 hover:bg-[${themeColors.electric}]/10 text-${themeColors.electricText}/90`;
        activeInputBoxShadow = `0 0 0 1.5px ${themeColors.electric}50`;
        break;
      case "midnight-ash":
        glassBg = 'rgba(20, 28, 38, 0.75)'; borderColor = '#33C3F0' + '30';
        inputClasses = "bg-slate-800/50 border-[#33C3F0]/20 text-slate-100 placeholder:text-slate-400/60";
        labelColor = "text-slate-300";
        buttonOutlineBorder = "border-[#33C3F0]/30 hover:bg-[#33C3F0]/10 text-[#33C3F0]/90";
        activeInputBoxShadow = `0 0 0 1.5px #33C3F050`;
        break;
      case "obsidian-veil":
        glassBg = 'rgba(30, 25, 45, 0.75)'; borderColor = '#7E69AB' + '30';
        inputClasses = "bg-indigo-900/40 border-[#7E69AB]/30 text-indigo-100 placeholder:text-indigo-300/60";
        labelColor = "text-indigo-200";
        buttonOutlineBorder = "border-[#7E69AB]/30 hover:bg-[#7E69AB]/10 text-[#7E69AB]/90";
        activeInputBoxShadow = `0 0 0 1.5px #7E69AB50`;
        break;
      case "shadow-ember":
        glassBg = 'rgba(40, 20, 20, 0.75)'; borderColor = '#ea384d' + '30';
        inputClasses = "bg-red-950/40 border-[#ea384d]/30 text-red-100 placeholder:text-red-300/60";
        labelColor = "text-red-200";
        buttonOutlineBorder = "border-[#ea384d]/30 hover:bg-[#ea384d]/10 text-[#ea384d]/90";
        activeInputBoxShadow = `0 0 0 1.5px #ea384d50`;
        break;
    }
    return { shadows, glassBg, borderColor, inputClasses, labelColor, buttonOutlineBorder, activeInputBoxShadow };
  }, [isDarkTheme, theme, themeColors]);

  const getInputClassWithTheme = (id: string, hasError?: boolean) => {
    const baseInputStyle = "text-sm rounded-xl transition-all duration-200 ease-out border py-2.5 px-3.5 h-11 backdrop-blur-sm w-full"; // Standardized input height
    const activeClass = activeField === id ? `ring-1 ring-opacity-60 !border-opacity-80 ${modalStyles.activeInputRing}` : ""; // Use modalStyles.activeInputRing if defined
    const errorClass = hasError ? (isDarkTheme ? 'border-red-500/70 ring-red-500/50' : 'border-red-500/90 ring-red-500/70') : "";
    return cn(baseInputStyle, modalStyles.inputClasses, activeClass, errorClass);
  };

  if (!isOpen) return null;
  if (!user && isOpen) return ( // Simplified handling for !user when modal is trying to open
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
        <div ref={modalContentRef} className="p-6 rounded-xl shadow-xl" style={{background: modalStyles.glassBg, border: `1px solid ${modalStyles.borderColor}`}}>
          <p className={cn(isDarkTheme ? "text-gray-200" : "text-gray-700", "text-center")}>Please sign in to upload music.</p>
          <Button onClick={onClose} variant="outline" className={cn("mt-4 w-full", modalStyles.buttonOutlineBorder)}>Close</Button>
        </div>
      </div>
  );

  const fileInputAreaStyle = {
    border: `1px dashed ${activeField === 'audioFile' || activeField === 'coverArtFile' ? themeColors.primary : modalStyles.borderColor + '80'}`,
    boxShadow: `inset 1px 1px 3px ${modalStyles.shadows.dark}, inset -1px -1px 3px ${modalStyles.shadows.light}`
  };

  return (
      <motion.div
          key="upload-form-modal-wrapper"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      >
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-lg" onClick={onClose} />
        <motion.div
            ref={modalContentRef}
            className={cn("relative rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col", "sm:max-w-lg md:max-w-xl lg:max-w-2xl")}
            style={{ background: modalStyles.glassBg, backdropFilter: 'blur(18px) saturate(200%)', WebkitBackdropFilter: 'blur(18px) saturate(200%)', border: `1px solid ${modalStyles.borderColor}`, boxShadow: `0px 20px 45px ${modalStyles.shadows.dark}`}}
            initial={{ y: 30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35, duration: 0.3 }}
        >
          <div className={cn("flex items-center justify-between p-3.5 sm:p-4 border-b", modalStyles.borderColor)}>
            <h2 className={cn("text-md sm:text-lg font-semibold", isDarkTheme ? "text-gray-100" : "text-gray-800")}>Upload New Track</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-full", isDarkTheme ? "text-gray-400 hover:bg-white/10" : "text-gray-500 hover:bg-black/5")}>
              <CloseIcon size={16} />
            </Button>
          </div>

          <div className="overflow-y-auto p-4 sm:p-5 flex-grow">
            <form onSubmit={RHFhandleSubmit(onSubmit)} className="space-y-5">
              {/* File Inputs Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

                <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }} transition={{delay:0.1}} className="space-y-1.5">
                  <Label htmlFor="audioFileTrigger" className={cn("flex items-center gap-1.5 text-xs font-medium", modalStyles.labelColor)}>
                    <Music size={14} /> Audio File <span className="text-red-500/90">*</span>
                  </Label>
                  <div className={cn("rounded-xl p-3 transition-colors cursor-pointer hover:border-opacity-100", modalStyles.inputClasses.split(' ').find(c => c.startsWith('bg-')) || (isDarkTheme ? 'bg-black/20' : 'bg-white/40'))} style={fileInputAreaStyle} onClick={() => audioInputRef.current?.click()} onFocus={() => setActiveField('audioFile')} onBlur={() => setActiveField(null)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && audioInputRef.current?.click()}>
                    <input id="audioFile" type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" ref={audioInputRef}/>
                    <div className="flex items-center text-xs opacity-80">
                      <UploadIcon className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                                        {isLoadingMetadata ? "Reading metadata..." : audioFile ? audioFile.name : "Click or drop audio file"}
                                    </span>
                    </div>
                    {errors.audioFile && <p className="text-xs text-red-500/90 mt-1">Audio file is required.</p>}
                  </div>
                </motion.div>


                <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }} transition={{delay:0.15}} className="space-y-1.5">
                  <Label htmlFor="coverArtTrigger" className={cn("flex items-center gap-1.5 text-xs font-medium", modalStyles.labelColor)}>
                    <Image size={14} /> Cover Art (Optional)
                  </Label>
                  <div className={cn("rounded-xl p-3 transition-colors cursor-pointer hover:border-opacity-100", modalStyles.inputClasses.split(' ').find(c => c.startsWith('bg-')) || (isDarkTheme ? 'bg-black/20' : 'bg-white/40'))} style={fileInputAreaStyle} onClick={() => coverInputRef.current?.click()} onFocus={() => setActiveField('coverArtFile')} onBlur={() => setActiveField(null)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && coverInputRef.current?.click()}>
                    <input id="coverArt" type="file" accept="image/*" onChange={handleCoverArtChange} className="hidden" ref={coverInputRef} />
                    <div className="flex items-center text-xs opacity-80">
                      <UploadIcon className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                                        {coverArtFile ? coverArtFile.name : extractedCoverArtUrl ? "Using extracted art" : "Click or drop cover art"}
                                    </span>
                    </div>
                  </div>
                  {extractedCoverArtUrl && (
                      <div className="mt-2 flex items-center justify-center">
                        <img src={extractedCoverArtUrl} alt="Cover art preview" className="w-16 h-16 object-cover rounded-md shadow-md border" style={{borderColor: modalStyles.borderColor}}/>
                        <span className="ml-2 text-[10px] text-green-500 dark:text-green-400">
                                        {coverArtFile ? "New cover selected" : hasCoverArtInMetadata ? "Art from metadata" : "Preview"}
                                    </span>
                      </div>
                  )}
                  {!hasCoverArtInMetadata && audioFile && !isLoadingMetadata && !coverArtFile && !extractedCoverArtUrl && (
                      <div className={cn("mt-1.5 flex items-center p-1.5 rounded-md text-xs", isDarkTheme ? "bg-amber-900/40 text-amber-400" : "bg-amber-100 text-amber-700")}>
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" /> Audio has no embedded art. Upload one?
                      </div>
                  )}
                </motion.div>


              </div>

              {/* Metadata Fields Section */}
              <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }} transition={{delay:0.2}}
                          className="rounded-xl p-3.5 sm:p-4 space-y-3.5 mt-1"
                          style={{ background: modalStyles.innerCardBg || (isDarkTheme ? 'rgba(40, 40, 45, 0.4)' : 'rgba(248, 249, 250, 0.6)'), boxShadow: `inset 2px 2px 5px ${modalStyles.shadows.dark}, inset -2px -2px 5px ${modalStyles.shadows.light}`, border: `1px solid ${modalStyles.borderColor}`}}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label htmlFor="title" className={cn("block text-xs font-medium mb-1 opacity-70", modalStyles.labelColor)}>Title <span className="text-red-500/80">*</span></Label>
                    <Input id="title" {...register("title", { required: "Title is required" })} onFocus={() => setActiveField('title')} onBlur={() => setActiveField(null)} className={getInputClassWithTheme('title', !!errors.title)} style={{ boxShadow: activeField === 'title' ? modalStyles.activeInputBoxShadow : `inset 2px 2px 4px ${modalStyles.shadows.dark}, inset -2px -2px 4px ${modalStyles.shadows.light}`}}/>
                    {errors.title && <p className="text-xs text-red-500/90 mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="artist" className={cn("block text-xs font-medium mb-1 opacity-70", modalStyles.labelColor)}>Artist <span className="text-red-500/80">*</span></Label>
                    <Input id="artist" {...register("artist", { required: "Artist is required" })} onFocus={() => setActiveField('artist')} onBlur={() => setActiveField(null)} className={getInputClassWithTheme('artist', !!errors.artist)} style={{ boxShadow: activeField === 'artist' ? modalStyles.activeInputBoxShadow : `inset 2px 2px 4px ${modalStyles.shadows.dark}, inset -2px -2px 4px ${modalStyles.shadows.light}`}}/>
                    {errors.artist && <p className="text-xs text-red-500/90 mt-1">{errors.artist.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="album" className={cn("block text-xs font-medium mb-1 opacity-70", modalStyles.labelColor)}>Album</Label>
                    <Input id="album" {...register("album")} onFocus={() => setActiveField('album')} onBlur={() => setActiveField(null)} className={getInputClassWithTheme('album')} style={{ boxShadow: activeField === 'album' ? modalStyles.activeInputBoxShadow : `inset 2px 2px 4px ${modalStyles.shadows.dark}, inset -2px -2px 4px ${modalStyles.shadows.light}`}}/>
                  </div>
                  <div>
                    <Label htmlFor="genre" className={cn("block text-xs font-medium mb-1 opacity-70", modalStyles.labelColor)}>Genre</Label>
                    <Input id="genre" {...register("genre")} onFocus={() => setActiveField('genre')} onBlur={() => setActiveField(null)} className={getInputClassWithTheme('genre')} style={{ boxShadow: activeField === 'genre' ? modalStyles.activeInputBoxShadow : `inset 2px 2px 4px ${modalStyles.shadows.dark}, inset -2px -2px 4px ${modalStyles.shadows.light}`}}/>
                  </div>
                  <div>
                    <Label htmlFor="year" className={cn("block text-xs font-medium mb-1 opacity-70", modalStyles.labelColor)}>Year</Label>
                    <Input id="year" {...register("year", { pattern: { value: /^[0-9]{0,4}$/, message: "Invalid year" }})} onFocus={() => setActiveField('year')} onBlur={() => setActiveField(null)} type="text" maxLength={4} className={getInputClassWithTheme('year', !!errors.year)} style={{ boxShadow: activeField === 'year' ? modalStyles.activeInputBoxShadow : `inset 2px 2px 4px ${modalStyles.shadows.dark}, inset -2px -2px 4px ${modalStyles.shadows.light}`}}/>
                    {errors.year && <p className="text-xs text-red-500/90 mt-1">{errors.year.message}</p>}
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between pt-2">
                    <Label htmlFor="is_public" className={cn("cursor-pointer text-xs font-medium", modalStyles.labelColor)}>Make track public</Label>
                    <Switch id="is_public" {...register("is_public")}
                            checked={isPublicValue}
                            onCheckedChange={(checked) => setValue('is_public', checked)}
                            style={{ '--switch-bg-checked': themeColors.primary, '--switch-bg-unchecked': isDarkTheme ? '#374151' : '#D1D5DB' } as React.CSSProperties}
                            className="data-[state=checked]:bg-[var(--switch-bg-checked)] data-[state=unchecked]:bg-[var(--switch-bg-unchecked)]"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Upload Progress */}
              <AnimatePresence>
                {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                    <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="space-y-1 mt-2">
                      <Label className={cn("text-xs font-medium", modalStyles.labelColor)}>Upload Progress</Label>
                      <Progress value={uploadProgress} className="h-2 rounded-full" indicatorClassName={cn(theme === "cyberpunk" && "bg-electric", theme === "midnight-ash" && "bg-[#33C3F0]", theme === "obsidian-veil" && "bg-[#7E69AB]",  theme === "shadow-ember" && "bg-[#ea384d]")} style={{backgroundColor: modalStyles.borderColor + '50'}}/>
                    </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-2.5 pt-4 mt-4 border-t" style={{borderColor: modalStyles.borderColor + '80' }}>
                <Button type="button" variant="outline" onClick={onClose} disabled={uploading && uploadStatus !== 'success' && uploadStatus !== 'error'} className={cn("w-full sm:w-auto text-xs border-opacity-70 hover:border-opacity-100 dark:border-opacity-70 dark:hover:border-opacity-100 px-3.5 h-9 rounded-lg", modalStyles.buttonOutlineBorder)} style={{ boxShadow: `2px 2px 5px ${modalStyles.shadows.dark}, -2px -2px 5px ${modalStyles.shadows.light}`}}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !audioFile || errors.title || errors.artist || errors.year} style={{ backgroundColor: themeColors.primary, color: themeColors.primaryForeground, boxShadow: `2px 2px 5px ${modalStyles.shadows.dark}, -2px -2px 5px ${modalStyles.shadows.light}`}} className={cn("w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs px-3.5 h-9 min-w-[120px] rounded-lg transition-colors duration-200", uploadStatus === 'success' && '!bg-green-500 dark:!bg-green-500', uploadStatus === 'error' && '!bg-red-500 dark:!bg-red-500')}>
                  <AnimatePresence mode="wait" initial={false}>
                    {uploading && uploadStatus === 'idle' ? <motion.div key="uploading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Loader2 className="h-3.5 w-3.5 animate-spin" /></motion.div>
                        : uploadStatus === 'success' ? <motion.div key="success" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><CheckCircle className="h-3.5 w-3.5" /></motion.div>
                            : uploadStatus === 'error' ? <motion.div key="error" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><XCircle className="h-3.5 w-3.5" /></motion.div>
                                : <motion.div key="upload" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><UploadIcon className="h-3.5 w-3.5" /></motion.div>}
                  </AnimatePresence>
                  <span className="ml-1">{uploading && uploadStatus === 'idle' ? 'Uploading...' : uploadStatus === 'success' ? 'Uploaded!' : uploadStatus === 'error' ? 'Retry Upload' : 'Upload Track'}</span>
                </Button>
              </div>
              <div className={cn("flex justify-between border-t pt-3 mt-3 text-[10px]", modalStyles.borderColor + '50', modalStyles.subTextColor || "text-muted-foreground")}>
                <p>Supported: MP3, WAV, FLAC, M4A, OGG</p>
                <p>Max size: 25MB</p>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default UploadForm;