import React, { useState, useEffect } from "react";
import { Calendar, Activity, Tag as TagIcon, MapPin, Users, PlusCircle, Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { Track } from "@/types/music";
import { MemoryFormInput } from "@/types/memory";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface MemoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: MemoryFormInput) => Promise<void>;
  track: Track | null;
  initialMemoryData?: MemoryFormInput;
  additionalTabs?: React.ReactNode;
  additionalTabsContent?: React.ReactNode;
}

export const MemoryForm: React.FC<MemoryFormProps> = ({
                                                        isOpen,
                                                        onClose,
                                                        onSave,
                                                        track,
                                                        initialMemoryData,
                                                        additionalTabs,
                                                        additionalTabsContent
                                                      }) => {
  const { themeColors, isDarkTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [isUploading, setIsUploading] = useState(false);
  const [memoryData, setMemoryData] = useState<MemoryFormInput>({
    title: "",
    date: new Date().toISOString().split("T")[0], // Default to today
    location: "",
    people: [],
    mood: "",
    activity: "",
    note: "",
    photoUrl: ""
  });

  // For handling people as a comma-separated string in the UI
  const [peopleInput, setPeopleInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // For custom mood and activity inputs
  const [customMood, setCustomMood] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  const [showCustomMoodInput, setShowCustomMoodInput] = useState(false);
  const [showCustomActivityInput, setShowCustomActivityInput] = useState(false);

  // Reset form when dialog opens or track changes
  useEffect(() => {
    if (isOpen && track) {
      if (initialMemoryData) {
        setMemoryData(initialMemoryData);
        setPeopleInput(initialMemoryData.people?.join(", ") || "");
        setPreviewUrl(initialMemoryData.photoUrl || null);

        // Reset custom inputs
        if (initialMemoryData.mood && !predefinedMoods.includes(initialMemoryData.mood)) {
          setCustomMood(initialMemoryData.mood);
          setShowCustomMoodInput(true);
        } else {
          setCustomMood("");
          setShowCustomMoodInput(false);
        }

        if (initialMemoryData.activity && !predefinedActivities.includes(initialMemoryData.activity)) {
          setCustomActivity(initialMemoryData.activity);
          setShowCustomActivityInput(true);
        } else {
          setCustomActivity("");
          setShowCustomActivityInput(false);
        }
      } else {
        // Reset to defaults but keep date as today
        setMemoryData({
          title: "",
          date: new Date().toISOString().split("T")[0],
          location: "",
          people: [],
          mood: "",
          activity: "",
          note: "",
          photoUrl: ""
        });
        setPeopleInput("");
        setPreviewUrl(null);
        setCustomMood("");
        setCustomActivity("");
        setShowCustomMoodInput(false);
        setShowCustomActivityInput(false);
      }
      setSelectedFile(null);
      setActiveTab("details");
    }
  }, [isOpen, track, initialMemoryData]);

  // Predefined options for memory form
  const predefinedMoods = [
    "Nostalgic", "Happy", "Energetic", "Calm", "Reflective",
    "Excited", "Bittersweet", "Melancholic", "Joyful", "Romantic"
  ];

  const predefinedActivities = [
    "Road Trip", "Party", "Relaxation", "Vacation", "First Listen",
    "Concert", "Beach Day", "Study Session", "Workout", "Date Night"
  ];

  // Handle people input change, converting comma-separated string to array
  const handlePeopleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPeopleInput(inputValue);

    // Update memoryData.people with an array of names
    if (inputValue) {
      const peopleArray = inputValue.split(',').map(p => p.trim()).filter(p => p);
      setMemoryData(prev => ({ ...prev, people: peopleArray }));
    } else {
      setMemoryData(prev => ({ ...prev, people: [] }));
    }
  };

  // Handle custom mood input
  const handleCustomMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomMood(value);
    setMemoryData(prev => ({ ...prev, mood: value }));
  };

  // Handle custom activity input
  const handleCustomActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomActivity(value);
    setMemoryData(prev => ({ ...prev, activity: value }));
  };

  // Handle file selection for memory photo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Check file size (3MB limit)
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 3MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);

      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Remove the selected image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMemoryData(prev => ({ ...prev, photoUrl: "" }));
  };

  // Upload image to Supabase and get the URL
  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile || !user) return null;

    setIsUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
          .from('memory_images')
          .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
          .from('memory_images')
          .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload image",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission with image upload
  const handleSave = async () => {
    if (!track) return;

    try {
      // If there's a file selected, upload it first
      if (selectedFile) {
        const photoUrl = await uploadImage();
        if (photoUrl) {
          memoryData.photoUrl = photoUrl;
        }
      }

      await onSave(memoryData);
      onClose();
    } catch (err) {
      console.error("Error saving memory:", err);
    }
  };

  // Dynamic background and text colors based on theme
  const getButtonColors = () => {
    return {
      background: `linear-gradient(45deg, ${themeColors.neon}, ${themeColors.cyber})`,
      color: themeColors.neon === '#ffcc00' ? '#000' : '#fff'
    };
  };

  const getBgColor = () => {
    return isDarkTheme ? 'bg-black/30' : 'bg-white/80';
  };

  const getBorderColor = () => {
    return isDarkTheme ? 'border-white/10' : 'border-gray-200';
  };

  const getTextColor = () => {
    return isDarkTheme ? 'text-white' : 'text-gray-900';
  };

  const getLabelColor = () => {
    return isDarkTheme ? 'text-gray-300' : 'text-gray-600';
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`max-w-2xl ${getBgColor()} ${getTextColor()}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              {initialMemoryData ? "Edit Memory" : "Add a Memory"} for "{track?.title || 'Loading...'}"
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid w-full" style={{gridTemplateColumns: additionalTabs ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr"}}>
              <TabsTrigger value="details">
                <Calendar className="mr-2 h-4 w-4" />
                Basic Details
              </TabsTrigger>
              <TabsTrigger value="note">
                <Activity className="mr-2 h-4 w-4" />
                Memory Note
              </TabsTrigger>
              <TabsTrigger value="photo">
                <Camera className="mr-2 h-4 w-4" />
                Photo
              </TabsTrigger>
              {additionalTabs}
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${getLabelColor()} mb-1 block`}>Memory Title (optional)</label>
                  <Input
                      value={memoryData.title || ""}
                      onChange={(e) => setMemoryData({...memoryData, title: e.target.value})}
                      placeholder="Beach Day with Friends"
                      className={`${getBgColor()} ${getBorderColor()}`}
                  />
                </div>

                <div>
                  <label className={`text-sm ${getLabelColor()} mb-1 block`}>Date</label>
                  <Input
                      type="date"
                      value={memoryData.date || ""}
                      onChange={(e) => setMemoryData({...memoryData, date: e.target.value})}
                      className={`${getBgColor()} ${getBorderColor()}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-sm ${getLabelColor()} mb-1 block`}>Location</label>
                <div className="relative">
                  <Input
                      value={memoryData.location || ""}
                      onChange={(e) => setMemoryData({...memoryData, location: e.target.value})}
                      placeholder="Ocean City Beach"
                      className={`${getBgColor()} ${getBorderColor()} pr-10`}
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>

              <div>
                <label className={`text-sm ${getLabelColor()} mb-1 block`}>People (comma separated)</label>
                <div className="relative">
                  <Input
                      value={peopleInput}
                      onChange={handlePeopleInputChange}
                      placeholder="Alex, Sarah, Family"
                      className={`${getBgColor()} ${getBorderColor()} pr-10`}
                  />
                  <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${getLabelColor()} mb-1 block`}>Mood/Feeling</label>
                  {showCustomMoodInput ? (
                      <div className="relative">
                        <Input
                            value={customMood}
                            onChange={handleCustomMoodChange}
                            placeholder="Enter mood/feeling"
                            className={`${getBgColor()} ${getBorderColor()}`}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => {
                              setShowCustomMoodInput(false);
                              setMemoryData(prev => ({ ...prev, mood: "" }));
                            }}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                  ) : (
                      <div className="flex">
                        <Select
                            value={memoryData.mood || ""}
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setShowCustomMoodInput(true);
                              } else {
                                setMemoryData({...memoryData, mood: value});
                              }
                            }}
                        >
                          <SelectTrigger className={`${getBgColor()} ${getBorderColor()} flex-grow`}>
                            <SelectValue placeholder="Select a mood" />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedMoods.map((mood) => (
                                <SelectItem key={mood} value={mood} className="cursor-pointer">{mood}</SelectItem>
                            ))}
                            <SelectItem value="custom" className="cursor-pointer">
                          <span className="flex items-center">
                            <PlusCircle className="h-4 w-4 mr-2" /> Custom Mood
                          </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  )}
                </div>

                <div>
                  <label className={`text-sm ${getLabelColor()} mb-1 block`}>Activity/Memory Type</label>
                  {showCustomActivityInput ? (
                      <div className="relative">
                        <Input
                            value={customActivity}
                            onChange={handleCustomActivityChange}
                            placeholder="Enter activity/memory type"
                            className={`${getBgColor()} ${getBorderColor()}`}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => {
                              setShowCustomActivityInput(false);
                              setMemoryData(prev => ({ ...prev, activity: "" }));
                            }}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                  ) : (
                      <div className="flex">
                        <Select
                            value={memoryData.activity || ""}
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setShowCustomActivityInput(true);
                              } else {
                                setMemoryData({...memoryData, activity: value});
                              }
                            }}
                        >
                          <SelectTrigger className={`${getBgColor()} ${getBorderColor()} flex-grow`}>
                            <SelectValue placeholder="Select an activity" />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedActivities.map((activity) => (
                                <SelectItem key={activity} value={activity} className="cursor-pointer">{activity}</SelectItem>
                            ))}
                            <SelectItem value="custom" className="cursor-pointer">
                          <span className="flex items-center">
                            <PlusCircle className="h-4 w-4 mr-2" /> Custom Activity
                          </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="note" className="space-y-4 mt-4">
              <div>
                <label className={`text-sm ${getLabelColor()} mb-1 block`}>Memory Note</label>
                <Textarea
                    value={memoryData.note || ""}
                    onChange={(e) => setMemoryData({...memoryData, note: e.target.value})}
                    placeholder="Share your memory about this song (up to 500 characters)..."
                    maxLength={500}
                    className={`h-32 ${getBgColor()} ${getBorderColor()}`}
                />
                <div className="text-xs text-right mt-1 text-gray-400">
                  {(memoryData.note?.length || 0)}/500 characters
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photo" className="space-y-4 mt-4">
              <div>
                <label className={`text-sm ${getLabelColor()} mb-1 block`}>Memory Photo</label>

                {previewUrl ? (
                    <div className="relative mb-4 border rounded-md overflow-hidden">
                      <img
                          src={previewUrl}
                          alt="Memory preview"
                          className="w-full max-h-64 object-cover"
                      />
                      <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                          type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                ) : (
                    <div className={`border ${getBorderColor()} rounded-md p-6 text-center`}>
                      <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-4">Upload a photo for this memory</p>
                      <div className="flex justify-center">
                        <label className="cursor-pointer">
                          <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileSelect}
                          />
                          <div
                              className="py-2 px-4 rounded-md"
                              style={getButtonColors()}
                          >
                            Choose Image
                          </div>
                        </label>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">Max size: 3MB</p>
                    </div>
                )}
              </div>
            </TabsContent>

            {additionalTabsContent}
          </Tabs>

          <DialogFooter className="flex justify-between gap-2 mt-4">
            <Button
                variant="ghost"
                onClick={onClose}
                className={`hover:${getBgColor()}`}
            >
              Cancel
            </Button>
            <Button
                onClick={handleSave}
                disabled={isUploading}
                className="shadow-lg hover:shadow-xl transition-all"
                style={getButtonColors()}
            >
              {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
              ) : (
                  initialMemoryData ? 'Update Memory' : 'Save Memory'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default MemoryForm;
