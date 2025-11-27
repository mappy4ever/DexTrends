/**
 * AuthContext - User Authentication with Supabase
 * Provides login, signup, logout functionality and user state management
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: 'google' | 'github' | 'discord') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: false, // Start with false to not block rendering
    initialized: true // Start as initialized to not block rendering
  });

  // Check if we're on the client
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet, that's okay
        logger.debug('Profile fetch returned no data', { userId, error: error.message });
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Error fetching profile', { error });
      return null;
    }
  }, []);

  // Create profile for new user
  const createProfile = useCallback(async (user: User, username?: string): Promise<UserProfile | null> => {
    try {
      const profile: Partial<UserProfile> = {
        id: user.id,
        email: user.email || '',
        username: username || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();

      if (error) {
        logger.error('Error creating profile', { error: error.message });
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Error in createProfile', { error });
      return null;
    }
  }, []);

  // Initialize auth state - only on client
  useEffect(() => {
    // Skip on server side
    if (!isClient) return;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Error getting session', { error: error.message });
        }

        if (mounted && session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            initialized: true
          });
        } else if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true
          }));
        }
      } catch (error) {
        logger.error('Error initializing auth', { error });
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true
          }));
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const authListener = supabase.auth.onAuthStateChange(
        async (event, session) => {
          logger.info('Auth state changed', { event, hasSession: !!session });

          if (!mounted) return;

          if (event === 'SIGNED_IN' && session?.user) {
            let profile = await fetchProfile(session.user.id);

            // Create profile if it doesn't exist
            if (!profile) {
              profile = await createProfile(session.user);
            }

            setState({
              user: session.user,
              profile,
              session,
              loading: false,
              initialized: true
            });
          } else if (event === 'SIGNED_OUT') {
            setState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              initialized: true
            });
          } else if (event === 'TOKEN_REFRESHED' && session) {
            setState(prev => ({
              ...prev,
              session,
              loading: false
            }));
          }
        }
      );
      subscription = authListener.data.subscription;
    } catch (error) {
      logger.error('Error setting up auth listener', { error });
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isClient, fetchProfile, createProfile]);

  // Sign up with email and password
  const signUp = async (email: string, password: string, username?: string) => {
    setState(prev => ({ ...prev, loading: true }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0]
        }
      }
    });

    if (!error && data.user) {
      // Profile will be created by auth state change handler
      logger.info('User signed up successfully', { userId: data.user.id });
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error };
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.error('Sign in failed', { error: error.message });
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error };
  };

  // Sign in with OAuth provider
  const signInWithProvider = async (provider: 'google' | 'github' | 'discord') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      logger.error('OAuth sign in failed', { provider, error: error.message });
    }

    return { error };
  };

  // Sign out
  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Sign out failed', { error: error.message });
    }

    setState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      initialized: true
    });
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      logger.error('Password reset failed', { error: error.message });
    }

    return { error };
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refresh profile
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Refresh session
  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      logger.error('Session refresh failed', { error: error.message });
    }

    if (session) {
      setState(prev => ({ ...prev, session }));
    }
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Safe hook that doesn't throw if provider is missing (for components like Navbar)
export const useAuthSafe = (): AuthContextType | null => {
  const context = useContext(AuthContext);
  return context ?? null;
};

// Helper hook to check if user is authenticated
export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading, initialized } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (initialized && !loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading, initialized]);

  return { isAuthenticated: !!user, loading, shouldRedirect, redirectTo };
};
