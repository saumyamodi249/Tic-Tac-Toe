import { supabase, isSupabaseConfigured } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string;
  isGuest: boolean;
  email?: string;
  gamesPlayed?: number;
  gamesWon?: number;
}

const GUEST_ID_KEY = 'triple_loop_guest_id';
const NICKNAME_KEY = 'triple_loop_nickname';

/**
 * Generates a valid UUID v4 compliant string
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates the local guest identity
 */
export function getOrCreateGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

/**
 * Gets current saved nickname or a default guest name
 */
export function getSavedNickname(): string {
  let name = localStorage.getItem(NICKNAME_KEY);
  if (!name) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    name = `Tactician#${randomSuffix}`;
    localStorage.setItem(NICKNAME_KEY, name);
  }
  return name;
}

/**
 * Saves nickname to localStorage
 */
export function saveNickname(name: string): void {
  const trimmed = name.trim();
  if (trimmed) {
    localStorage.setItem(NICKNAME_KEY, trimmed);
  }
}

/**
 * Service to manage authentication and user profiles
 */
export const authService = {
  /**
   * Retrieves active profile (either authenticated Supabase user or guest)
   */
  async getCurrentProfile(): Promise<UserProfile> {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Player';
          return {
            id: user.id,
            username,
            isGuest: false,
            email: user.email,
          };
        }
      } catch (err) {
        console.warn('Auth check failed:', err);
      }
    }

    // Return guest profile
    return {
      id: getOrCreateGuestId(),
      username: getSavedNickname(),
      isGuest: true,
    };
  },

  /**
   * Signs in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Supabase credentials not configured in .env' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user?.user_metadata?.username) {
      saveNickname(data.user.user_metadata.username);
    }

    return { user: data.user };
  },

  /**
   * Signs up a new registered account
   */
  async signUp(email: string, password: string, username: string): Promise<{ user: User | null; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Supabase credentials not configured in .env' };
    }

    const cleanUsername = username.trim() || 'Player';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    saveNickname(cleanUsername);

    // Upsert to profiles table
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: cleanUsername,
        is_guest: false,
      });
    }

    return { user: data.user };
  },

  /**
   * Signs out current user and switches back to guest
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
  },

  /**
   * Listens to auth state changes
   */
  onAuthStateChange(callback: (profile: UserProfile) => void) {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Player';
        callback({
          id: session.user.id,
          username,
          isGuest: false,
          email: session.user.email,
        });
      } else {
        callback({
          id: getOrCreateGuestId(),
          username: getSavedNickname(),
          isGuest: true,
        });
      }
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
