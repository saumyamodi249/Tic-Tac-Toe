import React from 'react';
import { X, Sparkles, Repeat, Trophy, ShieldAlert } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1714]/60 dark:bg-[#0E1410]/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[var(--bg-modal)] border-2 border-[var(--border-color)] shadow-2xl text-left space-y-6 my-8 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--btn-bg)] transition-colors focus-ring"
          aria-label="Close how to play"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-medium text-[var(--text-primary)] tracking-tight">
              The Strategic Codex
            </h2>
            <p className="text-xs font-body text-[var(--text-muted)] italic">
              Three marks. One board. Never stop thinking.
            </p>
          </div>
        </div>

        {/* Rules Cards */}
        <div className="space-y-3.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {/* Rule I */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex gap-3.5 items-start shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] font-display flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-[var(--border-color)]">
              I
            </div>
            <div>
              <h3 className="font-heading font-medium text-base text-[var(--text-primary)] mb-0.5">Maximum Three Marks</h3>
              <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
                Unlike ordinary games, each tactician may command at most{' '}
                <strong className="text-[var(--accent-primary)] font-semibold">three active marks</strong> upon the 3×3 field at any given moment.
              </p>
            </div>
          </div>

          {/* Rule II */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--accent-primary)]/40 flex gap-3.5 items-start shadow-xs relative overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-[#B88931]/15 text-[#B88931] dark:bg-[#8CA98F]/20 dark:text-[#8CA98F] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
              <Repeat className="w-4 h-4 animate-spin [animation-duration:12s]" />
            </div>
            <div>
              <h3 className="font-heading font-medium text-base text-[var(--text-primary)] mb-0.5 flex items-center gap-2">
                <span>The Triple Loop Mechanic</span>
                <span className="text-[9px] uppercase font-display tracking-widest px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold">Core</span>
              </h3>
              <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
                Upon inscribing your <strong className="text-[var(--text-primary)] font-semibold">4th mark</strong>, your{' '}
                <strong className="text-[var(--accent-primary)] font-semibold">oldest active mark (I)</strong> instantly vanishes into memory before the new mark takes form.
              </p>
            </div>
          </div>

          {/* Rule III */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex gap-3.5 items-start shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-[#8B2635]/15 text-[#8B2635] dark:bg-[#D4846A]/20 dark:text-[#D4846A] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-[#8B2635]/20 dark:border-[#D4846A]/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-medium text-base text-[var(--text-primary)] mb-0.5">Victory Alignment</h3>
              <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
                Align three marks in rank, file, or diagonal. Win evaluation is calculated strictly on the resulting board after mark displacement has finalized.
              </p>
            </div>
          </div>

          {/* Rule IV */}
          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex gap-3.5 items-start shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] font-display flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 border border-[var(--border-color)]">
              IV
            </div>
            <div>
              <h3 className="font-heading font-medium text-base text-[var(--text-primary)] mb-0.5">No Inevitable Deadlocks</h3>
              <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed">
                Because marks cycle perpetually, stalemates are extinguished. The contest continues until triumph is seized or both sides agree to an accord.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Tip */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping flex-shrink-0" />
          <span className="font-body italic">
            Watch for the <strong className="font-display not-italic text-[var(--accent-primary)] font-semibold">"I" insignia</strong> on the board indicating which mark will vanish on the next move.
          </span>
        </div>

        {/* Got It Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl brass-gradient dark:bg-[#8CA98F] dark:text-[#131914] font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-md focus-ring"
        >
          Understood, Open the Board
        </button>
      </div>
    </div>
  );
};
