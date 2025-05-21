
/**
 * Authentication related type definitions
 */

/**
 * User profile information stored in Supabase
 */
export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  is_artist: boolean | null;
}

/**
 * Authentication context value type
 */
export interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<any>;
  updateProfile: (updates: { full_name?: string; website?: string; avatar_url?: string; bio?: string; is_artist?: boolean }) => Promise<void>;
  getProfile: () => Promise<UserProfile | null>;
}
