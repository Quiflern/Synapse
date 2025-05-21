import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, UserProfile } from "@/types/auth";

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize authentication state
  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // After the session is updated, fetch the user's profile in a separate operation
      if (session?.user) {
        setTimeout(() => {
          getProfile().then((profile) => setProfile(profile));
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      // Fetch initial profile if user is logged in
      if (session?.user) {
        getProfile().then((profile) => setProfile(profile));
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with magic link
  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    } else {
      toast({
        title: "Check your email",
        description:
          "We sent you a login link. Be sure to check your spam folder.",
      });
    }
  };

  // Sign in with email and password
  const signInWithPassword = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${data.user.email}`,
      });
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
      });
      setUser(null);
      setProfile(null);
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    options: { data?: { [key: string]: any } } = {},
  ) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      throw error;
    }

    toast({
      title: "Sign up successful",
      description: data.user
        ? "Welcome to Synapse! Please verify your email."
        : "Please check your email for a verification link.",
    });

    return data.user;
  };

  // Get user profile
  const getProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Update user profile
  const updateProfile = async (
    updates: Partial<UserProfile>,
  ): Promise<void> => {
    if (!user) {
      throw new Error("Not authenticated");
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Update local profile state
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    profile,
    isLoading,
    signIn,
    signInWithPassword,
    signOut,
    signUp,
    getProfile,
    updateProfile,
  };
}
