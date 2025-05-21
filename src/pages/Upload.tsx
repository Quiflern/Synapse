import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import UploadForm from "@/components/music/UploadForm";

/**
 * Upload Page - Allows users to upload music to their library
 *
 * This page contains a form for uploading tracks and associated metadata
 */
const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold mb-6">Upload Music</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload a Track</CardTitle>
          <CardDescription>
            Share your music with the Synapse community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm onClose={() => navigate("/app/library")} isOpen={false} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Upload;
