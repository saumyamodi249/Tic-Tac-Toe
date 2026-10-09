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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl text-left space-y-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus-ring"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Game Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personalize your game experience</p>
          </div>
        </div>

        {/* Settings Options */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              )}
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Audio & Sound FX</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Satisfying dynamic synthesized clicks and cues</p>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors focus-ring ${
                isMuted
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                  : 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              }`}
            >
              {isMuted ? 'Muted' : 'Enabled'}
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-indigo-500 dark:text-sky-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              )}
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Appearance</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Dark aesthetic or Clean light theme</p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs transition-colors focus-ring"
            >
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          {/* Reset Local Session */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Reset Guest Data</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Clear cached guest ID and nickname</p>
              </div>
            </div>
            <button
              onClick={onResetSession}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 font-bold text-xs transition-colors focus-ring"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/20 focus-ring"
        >
          Done
        </button>
      </div>
    </div>
  );
};
