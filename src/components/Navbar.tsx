import React from 'react';
import { Volume2, VolumeX, Moon, Sun, User, Settings, HelpCircle } from 'lucide-react';
import { UserProfile } from '../services/auth';

interface NavbarProps {
  profile: UserProfile;
  isMuted: boolean;
  isDark: boolean;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  isMuted,
  isDark,
  onToggleSound,
  onToggleTheme,
  onOpenAuth,
  onOpenSettings,
  onOpenHowToPlay,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/5 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 group text-left focus-ring rounded-lg p-1 transition-transform active:scale-95"
          aria-label="Triple Loop Home"
        >
          <img
            src="/logo.png"
            alt="Triple Loop"
            className="h-8 sm:h-9 w-auto object-contain dark:invert transition-transform group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                TRIPLE LOOP
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block font-medium -mt-0.5">
              Three marks. One board.
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rules / How to play */}
          <button
            onClick={onOpenHowToPlay}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus-ring"
            title="How to Play"
            aria-label="How to play rules"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus-ring"
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-500 dark:text-rose-400" /> : <Volume2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus-ring"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus-ring"
            title="Game Settings"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Profile / Nickname Badge */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 ml-1 sm:ml-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all focus-ring text-left"
            aria-label={`Profile: ${profile.username}`}
          >
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                {profile.username}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {profile.isGuest ? 'Guest' : 'Account'}
              </div>
            </div>
            <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 sm:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
};
