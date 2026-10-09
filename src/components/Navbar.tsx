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
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl dark:bg-slate-950/80 light:bg-white/80 light:border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 group text-left focus-ring rounded-lg p-1 transition-transform active:scale-95"
          aria-label="Triple Loop Home"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-rose-500 p-[1.5px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
              {/* Animated Mini Loops */}
              <div className="absolute w-6 h-6 border-2 border-sky-400/80 rounded-full animate-spin [animation-duration:8s]" />
              <div className="absolute w-4 h-4 border border-rose-400/80 rounded-full animate-spin [animation-duration:5s] [animation-direction:reverse]" />
              <div className="w-1.5 h-1.5 bg-sky-300 rounded-full z-10" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-slate-100 to-rose-400 bg-clip-text text-transparent">
                TRIPLE LOOP
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block font-medium -mt-0.5">
              Three marks. One board.
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rules / How to play */}
          <button
            onClick={onOpenHowToPlay}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors focus-ring"
            title="How to Play"
            aria-label="How to play rules"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors focus-ring"
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-sky-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors focus-ring"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors focus-ring"
            title="Game Settings"
            aria-label="Open settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Profile / Nickname Badge */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 ml-1 sm:ml-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all focus-ring text-left"
            aria-label={`Profile: ${profile.username}`}
          >
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                {profile.username}
              </div>
              <div className="text-[10px] text-slate-400">
                {profile.isGuest ? 'Guest' : 'Account'}
              </div>
            </div>
            <User className="w-3.5 h-3.5 text-slate-400 sm:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
};
