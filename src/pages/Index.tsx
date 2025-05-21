import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Headphones, Heart, Music } from "lucide-react";
import { FeatureCard } from "@/components/ui/card-hover-effect";
import { Link } from "react-router-dom";

/**
 * Index - Landing page for the Synapse application
 *
 * @returns {JSX.Element} The Index page component
 */
const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with background animation centered */}
      <HeroSection />

      {/* Main Content */}
      <main className="flex-1">
        {/* Features Section */}
        <section className="py-16 bg-black/30 theme-light:bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 theme-light:text-gray-800">
                Features
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto theme-light:text-gray-600">
                Advanced tools to connect your music and memories for a deeper
                listening experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                title="Music Library"
                description="Organize and explore your music collection with powerful browsing and filtering tools."
                icon={<Music className="h-6 w-6 text-electric" />}
                className="theme-light:bg-white theme-light:shadow-md theme-light:border theme-light:border-gray-200"
              />
              <FeatureCard
                title="Memory Association"
                description="Connect personal memories to your music and relive special moments through sound."
                icon={<Heart className="h-6 w-6 text-electric" />}
                className="theme-light:bg-white theme-light:shadow-md theme-light:border theme-light:border-gray-200"
              />
              <FeatureCard
                title="Advanced Playback"
                description="Enhanced music player with visualization, sleep timer, and personalized playlists."
                icon={<Headphones className="h-6 w-6 text-electric" />}
                className="theme-light:bg-white theme-light:shadow-md theme-light:border theme-light:border-gray-200"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-black/20 theme-light:bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 theme-light:text-gray-800">
                How It Works
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto theme-light:text-gray-600">
                Create a personalized journey through your music and memories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left side - Music Visualization Placeholder */}
              <div className="glass-panel rounded-xl overflow-hidden theme-light:border theme-light:border-gray-200 theme-light:shadow-md">
                <div className="h-[400px] relative bg-gradient-to-br from-electric/20 to-cyber/20 flex items-center justify-center">
                  <div className="text-center">
                    <Music className="h-16 w-16 mx-auto mb-4 text-electric" />
                    <h3 className="text-xl font-bold">
                      Interactive Music Experience
                    </h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                      Connect your music with memories for a richer listening
                      experience
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Steps */}
              <div className="relative">
                <div className="hidden md:block absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-electric/10 via-electric/30 to-electric/10"></div>

                <div className="space-y-8 ml-0 md:ml-8">
                  <StepCard
                    number="01"
                    color="text-electric"
                    title="Add Your Music"
                    description="Import your music collection or connect to your favorite streaming services."
                  />
                  <StepCard
                    number="02"
                    color="text-neon"
                    title="Create Memories"
                    description="Add personal memories, photos, and details to tracks that matter to you."
                  />
                  <StepCard
                    number="03"
                    color="text-cyber"
                    title="Explore Your Timeline"
                    description="Browse your music-memory connections through an interactive timeline."
                  />
                  <StepCard
                    number="04"
                    color="text-electric"
                    title="Share Your Journey"
                    description="Create playlists and memory collections to share with friends and family."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="py-16 bg-black/30 theme-light:bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <h2 className="text-3xl font-bold theme-light:text-gray-800">
                Recent Music Activity
              </h2>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="mt-4 md:mt-0 theme-light:border-gray-300 theme-light:text-gray-800"
                >
                  View Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden theme-light:bg-white theme-light:shadow-md theme-light:border theme-light:border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 theme-light:border-gray-200">
                    <th className="text-left py-5 px-6 theme-light:text-gray-800">
                      Track
                    </th>
                    <th className="text-left py-5 px-6 theme-light:text-gray-800">
                      Artist
                    </th>
                    <th className="text-left py-5 px-6 theme-light:text-gray-800">
                      Memory
                    </th>
                    <th className="text-left py-5 px-6 theme-light:text-gray-800">
                      Time
                    </th>
                    <th className="text-right py-5 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  <RecentActivityRow
                    track="Bohemian Rhapsody"
                    artist="Queen"
                    type="Road Trip"
                    color="electric"
                    time="5 mins ago"
                  />
                  <RecentActivityRow
                    track="Hotel California"
                    artist="Eagles"
                    type="Summer Party"
                    color="neon"
                    time="12 mins ago"
                  />
                  <RecentActivityRow
                    track="Wonderwall"
                    artist="Oasis"
                    type="First Date"
                    color="cyber"
                    time="32 mins ago"
                  />
                  <RecentActivityRow
                    track="Dreams"
                    artist="Fleetwood Mac"
                    type="College Days"
                    color="warning"
                    time="45 mins ago"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-black/20 to-black/40 theme-light:from-gray-100 theme-light:to-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 theme-light:text-gray-800">
              Start Your Musical Memory Journey Today
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8 theme-light:text-gray-600">
              Get access to powerful music organization tools, memory linking
              features, and an enhanced listening experience.
            </p>
            <Link to="/library">
              <Button
                size="lg"
                className="bg-electric hover:bg-electric/90 text-white rounded-full px-8 group"
              >
                Explore Library
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

// Helper components for the landing page
const StepCard = ({
  number,
  title,
  description,
  color,
}: {
  number: string;
  title: string;
  description: string;
  color: string;
}) => {
  return (
    <div className="relative">
      <div className="glass-card p-6 relative z-10 h-full flex flex-col md:flex-row md:items-center theme-light:bg-white theme-light:shadow-md theme-light:border theme-light:border-gray-200">
        <div className="mb-4 md:mb-0 flex justify-center md:justify-start md:mr-4">
          <div
            className={`bg-black/40 ${color} font-mono text-2xl p-3 rounded-lg w-14 h-14 flex items-center justify-center theme-light:bg-gray-100`}
          >
            {number}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-3 theme-light:text-gray-800">
            {title}
          </h3>
          <p className="text-gray-400 text-sm theme-light:text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const RecentActivityRow = ({
  track,
  artist,
  type,
  color,
  time,
}: {
  track: string;
  artist: string;
  type: string;
  color: string;
  time: string;
}) => {
  const getColorDot = () => {
    switch (color) {
      case "warning":
        return "bg-warning";
      case "electric":
        return "bg-electric";
      case "cyber":
        return "bg-cyber";
      case "neon":
        return "bg-neon";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors theme-light:border-gray-100 theme-light:hover:bg-gray-50">
      <td className="py-5 px-6 flex items-center theme-light:text-gray-800">
        <span
          className={`inline-block w-2 h-2 rounded-full ${getColorDot()} mr-3`}
        ></span>
        {track}
      </td>
      <td className="py-5 px-6 theme-light:text-gray-800">{artist}</td>
      <td className={`py-5 px-6 text-${color} font-medium`}>{type}</td>
      <td className="py-5 px-6 text-gray-400 theme-light:text-gray-500">
        {time}
      </td>
      <td className="py-5 px-6 text-right">
        <Link to={`/memories`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-electric hover:text-electric/80"
          >
            View
          </Button>
        </Link>
      </td>
    </tr>
  );
};

export default Index;
