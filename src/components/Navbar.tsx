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
          <img
            src="/logo.png"
            alt="Triple Loop"
            className="h-8 sm:h-9 w-auto object-contain dark:invert transition-transform group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-display font-bold text-lg tracking-[0.16em] text-[var(--text-primary)] transition-colors">
                TRIPLE LOOP
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-display tracking-widest px-2 py-0.5 rounded border bg-[#B88931]/10 text-[#B88931] border-[#B88931]/30 dark:bg-[#8CA98F]/15 dark:text-[#8CA98F] dark:border-[#8CA98F]/30">
                Vol. I
              </span>
            </div>
            <p className="text-[11px] font-body text-[var(--text-muted)] italic hidden md:block -mt-0.5">
              Three marks. One board. Never stop thinking.
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
