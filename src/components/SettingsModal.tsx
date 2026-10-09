import React from 'react';
import { X, Volume2, VolumeX, Moon, Sun, Settings, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  isMuted: boolean;
  isDark: boolean;
  onClose: () => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onResetSession: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  isMuted,
  isDark,
  onClose,
  onToggleSound,
  onToggleTheme,
  onResetSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1714]/60 dark:bg-[#0E1410]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[var(--bg-modal)] border-2 border-[var(--border-color)] shadow-2xl text-left space-y-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-bg)] transition-colors focus-ring"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center shadow-sm">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-medium text-[var(--text-primary)] tracking-tight">Hall Settings</h2>
            <p className="text-xs font-body text-[var(--text-muted)] italic">Personalize your tactical study</p>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)]">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
            <div className="flex items-center gap-3">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-[#8B2635] dark:text-[#D4846A]" />
              ) : (
                <Volume2 className="w-5 h-5 text-[#B88931] dark:text-[#8CA98F]" />
              )}
              <div>
                <p className="font-heading font-medium text-base text-[var(--text-primary)]">Audio Resonances</p>
                <p className="text-[11px] font-body text-[var(--text-muted)] italic">Synthesized acoustic cues</p>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3.5 py-1.5 rounded-lg font-display text-xs tracking-wider uppercase transition-all focus-ring ${
                isMuted
                  ? 'border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--text-primary)]'
                  : 'brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-semibold'
              }`}
            >
              {isMuted ? 'Muted' : 'Resonating'}
            </button>
          </div>

          {/* Theme Toggle: Academia Light vs Botanical Dark */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-[#8CA98F]" />
              ) : (
                <Sun className="w-5 h-5 text-[#B88931]" />
              )}
              <div>
                <p className="font-heading font-medium text-base text-[var(--text-primary)]">Aesthetic Paradigm</p>
                <p className="text-[11px] font-body text-[var(--text-muted)] italic">
                  {isDark ? 'Botanical Night Conservatory' : 'Academia Classical Library'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] font-display text-xs tracking-wider uppercase transition-all focus-ring shadow-xs"
            >
              {isDark ? 'Botanical' : 'Academia'}
            </button>
          </div>

          {/* Reset Local Session */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-[#8B2635] dark:text-[#D4846A]" />
              <div>
                <p className="font-heading font-medium text-base text-[var(--text-primary)]">Clear Ledger</p>
                <p className="text-[11px] font-body text-[var(--text-muted)] italic">Erase cached guest pseudonym</p>
              </div>
            </div>
            <button
              onClick={onResetSession}
              className="px-3.5 py-1.5 rounded-lg border border-[#8B2635]/30 bg-[#8B2635]/10 hover:bg-[#8B2635]/20 text-[#8B2635] dark:border-[#D4846A]/30 dark:bg-[#D4846A]/10 dark:text-[#D4846A] font-display text-xs tracking-wider uppercase transition-colors focus-ring"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring"
        >
          Confirm & Return
        </button>
      </div>
    </div>
  );
};
