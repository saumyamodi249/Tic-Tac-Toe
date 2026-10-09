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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-navbar)] backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 group text-left focus-ring rounded-lg p-1 transition-transform active:scale-95"
          aria-label="Triple Loop Home"
        >
          {/* Concentric Triple Loop Squircle Badge */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#38bdf8] to-[#fb7185] p-[1.5px] shadow-md shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-all flex-shrink-0">
            <div className="w-full h-full bg-[#090e17] rounded-[10px] flex items-center justify-center relative overflow-hidden">
              {/* Outer Loop */}
              <div className="absolute w-[24px] h-[24px] border-2 border-[#38bdf8] rounded-full animate-spin [animation-duration:9s]" />
              {/* Middle Loop */}
              <div className="absolute w-[16px] h-[16px] border-2 border-[#fb7185] rounded-full animate-spin [animation-duration:6s] [animation-direction:reverse]" />
              {/* Center Dot */}
              <div className="w-2 h-2 bg-[#38bdf8] rounded-full shadow-[0_0_8px_#38bdf8] z-10" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-[#38bdf8]">TRIPLE </span>
                <span className="text-[#fb7185]">LOOP</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded border border-[#38bdf8]/35 bg-[#38bdf8]/10 text-[#38bdf8] font-bold">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] hidden md:block font-medium -mt-0.5">
              Three marks. One board.
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rules / How to play */}
          <button
            onClick={onOpenHowToPlay}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-bg)] border border-transparent hover:border-[var(--border-color)] transition-all focus-ring"
            title="How to Play"
            aria-label="How to play rules"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-bg)] border border-transparent hover:border-[var(--border-color)] transition-all focus-ring"
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B2635] dark:text-[#D4846A]" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#B88931] dark:text-[#8CA98F]" />
            )}
          </button>

          {/* Theme Toggle (Academia Light vs Botanical Dark) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-bg)] border border-transparent hover:border-[var(--border-color)] transition-all focus-ring"
            title={isDark ? 'Switch to Academia Light' : 'Switch to Botanical Dark'}
            aria-label="Toggle aesthetic theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#B88931] hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#8CA98F] hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-bg)] border border-transparent hover:border-[var(--border-color)] transition-all focus-ring"
            title="Game Settings"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* User Profile / Nickname Badge */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2.5 ml-1 sm:ml-2 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent-primary)] transition-all shadow-sm focus-ring text-left"
            aria-label={`Profile: ${profile.username}`}
          >
            <div className="w-6 h-6 rounded-lg bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] font-display flex items-center justify-center font-bold text-xs">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-heading font-medium text-[var(--text-primary)] truncate max-w-[100px]">
                {profile.username}
              </div>
              <div className="text-[10px] font-body text-[var(--text-muted)] italic">
                {profile.isGuest ? 'Scholar / Guest' : 'Member'}
              </div>
            </div>
            <User className="w-3.5 h-3.5 text-[var(--text-muted)] sm:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
};
