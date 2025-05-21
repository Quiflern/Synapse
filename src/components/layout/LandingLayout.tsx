import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePlayer } from "@/context/PlayerContext";
import { PlayerControls } from "@/components/player/PlayerControls";

/**
 * LandingLayout - Layout component for the landing page
 *
 * Includes Navbar and Footer components that are only displayed on the landing page
 *
 * @returns {JSX.Element} The landing layout with navbar and footer
 */
const LandingLayout: React.FC = () => {
  const { currentTrack } = usePlayer();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Player controls if a track is playing */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <PlayerControls />
        </div>
      )}
    </div>
  );
};

export default LandingLayout;
