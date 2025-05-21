import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import LandingLayout from "./components/layout/LandingLayout";
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library.tsx";
import NowPlaying from "./pages/NowPlaying";
import Memories from "./pages/Memories";
import Playlists from "./pages/Playlists";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import { Auth } from "./pages/Auth";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import PlayQueue from "./pages/PlayQueue.tsx";
import { ThemedToaster } from "./components/ui/themed-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { PlayerProvider } from "./context/PlayerContext";
import { LibraryProvider } from "./context/LibraryContext";
import { MemoryProvider } from "./context/MemoryContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import { SleepTimerProvider } from "./context/SleepTimerContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

// Private route component that redirects unauthorized users
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show nothing (prevents flash)
  if (isLoading) {
    return null;
  }

  // If not authenticated, redirect to auth page with return URL
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected content
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LibraryProvider>
          <PlayerProvider>
            <MemoryProvider>
              <AnalyticsProvider>
                <SleepTimerProvider>
                  <Routes>
                    {/* Landing pages routes */}
                    <Route element={<LandingLayout />}>
                      <Route index element={<Landing />} />
                      <Route path="/pricing" element={<Pricing />} />
                    </Route>

                    {/* App routes with sidebar - protected with PrivateRoute */}
                    <Route
                      path="/app"
                      element={
                        <PrivateRoute>
                          <AppLayout />
                        </PrivateRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="library" element={<Library />} />
                      <Route path="playlists" element={<Playlists />} />
                      <Route
                        path="playlists/:playlistId"
                        element={<Playlists />}
                      />
                      <Route path="now-playing" element={<NowPlaying />} />
                      <Route path="queue" element={<PlayQueue />} />
                      <Route path="memories" element={<Memories />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="upload" element={<Upload />} />
                      <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Auth page */}
                    <Route path="/auth" element={<Auth />} />

                    {/* 404 page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  {/* Add a themedToaster component at the root level */}
                  <ThemedToaster />
                </SleepTimerProvider>
              </AnalyticsProvider>
            </MemoryProvider>
          </PlayerProvider>
        </LibraryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
