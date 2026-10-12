import { supabase, isSupabaseConfigured } from './supabase';
import { User } from '@supabase/supabase-js';
import { validateUsername, validateEmail, validatePassword } from '../lib/validation';

export interface UserProfile {
  id: string;
  username: string;
  isGuest: boolean;
  email?: string;
  avatar?: string;
  gamesPlayed?: number;
  gamesWon?: number;
}

const GUEST_ID_KEY = 'triple_loop_guest_id';
const NICKNAME_KEY = 'triple_loop_nickname';
const AVATAR_KEY = 'triple_loop_avatar';

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
 * Gets currently saved avatar crest
 */
export function getSavedAvatar(): string {
  return localStorage.getItem(AVATAR_KEY) || 'crown';
}

/**
 * Saves avatar crest to localStorage
 */
export function saveAvatar(avatar: string): void {
  const trimmed = avatar.trim();
  if (trimmed) {
    localStorage.setItem(AVATAR_KEY, trimmed);
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
          const avatar = user.user_metadata?.avatar || getSavedAvatar();
          return {
            id: user.id,
            username,
            avatar,
            isGuest: false,
            email: user.email,
          };
        }
      } catch (err) {
        console.warn('Auth check failed:', err);
      }
    }

    // Check for locally activated scholar profile (e.g. when bypassing email rate limit)
    const localScholar = localStorage.getItem('triple_loop_scholar_profile');
    if (localScholar) {
      try {
        const parsed = JSON.parse(localScholar);
        if (parsed && parsed.username) {
          return {
            ...parsed,
            avatar: parsed.avatar || getSavedAvatar(),
          };
        }
      } catch {
        // ignore parse error
      }
    }

    // Return guest profile
    return {
      id: getOrCreateGuestId(),
      username: getSavedNickname(),
      avatar: getSavedAvatar(),
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
  async signUp(
    email: string,
    password: string,
    username: string,
    avatar?: string
  ): Promise<{ user: User | null; session?: any; error?: string }> {
    const cleanUsername = username.trim();

    const usernameCheck = validateUsername(cleanUsername);
    if (!usernameCheck.isValid) {
      return { user: null, error: usernameCheck.error };
    }

    const emailCheck = validateEmail(email.trim());
    if (!emailCheck.isValid) {
      return { user: null, error: emailCheck.error };
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return { user: null, error: passwordCheck.error };
    }

    const chosenAvatar = avatar || getSavedAvatar();
    saveAvatar(chosenAvatar);

    if (!isSupabaseConfigured()) {
      return { user: null, error: 'Supabase credentials not configured in .env' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
          avatar: chosenAvatar,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    saveNickname(cleanUsername);

    // Upsert to profiles table safely with resilient column fallback
    if (data.user) {
      try {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          username: cleanUsername,
          avatar: chosenAvatar,
          avatar_url: chosenAvatar,
          is_guest: false,
        });

        // If PostgREST returned PGRST204 (avatar column not yet added to profiles in Supabase), fallback gracefully
        if (profileError && profileError.code === 'PGRST204') {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: cleanUsername,
            is_guest: false,
          });
        }
      } catch (profileErr) {
        // Non-blocking: avatar and username are already stored in Supabase auth user_metadata
        console.warn('Profiles table sync deferred:', profileErr);
      }
    }

    return { user: data.user, session: data.session };
  },

  /**
   * Activates a local scholar profile to bypass Supabase email rate limits
   */
  createLocalScholar(username: string, email: string, avatar?: string): UserProfile {
    const chosenAvatar = avatar || getSavedAvatar();
    const profile: UserProfile = {
      id: generateUUID(),
      username,
      email,
      avatar: chosenAvatar,
      isGuest: false,
    };
    saveNickname(username);
    saveAvatar(chosenAvatar);
    localStorage.setItem('triple_loop_scholar_profile', JSON.stringify(profile));
    return profile;
  },

  /**
   * Signs out current user and switches back to guest
   */
  async signOut(): Promise<void> {
    localStorage.removeItem('triple_loop_scholar_profile');
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
        const avatar = session.user.user_metadata?.avatar || getSavedAvatar();
        callback({
          id: session.user.id,
          username,
          avatar,
          isGuest: false,
          email: session.user.email,
        });
      } else {
        callback({
          id: getOrCreateGuestId(),
          username: getSavedNickname(),
          avatar: getSavedAvatar(),
          isGuest: true,
        });
      }
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
